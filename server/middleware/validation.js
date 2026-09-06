// server/middleware/validation.js
// Input-validation helpers shared by REST routes and socket handlers.

const REGEX_METACHARACTERS = /[.*+?^${}()|[\]\\]/g;
// Control characters have no place in a name/query field.
const CONTROL_CHARACTERS = new RegExp('[\\u0000-\\u001F\\u007F]', 'g');

// Escapes regex metacharacters so user input can be used in a MongoDB $regex
// without injecting alternations/quantifiers (NoSQL regex injection / ReDoS).
function escapeRegex(value) {
  return String(value).replace(REGEX_METACHARACTERS, '\\$&');
}

// Builds an anchored, case-insensitive exact-match regex from untrusted input.
function exactMatchRegex(value) {
  return new RegExp(`^${escapeRegex(value)}$`, 'i');
}

// Builds a case-insensitive "contains" regex from untrusted input.
function containsRegex(value) {
  return new RegExp(escapeRegex(value), 'i');
}

// Trims and length-caps a free-text field. Returns null when unusable.
function sanitizeText(value, maxLength = 200) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    return null;
  }
  // Strip control characters that have no place in a name/query.
  return trimmed.replace(CONTROL_CHARACTERS, "");
}

function isFiniteNumberInRange(value, min, max) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max;
}

module.exports = {
  escapeRegex,
  exactMatchRegex,
  containsRegex,
  sanitizeText,
  isFiniteNumberInRange
};
