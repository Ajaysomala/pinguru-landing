let currentKeywords = [];

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

function renderRules(rules) {
  const rulesList = document.getElementById('rules-list');
  if (!rulesList) return;

  if (!rules || rules.length === 0) {
    rulesList.innerHTML = '<p class="loading-text">No rules yet. Create one below to get started.</p>';
    return;
  }

  let html = '';
  rules.forEach((rule) => {
    const statusClass = rule.is_active ? 'badge-active' : 'badge-inactive';
    const statusText = rule.is_active ? 'Active' : 'Paused';
    const triggerType = toTitleCase(rule.trigger_type);

    html += `
      <div class="rule-item">
        <div>
          <div class="rule-name">${escHtml(rule.name)}</div>
          <div class="rule-trigger">${triggerType}</div>
        </div>
        <span class="rule-badge ${statusClass}">${statusText}</span>
      </div>
    `;
  });

  rulesList.innerHTML = html;
}

function renderKeywordsTags() {
  const tagsContainer = document.getElementById('keywords-tags');
  if (!tagsContainer) return;

  let html = '';
  currentKeywords.forEach((keyword, index) => {
    html += `
      <div class="keyword-tag">
        ${escHtml(keyword)}
        <button type="button" onclick="removeKeyword(${index})" aria-label="Remove keyword">
          ×
        </button>
      </div>
    `;
  });

  tagsContainer.innerHTML = html;
}

function addKeyword() {
  const input = document.getElementById('keyword-input');
  if (!input) return;

  const keyword = input.value.trim();
  if (keyword && !currentKeywords.includes(keyword)) {
    currentKeywords.push(keyword);
    input.value = '';
    renderKeywordsTags();
  }
}

function removeKeyword(index) {
  currentKeywords.splice(index, 1);
  renderKeywordsTags();
}

async function checkInstagramConnection() {
  try {
    const profile = await getProfile();
    if (!profile || !profile.instagram_connected) {
      const rulesBody = document.querySelector('.rules-body');
      if (rulesBody) {
        rulesBody.innerHTML = `
          <div style="text-align:center;padding:80px 20px">
            <div style="font-size:2.5rem;margin-bottom:16px">📸</div>
            <h2 style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;margin-bottom:10px">Connect Instagram First</h2>
            <p style="color:var(--muted);margin-bottom:24px;font-size:0.9rem">You need to connect your Instagram account before creating automation rules.</p>
            <a href="/connect.html" class="btn-primary">Connect Instagram →</a>
          </div>
        `;
      }
    }
  } catch (e) {
    console.error('Error checking Instagram connection:', e);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const errorEl = document.getElementById('rule-error');
  const successEl = document.getElementById('rule-success');

  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';

  const name = document.getElementById('rule-name')?.value.trim();
  const triggerType = document.getElementById('trigger-type')?.value;
  const matchMode = document.getElementById('match-mode')?.value;
  const replyMessage = document.getElementById('reply-message')?.value.trim();

  if (!name || !triggerType || currentKeywords.length === 0 || !replyMessage) {
    if (errorEl) {
      errorEl.textContent = 'Please fill in all fields and add at least one keyword.';
      errorEl.style.display = 'block';
    }
    return;
  }

  try {
    const res = await authFetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        trigger_type: triggerType,
        keywords: currentKeywords,
        match_mode: matchMode,
        reply_message: replyMessage,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to create rule');
    }

    if (successEl) {
      successEl.style.display = 'block';
      setTimeout(() => {
        successEl.style.display = 'none';
      }, 3000);
    }

    document.getElementById('create-rule-form')?.reset();
    currentKeywords = [];
    renderKeywordsTags();

    const profile = await getProfile();
    const rules = await getRules();
    renderRules(rules);
  } catch (e) {
    if (errorEl) {
      errorEl.textContent = e.message || 'Error creating rule. Please try again.';
      errorEl.style.display = 'block';
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();

  try {
    const profile = await getProfile();
    if (!profile) return;

    renderProfile(profile);
    await checkInstagramConnection();

    const rules = await getRules();
    renderRules(rules);

    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => logout());
    }

    const addKeywordBtn = document.getElementById('add-keyword-btn');
    if (addKeywordBtn) {
      addKeywordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addKeyword();
      });
    }

    const keywordInput = document.getElementById('keyword-input');
    if (keywordInput) {
      keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addKeyword();
        }
      });
    }

    const form = document.getElementById('create-rule-form');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }
  } catch (e) {
    console.error('Error loading rules page:', e);
  }
});

