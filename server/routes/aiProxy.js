// server/routes/aiProxy.js
// Server-side proxy for Groq chat completions.
//
// SECURITY: previously the browser called api.groq.com directly with
// `Authorization: Bearer <key>`, which put a live Groq key in the client bundle
// and in every user's DevTools network tab. The key now lives only here.
//
// The client may supply conversation turns, but NOT the system prompt, the
// model, or the sampling/limit parameters - those are fixed server-side so the
// endpoint cannot be repurposed into a general-purpose LLM gateway.

const express = require('express');
const rateLimit = require('express-rate-limit');

const { secrets } = require('../config/env');
const { safeError } = require('../middleware/security');
const HeritageSite = require('../models/HeritageSite');

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';

// Providers decommission models without warning - `llama-3.3-70b-versatile`
// was retired and started returning 404 (model_not_found), which surfaced as a
// 502 to users. Keep this overridable so the next retirement is a config change
// rather than a code change.
const GROQ_MODEL = (process.env.GROQ_MODEL || 'openai/gpt-oss-120b').trim();
const UPSTREAM_TIMEOUT_MS = 30000;

const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 8000;
const MAX_TOTAL_CHARS = 24000;

const HERITAGE_SYSTEM_PROMPT = `You are a knowledgeable and enthusiastic AI assistant specializing in Indian heritage sites, monuments, temples, forts, palaces, and UNESCO World Heritage locations.

Your expertise includes:
- Historical background and significance of heritage sites
- Architectural styles and features (Mughal, Dravidian, Indo-Islamic, etc.)
- Cultural and religious importance
- Construction dates, rulers, dynasties
- Visiting information and travel tips
- Conservation efforts and current status

When answering:
1. Be informative, engaging, and conversational
2. Provide specific historical details (dates, names, events)
3. Mention architectural elements and unique features
4. Share interesting facts and lesser-known stories
5. Suggest related sites when relevant
6. Keep responses concise but comprehensive (2-4 paragraphs)
7. Use emojis occasionally to make responses engaging 🏛️

Language Support:
- You can respond in multiple languages (English, Hindi, etc.)
- If a user writes in Hindi or another Indian language, respond in that language
- Always be respectful of cultural sensitivities

If asked about non-Indian sites, politely acknowledge and then redirect to Indian heritage topics.`;

const SAFETY_SYSTEM_PROMPT = `You are a calm tourist safety assistant. Give practical travel safety steps.
Keep answers short and actionable.
Do not invent emergency numbers.
When risk is high, prioritize immediate steps and nearest safe places.
If evacuation mode is active, provide a direct evacuation checklist.
Use plain English and numbered points.`;

const TRIP_PLANNER_SYSTEM_PROMPT = `You are an expert Indian travel planner. Respond with valid JSON only, no prose outside the JSON object.`;

// Each profile pins its own system prompt and generation limits.
//
// Token budgets are deliberately generous: the default model is a reasoning
// model whose internal reasoning tokens count against max_tokens. Budgets that
// were fine for a non-reasoning model get consumed by reasoning and return an
// EMPTY message, which looks like a broken API rather than a truncated one.
const PROFILES = {
  heritage: { systemPrompt: HERITAGE_SYSTEM_PROMPT, temperature: 0.7, maxTokens: 2000, topP: 0.9 },
  safety: { systemPrompt: SAFETY_SYSTEM_PROMPT, temperature: 0.4, maxTokens: 1500 },
  tripPlanner: {
    systemPrompt: TRIP_PLANNER_SYSTEM_PROMPT,
    temperature: 0.6,
    maxTokens: 4000,
    // The client parses this response as JSON, so constrain the model to it.
    jsonMode: true
  }
};

// Redacts anything key-shaped before an upstream detail is logged or returned.
function sanitizeDetail(text) {
  return String(text || '')
    .replace(/\b(gsk_|sk-)[A-Za-z0-9_-]{8,}/g, '$1<REDACTED>')
    .replace(/([?&](?:key|apikey|appid|api_key)=)[^&\s"']+/gi, '$1<REDACTED>')
    .slice(0, 400);
}

// AI calls are the most expensive thing an anonymous caller can trigger, so they
// get their own tighter budget on top of the global /api limiter.
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a moment and try again.' }
});

// Accepts only user/assistant turns of bounded size. Any client-supplied
// `system` message is dropped so the server prompt cannot be overridden.
function normalizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    return { error: 'messages must be an array' };
  }

  const cleaned = [];
  let totalChars = 0;

  for (const entry of rawMessages) {
    if (!entry || typeof entry !== 'object') continue;

    const role = entry.role === 'assistant' ? 'assistant' : 'user';
    const content = typeof entry.content === 'string' ? entry.content.trim() : '';

    if (!content) continue;
    if (content.length > MAX_MESSAGE_CHARS) {
      return { error: 'A message exceeds the maximum allowed length.' };
    }

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      return { error: 'Conversation payload is too large.' };
    }

    cleaned.push({ role, content });
  }

  if (cleaned.length === 0) {
    return { error: 'At least one non-empty message is required.' };
  }

  // Keep only the most recent turns.
  return { messages: cleaned.slice(-MAX_MESSAGES) };
}

// The heritage assistant is grounded with the site list from our database.
// This used to be fetched by the browser and appended to a client-side system
// prompt; it now happens here so the prompt stays server-owned. Cached because
// the list changes rarely.
let heritageContextCache = { text: '', expiresAt: 0 };
const HERITAGE_CONTEXT_TTL_MS = 10 * 60 * 1000;

async function getHeritageContext() {
  if (heritageContextCache.text && Date.now() < heritageContextCache.expiresAt) {
    return heritageContextCache.text;
  }

  try {
    const sites = await HeritageSite.find({}, 'name category').limit(50).lean();
    const sitesList = sites
      .map((site) => `${site.name} (${site.category})`)
      .join(', ');

    const text = sitesList
      ? `\n\nAvailable heritage sites in our database: ${sitesList}...\n\nWhen users ask about these specific sites, you can provide detailed information. For other Indian heritage sites, use your general knowledge.`
      : '';

    heritageContextCache = { text, expiresAt: Date.now() + HERITAGE_CONTEXT_TTL_MS };
    return text;
  } catch (err) {
    console.warn('Heritage context unavailable:', err.message || err);
    return '';
  }
}

const router = express.Router();

router.post('/chat', aiLimiter, async (req, res) => {
  if (!secrets.groqApiKey) {
    return safeError(res, 503, 'AI assistant is not configured on this server.');
  }

  const profileName = typeof req.body?.profile === 'string' ? req.body.profile : 'heritage';
  const profile = PROFILES[profileName];
  if (!profile) {
    return safeError(res, 400, 'Unknown AI profile.');
  }

  const { messages, error } = normalizeMessages(req.body?.messages);
  if (error) {
    return safeError(res, 400, error);
  }

  let systemPrompt = profile.systemPrompt;
  if (profileName === 'heritage') {
    systemPrompt += await getHeritageContext();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(GROQ_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secrets.groqApiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: profile.temperature,
        max_tokens: profile.maxTokens,
        ...(profile.topP ? { top_p: profile.topP } : {}),
        ...(profile.jsonMode ? { response_format: { type: 'json_object' } } : {}),
        stream: false
      })
    });

    if (!upstream.ok) {
      const rawBody = await upstream.text().catch(() => '');
      let upstreamCode = null;
      let upstreamMessage = rawBody;
      try {
        const parsed = JSON.parse(rawBody);
        upstreamCode = parsed?.error?.code || parsed?.error?.type || null;
        upstreamMessage = parsed?.error?.message || rawBody;
      } catch { /* non-JSON error body; use it as-is */ }

      const detail = sanitizeDetail(upstreamMessage);

      // Log the full picture server-side so the cause is diagnosable.
      console.error(
        `[AI] Groq ${upstream.status} (profile=${profileName}, model=${GROQ_MODEL})` +
        `${upstreamCode ? ` code=${upstreamCode}` : ''}: ${detail}`
      );

      if (upstream.status === 429) {
        return res.status(429).json({ error: 'RATE_LIMIT', detail });
      }

      // A decommissioned/invalid model is a configuration fault, not a transient
      // outage - say so explicitly instead of hiding it behind "unavailable".
      if (upstreamCode === 'model_not_found' || upstream.status === 404) {
        console.error(
          `[AI] Model "${GROQ_MODEL}" is unavailable on this Groq account. ` +
          `Set GROQ_MODEL in server/.env to a supported model ` +
          `(list them: GET https://api.groq.com/openai/v1/models).`
        );
        return res.status(503).json({
          error: `AI model "${GROQ_MODEL}" is not available on this account.`,
          detail,
          hint: 'Set GROQ_MODEL in server/.env to a model this account can use.'
        });
      }

      if (upstream.status === 401 || upstream.status === 403) {
        return res.status(503).json({
          error: 'AI assistant credentials were rejected by the provider.',
          detail,
          hint: 'Check GROQ_API_KEY in server/.env.'
        });
      }

      return res.status(502).json({ error: 'AI assistant is temporarily unavailable.', detail });
    }

    const data = await upstream.json();
    const choice = data?.choices?.[0];
    const message = choice?.message?.content;

    if (!message) {
      // Most often this means a reasoning model spent the whole token budget on
      // reasoning. Report that precisely rather than as a generic failure.
      const finish = choice?.finish_reason || 'unknown';
      console.error(
        `[AI] Empty completion (profile=${profileName}, model=${GROQ_MODEL}, ` +
        `finish_reason=${finish}, tokens=${JSON.stringify(data?.usage || {})})`
      );
      return res.status(502).json({
        error: 'AI assistant returned an empty response.',
        detail: `finish_reason=${finish}`,
        hint: finish === 'length'
          ? 'The token budget was exhausted (reasoning models consume max_tokens). Raise maxTokens for this profile.'
          : undefined
      });
    }

    return res.json({ success: true, message, usage: data.usage || null });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`[AI] Groq request timed out after ${UPSTREAM_TIMEOUT_MS}ms (model=${GROQ_MODEL})`);
      return res.status(504).json({ error: 'AI assistant timed out.', detail: `timeout after ${UPSTREAM_TIMEOUT_MS}ms` });
    }
    console.error(`[AI] Groq request failed (model=${GROQ_MODEL}):`, err.message || err);
    return res.status(502).json({
      error: 'AI assistant is temporarily unavailable.',
      detail: sanitizeDetail(err.message)
    });
  } finally {
    clearTimeout(timeoutId);
  }
});

// Diagnostic endpoint: reports whether the AI path is actually usable and which
// models this account can use. Exposes no secret - only the configured model
// name and the provider's public model list.
router.get('/status', async (req, res) => {
  if (!secrets.groqApiKey) {
    return res.status(503).json({
      configured: false,
      error: 'GROQ_API_KEY is not set in server/.env'
    });
  }

  try {
    const upstream = await fetch(GROQ_MODELS_URL, {
      headers: { Authorization: `Bearer ${secrets.groqApiKey}` }
    });

    if (!upstream.ok) {
      const detail = sanitizeDetail(await upstream.text().catch(() => ''));
      console.error(`[AI] /status: Groq models lookup returned ${upstream.status}: ${detail}`);
      return res.status(503).json({
        configured: true,
        keyValid: false,
        upstreamStatus: upstream.status,
        detail,
        hint: 'GROQ_API_KEY was rejected by the provider.'
      });
    }

    const data = await upstream.json();
    const available = (data?.data || []).map((m) => m.id).sort();
    const modelAvailable = available.includes(GROQ_MODEL);

    if (!modelAvailable) {
      console.error(
        `[AI] /status: configured GROQ_MODEL "${GROQ_MODEL}" is NOT in this account's model list.`
      );
    }

    return res.json({
      configured: true,
      keyValid: true,
      model: GROQ_MODEL,
      modelAvailable,
      availableModels: available,
      ...(modelAvailable ? {} : { hint: `Set GROQ_MODEL in server/.env to one of availableModels.` })
    });
  } catch (err) {
    console.error('[AI] /status check failed:', err.message || err);
    return res.status(502).json({ configured: true, error: 'Could not reach the AI provider.', detail: sanitizeDetail(err.message) });
  }
});

module.exports = router;
