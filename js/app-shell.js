// Shared App Shell Utilities — Used across all authenticated pages

/**
 * Safe text-only DOM element update (prevents XSS)
 */
function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * HTML entity escape for safe HTML insertion
 */
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Capitalize first letter of each word
 */
function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Extract user display name from profile
 * Priority: instagram_username > email username
 */
function getDisplayName(profile) {
  if (!profile) return 'User';
  if (profile.instagram_username) {
    return toTitleCase(profile.instagram_username.split('_').join(' '));
  }
  if (profile.email) {
    return toTitleCase(profile.email.split('@')[0].split('.').join(' '));
  }
  return 'User';
}

/**
 * Render user profile info into sidebar user block
 * Updates: avatar initial, name, email, plan tier
 */
function renderProfile(profile) {
  const name = getDisplayName(profile);
  setEl('sidebar-user-name', name);
  setEl('sidebar-user-email', profile.email || '');
  setEl('sidebar-user-plan', toTitleCase(profile.plan || 'Free'));
  const avatar = document.getElementById('user-avatar');
  if (avatar) {
    avatar.textContent = name.charAt(0).toUpperCase();
  }
}

/**
 * Wire logout button event listener
 * Calls logout() from js/api.js
 */
function wireLogoutButton() {
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => logout());
  }
}

/**
 * Initialize common page setup:
 * 1. Require authentication
 * 2. Load and render user profile
 * 3. Wire logout button
 * 4. Execute optional callback for page-specific init
 */
async function initAppShell(onReady) {
  try {
    await requireAuth();
    const profile = await getProfile();
    if (!profile) return;

    renderProfile(profile);
    wireLogoutButton();

    if (typeof onReady === 'function') {
      await onReady(profile);
    }
  } catch (e) {
    console.error('Error initializing app shell:', e);
  }
}
