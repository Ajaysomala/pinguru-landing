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

// Prevent DevTools/Inspect via Ctrl+I, F12, Shift+F12, Ctrl+Shift+I
function preventDevTools() {
  // Block F12
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') e.preventDefault();
  }, false);

  // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
      e.preventDefault();
    }
  }, false);

  // Block Ctrl+I (some browsers)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'i') e.preventDefault();
  }, false);

  // Block right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, false);

  // Detect DevTools opening (checking console size)
  const devToolsOpen = () => {
    const threshold = 160;
    return window.outerHeight - window.innerHeight > threshold ||
           window.outerWidth - window.innerWidth > threshold;
  };

  // Optional: warn if DevTools detected
  setInterval(() => {
    if (devToolsOpen()) {
      // Silently redirect or blank page
      // document.body.innerHTML = '';
    }
  }, 1000);
}

// Initialize security on page load
document.addEventListener('DOMContentLoaded', preventDevTools);

// Block XSS via console log injection
if (typeof console !== 'undefined') {
  // Allow specific methods only
  const allowedMethods = ['error', 'warn'];
  Object.keys(console).forEach(key => {
    if (!allowedMethods.includes(key) && typeof console[key] === 'function') {
      console[key] = () => {};
    }
  });
}
