const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SAFETY_SYSTEM_PROMPT = `You are a calm tourist safety assistant. Give practical travel safety steps.
Keep answers short and actionable.
Do not invent emergency numbers.
When risk is high, prioritize immediate steps and nearest safe places.
If evacuation mode is active, provide a direct evacuation checklist.
Use plain English and numbered points.`;

function formatContextSummary(payload) {
  const parts = [];

  if (payload?.userLocation) {
    parts.push(
      `User location: lat ${payload.userLocation.lat}, lon ${payload.userLocation.lon}`
    );
  }

  if (payload?.destination) {
    parts.push(`Destination: ${payload.destination.name || 'Unknown destination'}`);
  }

  if (payload?.preferredRoute) {
    parts.push(`Preferred route style: ${payload.preferredRoute}`);
  }

  if (payload?.weatherSummary) {
    parts.push(`Weather: ${payload.weatherSummary}`);
  }

  if (payload?.alertsSummary) {
    parts.push(`Alerts: ${payload.alertsSummary}`);
  }

  parts.push(`Emergency mode: ${payload?.emergencyMode ? 'ON' : 'OFF'}`);
  parts.push(`Evacuation mode: ${payload?.evacuationMode ? 'ON' : 'OFF'}`);

  return parts.join('\n');
}

export async function requestSafetyGuidance(payload) {
  const apiKey = import.meta.env.VITE_GROQ_CHATBOT_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Safety AI key not configured.'
    };
  }

  const userPrompt = [
    `Question: ${payload?.question || 'Share travel safety guidance for my current route.'}`,
    '',
    'Context:',
    formatContextSummary(payload)
  ].join('\n');

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 450,
        messages: [
          { role: 'system', content: SAFETY_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: 'Safety assistant is busy. Please retry in a moment.',
          isRateLimit: true
        };
      }

      return {
        success: false,
        error: data?.error?.message || `Safety assistant failed (${response.status}).`
      };
    }

    const message = data?.choices?.[0]?.message?.content?.trim();
    if (!message) {
      return {
        success: false,
        error: 'No response from safety assistant.'
      };
    }

    return {
      success: true,
      message
    };
  } catch {
    return {
      success: false,
      error: 'Network error while contacting safety assistant.'
    };
  }
}
