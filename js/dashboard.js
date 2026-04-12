document.addEventListener('DOMContentLoaded', async () => {
  if (!await requireAuth()) return;

  const user = JSON.parse(localStorage.getItem('pg_user') || '{}');

  // Render plan info
  const planEl = document.getElementById('plan-name');
  if (planEl) planEl.textContent = user.plan || 'Free';

  // Instagram status
  const igStatus = document.getElementById('ig-status');
  const igStatusText = document.getElementById('ig-status-text');
  if (igStatus) {
    if (user.instagram_connected) {
      igStatus.className = 'badge-green';
      igStatus.textContent = 'Connected';
      if (igStatusText) igStatusText.textContent = 'Your Instagram account is active';
    } else {
      igStatus.className = 'badge-red';
      igStatus.textContent = 'Not Connected';
      if (igStatusText) igStatusText.textContent = 'Connect your Instagram to enable automation';
    }
  }

  // Load stats
  try {
    const stats = await getDashboardStats();
    if (stats) {
      setEl('stat-dms', stats.dms_sent_this_month ?? 0);
      setEl('stat-rules', stats.active_rules ?? 0);
      setEl('stat-limit', stats.dm_limit ?? 200);

      // Usage bar
      const pct = Math.min(100, Math.round(((stats.dms_sent_this_month || 0) / (stats.dm_limit || 200)) * 100));
      const bar = document.getElementById('usage-bar');
      if (bar) bar.style.width = pct + '%';
      setEl('usage-label', `${stats.dms_sent_this_month || 0} / ${stats.dm_limit || 200} DMs used`);
    }
  } catch (err) {
    console.error('Stats error:', err);
  }

  // Load recent rules
  try {
    const data = await getRules();
    const rules = data?.rules || [];
    const container = document.getElementById('recent-rules');
    if (container) {
      container.innerHTML = '';
      if (rules.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'color:var(--muted);font-size:0.86rem;text-align:center;padding:20px 0';
        const link = document.createElement('a');
        link.href = '/rules.html';
        link.style.cssText = 'color:var(--accent)';
        link.textContent = 'Create your first rule →';
        emptyMsg.appendChild(document.createTextNode('No rules yet. '));
        emptyMsg.appendChild(link);
        container.appendChild(emptyMsg);
      } else {
        rules.slice(0, 3).forEach(r => {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)';
          
          const ruleInfo = document.createElement('div');
          const ruleName = document.createElement('div');
          ruleName.style.cssText = 'font-weight:600;font-size:0.88rem';
          ruleName.textContent = r.name;
          
          const ruleMeta = document.createElement('div');
          ruleMeta.style.cssText = 'font-size:0.76rem;color:var(--muted)';
          ruleMeta.textContent = `${r.trigger_type} · ${(r.keywords || []).join(', ')}`;
          
          ruleInfo.appendChild(ruleName);
          ruleInfo.appendChild(ruleMeta);
          
          const badge = document.createElement('span');
          badge.className = r.is_active ? 'badge-green' : 'badge-red';
          badge.textContent = r.is_active ? 'Active' : 'Paused';
          
          row.appendChild(ruleInfo);
          row.appendChild(badge);
          container.appendChild(row);
        });
      }
    }
  } catch (err) {
    console.error('Rules error:', err);
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
