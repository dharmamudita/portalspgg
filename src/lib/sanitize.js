/**
 * Input Sanitization Module
 * Protects against XSS attacks by sanitizing user input
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize a string input — removes all HTML/script tags
 * @param {string} input - Raw user input
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Sanitize HTML content — allows safe HTML tags
 * @param {string} html - Raw HTML
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Escape special characters for display
 * @param {string} str - Input string
 * @returns {string} Escaped string
 */
export function escapeString(str) {
  if (typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
}
