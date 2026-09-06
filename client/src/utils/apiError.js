// Shared client-side API error reporting.
//
// Goal: when something breaks, the browser console should say exactly WHAT
// failed, WHERE, the HTTP status, the server's explanation and the concrete
// fix - instead of a generic "failed to fetch". The server sends `error`,
// `detail` and `hint` fields; this surfaces all of them.

/**
 * Reads a fetch Response that is known to be non-OK and logs a full diagnostic.
 * Returns an Error carrying a user-presentable message.
 *
 * @param {Response} response - the failed fetch response
 * @param {string} label - human-readable name of the operation, e.g. "Heritage chatbot"
 * @param {string} url - the URL that was called
 */
export async function reportApiFailure(response, label, url) {
  let payload = null;
  let rawText = '';

  try {
    rawText = await response.text();
    payload = JSON.parse(rawText);
  } catch {
    // Non-JSON body (HTML error page, proxy error, empty). Keep the raw text.
  }

  const serverMessage = payload?.error || rawText?.slice(0, 200) || '(no response body)';
  const detail = payload?.detail;
  const hint = payload?.hint;

  // console.group keeps a multi-line diagnostic readable and collapsible.
  const groupLabel = `❌ ${label} failed - HTTP ${response.status} ${response.statusText || ''}`.trim();
  if (typeof console.groupCollapsed === 'function') {
    console.groupCollapsed(groupLabel);
  } else {
    console.error(groupLabel);
  }
  console.error('Request URL :', url);
  console.error('HTTP status :', response.status, response.statusText || '');
  console.error('Server says :', serverMessage);
  if (detail) console.error('Detail      :', detail);
  if (hint) console.error('How to fix  :', hint);
  if (response.status === 503) {
    console.error('Note        : 503 usually means a server-side API key or model is missing/invalid. Check server/.env and GET /api/diagnostics.');
  }
  if (response.status === 429) {
    console.error('Note        : 429 means a rate limit was hit - either our per-IP limiter or the upstream provider quota.');
  }
  if (typeof console.groupEnd === 'function') console.groupEnd();

  const error = new Error(serverMessage);
  error.status = response.status;
  error.detail = detail;
  error.hint = hint;
  return error;
}

/**
 * Logs a network-level failure (server unreachable, CORS, DNS, offline).
 */
export function reportNetworkFailure(err, label, url) {
  const groupLabel = `❌ ${label} - could not reach the server`;
  if (typeof console.groupCollapsed === 'function') {
    console.groupCollapsed(groupLabel);
  } else {
    console.error(groupLabel);
  }
  console.error('Request URL :', url);
  console.error('Reason      :', err?.message || err);
  console.error('Common causes:');
  console.error('  1. The API server is not running (start it: cd server && npm start)');
  console.error('  2. VITE_API_URL points at the wrong host/port');
  console.error('  3. This origin is not listed in ALLOWED_ORIGINS in server/.env (CORS)');
  if (typeof console.groupEnd === 'function') console.groupEnd();

  const error = new Error(err?.message || 'Network error');
  error.isNetworkError = true;
  return error;
}

/**
 * Convenience wrapper: performs a fetch and throws a fully-reported error on
 * failure. Returns parsed JSON on success.
 */
export async function fetchJson(url, options, label) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    throw reportNetworkFailure(err, label, url);
  }

  if (!response.ok) {
    throw await reportApiFailure(response, label, url);
  }

  return response.json();
}
