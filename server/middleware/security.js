// server/middleware/security.js
// Baseline security headers + safe error handling.
// Hand-rolled rather than pulling in helmet so the hardening adds no new
// dependency (and therefore no new supply-chain surface) to the server.

const { isProduction } = require('../config/env');

function securityHeaders(req, res, next) {
  // Stop MIME sniffing turning a JSON/text response into executable content.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // This API is never meant to be framed.
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  // No API response here needs camera/mic/geolocation.
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  // API responses are data, never a document: a locked-down CSP costs nothing.
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; sandbox");
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  // Don't advertise the framework.
  res.removeHeader('X-Powered-By');

  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

// Map-tile/style responses are consumed cross-origin by MapLibre and must not
// inherit the locked-down `default-src 'none'` CSP above.
function relaxCspForMedia(res) {
  res.removeHeader('Content-Security-Policy');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
}

// Never hand an upstream/internal error message to a client: those strings leak
// file paths, hostnames, and occasionally query fragments containing keys.
function safeError(res, status, publicMessage, internalError) {
  if (internalError) {
    console.error(`[${status}] ${publicMessage}:`, internalError.message || internalError);
  }
  return res.status(status).json({ error: publicMessage });
}

// Terminal error handler - catches anything thrown/`next(err)`-ed by a route.
function errorHandler(err, req, res, _next) {
  console.error('Unhandled route error:', err && (err.stack || err.message || err));
  if (res.headersSent) {
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { securityHeaders, relaxCspForMedia, safeError, errorHandler };
