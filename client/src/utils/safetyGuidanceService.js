// Safety guidance service.
//
// SECURITY: previously called api.groq.com directly from the browser using
// VITE_GROQ_CHATBOT_API_KEY. The key is now server-side only; this talks to the
// server's /api/ai/chat proxy, which owns the safety system prompt.

import { API_BASE_URL } from './apiConfig';
import { reportApiFailure, reportNetworkFailure } from './apiError';

const NEWLINE = String.fromCharCode(10);

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
  const userPrompt = [
    `Question: ${payload?.question || 'Share travel safety guidance for my current route.'}`,
    '',
    'Context:',
    formatContextSummary(payload)
  ].join(NEWLINE);

  const url = `${API_BASE_URL}/api/ai/chat`;

  try {
    // The server owns the safety system prompt, the model and the limits.
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: 'safety',
          messages: [{ role: 'user', content: userPrompt }]
        })
      });
    } catch (networkError) {
      reportNetworkFailure(networkError, 'Safety assistant', url);
      return {
        success: false,
        error: 'Could not reach the safety assistant. Is the API server running?'
      };
    }

    if (!response.ok) {
      const reported = await reportApiFailure(response, 'Safety assistant', url);

      if (response.status === 429) {
        return {
          success: false,
          error: 'Safety assistant is busy. Please retry in a moment.',
          isRateLimit: true
        };
      }

      return {
        success: false,
        error: reported.message || `Safety assistant failed (${response.status}).`,
        detail: reported.detail,
        hint: reported.hint
      };
    }

    const data = await response.json().catch(() => ({}));

    const message = data?.message?.trim();
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
