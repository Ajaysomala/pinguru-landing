// Security utilities

// DOMPurify-like HTML sanitization (safe subset)
function sanitizeHTML(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

// Safe text node injection
function setTextContent(el, text) {
  if (!el) return;
  el.textContent = text;
}

// Safe class management
function setClasses(el, classString) {
  if (!el) return;
  el.className = classString;
}
