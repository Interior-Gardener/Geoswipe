// Groq API Service for Heritage Chatbot
// Handles AI chat interactions with context about Indian heritage sites

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// System prompt for heritage specialist AI
const BASE_SYSTEM_PROMPT = `You are a knowledgeable and enthusiastic AI assistant specializing in Indian heritage sites, monuments, temples, forts, palaces, and UNESCO World Heritage locations.

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

// Usage tracking
let totalQueries = 0;
let lastQueryTime = null;

/**
 * Fetch list of heritage sites from the backend for context
 */
export async function fetchHeritageSitesContext() {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/heritage-sites`);
    
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
  const apiKey = import.meta.env.VITE_GROQ_CHATBOT_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_CHATBOT_API_KEY is not configured');
  }
  
  // Track usage
  totalQueries++;
  lastQueryTime = new Date().toISOString();
  console.log(`📊 Chatbot Query #${totalQueries} at ${lastQueryTime}`);
  
  try {
    // Fetch heritage sites context (only on first message for efficiency)
    let systemPrompt = BASE_SYSTEM_PROMPT;
    if (conversationHistory.length === 0) {
      const heritageContext = await fetchHeritageSitesContext();
      systemPrompt += heritageContext;
    }
    
    // Prepare messages array
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      // Keep only last 15 messages for context (to avoid token limits)
      ...conversationHistory.slice(-15),
      {
        role: 'user',
        content: userMessage
      }
    ];
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.9,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 429) {
        throw new Error('RATE_LIMIT');
      } else if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 400) {
        throw new Error('Invalid request format');
      } else {
        throw new Error(errorData.error?.message || 'API request failed');
      }
    }
    
    const data = await response.json();
    
    // Extract assistant's response
    if (data.choices && data.choices.length > 0) {
      const assistantMessage = data.choices[0].message.content;
      
      console.log('✅ Chatbot response received:', {
        tokens: data.usage?.total_tokens || 'N/A',
        model: data.model
      });
      
      return {
        success: true,
        message: assistantMessage,
        usage: data.usage
      };
    } else {
      throw new Error('No response from AI');
    }
    
  } catch (error) {
    console.error('❌ Groq API Error:', error);
    
    // Return structured error
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
