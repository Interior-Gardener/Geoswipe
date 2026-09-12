// Heritage chatbot service.
//
// SECURITY: this used to call api.groq.com directly from the browser with
// `Authorization: Bearer <VITE_GROQ_CHATBOT_API_KEY>`, which put a live Groq
// key in the client bundle and in every user's DevTools network tab. All Groq
// traffic now goes through the server, which holds the key. The system prompt
// also lives server-side so it cannot be overridden by a caller.

import { API_BASE_URL } from './apiConfig';
import { reportApiFailure, reportNetworkFailure } from './apiError';

// Usage tracking
let totalQueries = 0;
let lastQueryTime = null;

/**
 * Fetch list of heritage sites from the backend for context
 */
export async function fetchHeritageSitesContext() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/heritage-sites`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch heritage sites');
    }
    
    const sites = await response.json();
    
    // Create a concise list of sites with categories
    const sitesList = sites
      .slice(0, 50) // Limit to first 50 to avoid token overflow
      .map(site => `${site.name} (${site.category})`)
      .join(', ');
    
    const contextPrompt = `\n\nAvailable heritage sites in our database: ${sitesList}...\n\nWhen users ask about these specific sites, you can provide detailed information. For other Indian heritage sites, use your general knowledge.`;
    
    return contextPrompt;
  } catch (error) {
    console.warn('Could not fetch heritage sites context:', error);
    return ''; // Continue without database context
  }
}

/**
 * Send a chat message to Groq API
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Array of previous messages [{role, content}]
 * @returns {Promise<Object>} - API response with assistant's message
 */
export async function sendChatMessage(userMessage, conversationHistory = []) {
  // Track usage
  totalQueries++;
  lastQueryTime = new Date().toISOString();
  console.log(`📊 Chatbot Query #${totalQueries} at ${lastQueryTime}`);

  try {
    // Only conversation turns are sent. The system prompt, model and sampling
    // parameters are fixed server-side.
    const messages = [
      ...conversationHistory.slice(-15),
      { role: 'user', content: userMessage }
    ];

    const url = `${API_BASE_URL}/api/ai/chat`;

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: 'heritage', messages })
      });
    } catch (networkError) {
      throw reportNetworkFailure(networkError, 'Heritage chatbot', url);
    }

    if (!response.ok) {
      const reported = await reportApiFailure(response, 'Heritage chatbot', url);
      if (response.status === 429) {
        throw new Error('RATE_LIMIT');
      }
      throw reported;
    }

    const data = await response.json().catch(() => ({}));

    if (!data?.message) {
      throw new Error('No response from AI');
    }

    console.log('✅ Chatbot response received:', {
      tokens: data.usage?.total_tokens || 'N/A'
    });

    return {
      success: true,
      message: data.message,
      usage: data.usage
    };
  } catch (error) {
    console.error('❌ Chatbot error:', error.message);

    return {
      success: false,
      error: error.message,
      isRateLimit: error.message === 'RATE_LIMIT'
    };
  }
}


/**
 * Get chatbot usage statistics
 */
export function getChatbotStats() {
  return {
    totalQueries,
    lastQueryTime
  };
}

/**
 * Reset usage statistics (for testing)
 */
export function resetChatbotStats() {
  totalQueries = 0;
  lastQueryTime = null;
}
