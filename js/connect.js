function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

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

function renderConnectionStatus(profile) {
  const badge = document.getElementById('connection-badge');
  const igUsername = document.getElementById('ig-username');
  const igUserId = document.getElementById('ig-user-id');
  const connectBtn = document.getElementById('connect-ig-btn');

  if (profile.instagram_connected) {
    if (badge) {
      badge.className = 'badge-green';
      badge.textContent = 'Connected';
    }
    setEl('ig-username', profile.instagram_username || 'Connected');
    setEl('ig-user-id', 'Instagram Business Account');
    if (connectBtn) connectBtn.style.display = 'none';
  } else {
    if (badge) {
      badge.className = 'badge-red';
      badge.textContent = 'Not Connected';
    }
    setEl('ig-username', 'No account connected');
    setEl('ig-user-id', 'Click Connect Instagram to get started');
    if (connectBtn) connectBtn.style.display = 'inline-block';
  }
}

async function connectInstagram() {
  try {
    const res = await authFetch('/auth/instagram/initiate');
    const data = await res.json();
    if (data.auth_url) {
      window.location.href = data.auth_url;
    } else {
      alert('Failed to start Instagram connection. Try again.');
    }
  } catch (e) {
    alert('Error connecting Instagram. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();

  try {
    const profile = await getProfile();
    if (!profile) return;

    renderProfile(profile);
    renderConnectionStatus(profile);

    const connectBtn = document.getElementById('connect-ig-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', connectInstagram);
    }

    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => logout());
    }
  } catch (e) {
    console.error('Error loading profile:', e);
  }
});
