function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toTitleCase(value = '') {
  if (!value) return 'Free';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getDisplayName(profile) {
  if (profile?.instagram_username) return `@${profile.instagram_username}`;
  if (profile?.email) return profile.email.split('@')[0];
  return 'Pinguru User';
}

function renderProfile(profile) {
  const email = profile?.email || 'unknown@pinguru.me';
  const name = getDisplayName(profile);
  const plan = toTitleCase(profile?.plan || 'free');
  const initial = name.charAt(0).toUpperCase();

  setEl('user-avatar', initial);
  setEl('sidebar-user-name', name);
  setEl('sidebar-user-email', email);
  setEl('sidebar-user-plan', plan);

  setEl('top-user-avatar', initial);
  setEl('top-user-name', name);
  setEl('top-user-email', email);
  setEl('plan-name', plan);

  const igStatus = document.getElementById('ig-status');
  const igStatusText = document.getElementById('ig-status-text');
  if (!igStatus || !igStatusText) return;

  if (profile?.instagram_connected) {
    igStatus.className = 'badge badge-green';
    igStatus.textContent = 'Connected';
    igStatusText.textContent = 'Instagram Business account active';
  } else {
    igStatus.className = 'badge badge-red';
    igStatus.textContent = 'Not Connected';
    igStatusText.textContent = 'Connect Instagram to start automation';
  }
}

function renderStats(stats) {
  const dmsSent = stats?.dms_sent_this_month ?? 0;
  const activeRules = stats?.active_rules ?? 0;
  const dmLimit = stats?.dm_limit ?? 200;
  const pct = Math.min(100, Math.round((dmsSent / dmLimit) * 100));

  setEl('stat-dms', dmsSent);
  setEl('stat-rules', activeRules);
  setEl('stat-limit', dmLimit);
  setEl('profile-tier', toTitleCase(stats?.plan || document.getElementById('plan-name')?.textContent || 'free'));

  const usageBar = document.getElementById('usage-bar');
  if (usageBar) usageBar.style.width = `${pct}%`;
  setEl('usage-label', `${dmsSent} / ${dmLimit} DMs used this month`);
  setEl('profile-limit', `${dmsSent} of ${dmLimit} DMs`);
}

function renderRecentRules(rules) {
  const container = document.getElementById('recent-rules');
  if (!container) return;

  if (!rules.length) {
    container.innerHTML = '<p class="helper-text">No rules yet. <a href="/rules.html" class="card-link">Create your first rule</a></p>';
    return;
  }

  container.innerHTML = '';
  rules.slice(0, 5).forEach((rule) => {
    const row = document.createElement('div');
    row.className = 'rule-row';
    row.innerHTML = `
      <div>
        <div class="rule-name">${escHtml(rule.name)}</div>
        <div class="rule-meta">${escHtml(rule.trigger_type)} • ${(rule.keywords || []).map(escHtml).join(', ')}</div>
      </div>
      <span class="badge ${rule.is_active ? 'badge-green' : 'badge-red'}">${rule.is_active ? 'Active' : 'Paused'}</span>
    `;
    container.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await requireAuth();
  if (!ok) return;

  document.getElementById('sidebar-logout-btn')?.addEventListener('click', logout);

  try {
    const profile = await getProfile();
    if (!profile) return;
    renderProfile(profile);
  } catch (err) {
    console.error('Profile load failed:', err);
  }

  try {
    const stats = await getDashboardStats();
    if (stats) renderStats(stats);
  } catch (err) {
    console.error('Stats load failed:', err);
  }

  try {
    const data = await getRules();
    renderRecentRules(data?.rules || []);
  } catch (err) {
    console.error('Rules load failed:', err);
  }
});
