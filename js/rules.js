let keywords = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  await loadRules();

  // Add keyword
  const addKwBtn = document.getElementById('add-keyword-btn');
  const kwInput = document.getElementById('keyword-input');
  if (addKwBtn && kwInput) {
    addKwBtn.addEventListener('click', () => addKeyword(kwInput.value.trim()));
    kwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addKeyword(kwInput.value.trim()); }
    });
  }

  // Create rule form
  const ruleForm = document.getElementById('create-rule-form');
  if (ruleForm) {
    ruleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorMsg = document.getElementById('rule-error');
      const submitBtn = document.getElementById('create-btn');

      if (keywords.length === 0) {
        if (errorMsg) { errorMsg.style.display = 'block'; errorMsg.textContent = 'Add at least one keyword'; }
        return;
      }

      const ruleData = {
        name: document.getElementById('rule-name').value.trim(),
        trigger_type: document.getElementById('trigger-type').value,
        keywords: keywords,
        match_mode: document.getElementById('match-mode').value,
        reply_message: document.getElementById('reply-message').value.trim()
      };

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Creating...';
      if (errorMsg) errorMsg.style.display = 'none';

      try {
        await createRule(ruleData);
        keywords = [];
        renderKeywords();
        ruleForm.reset();
        await loadRules();
        const successMsg = document.getElementById('rule-success');
        if (successMsg) { successMsg.style.display = 'block'; setTimeout(() => successMsg.style.display = 'none', 3000); }
      } catch (err) {
        if (errorMsg) { errorMsg.style.display = 'block'; errorMsg.textContent = err.message; }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Rule';
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

async function loadRules() {
  const container = document.getElementById('rules-list');
  if (!container) return;

  container.innerHTML = '<p style="color:var(--muted);font-size:0.86rem;padding:16px 0">Loading rules...</p>';

  try {
    const data = await getRules();
    const rules = data?.rules || [];

    if (rules.length === 0) {
      container.innerHTML = `
        <div class="empty-rules">
          <div class="icon">⚡</div>
          <h3>No automation rules yet</h3>
          <p>Create your first rule below to start automating DMs</p>
        </div>`;
      return;
    }

    // Safe DOM building without innerHTML injection
    container.innerHTML = '';
    rules.forEach(r => {
      const card = document.createElement('div');
      card.className = 'rule-card';
      card.id = `rule-${sanitizeHTML(r._id)}`;
      
      const info = document.createElement('div');
      info.className = 'rule-info';
      
      const name = document.createElement('div');
      name.className = 'rule-name';
      name.textContent = r.name;
      
      const meta = document.createElement('div');
      meta.className = 'rule-meta';
      meta.textContent = `${r.trigger_type} · ${r.match_mode} match · ${r.sent_count || 0} DMs sent`;
      
      const keywords = document.createElement('div');
      keywords.className = 'rule-keywords';
      (r.keywords || []).forEach(k => {
        const tag = document.createElement('span');
        tag.className = 'keyword-tag';
        tag.textContent = k;
        keywords.appendChild(tag);
      });
      
      info.appendChild(name);
      info.appendChild(meta);
      info.appendChild(keywords);
      
      const reply = document.createElement('div');
      reply.className = 'rule-reply';
      reply.textContent = r.reply_message;
      
      const actions = document.createElement('div');
      actions.className = 'rule-actions';
      
      const toggle = document.createElement('label');
      toggle.className = 'toggle';
      toggle.title = r.is_active ? 'Pause rule' : 'Activate rule';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = r.is_active;
      checkbox.addEventListener('change', () => handleToggle(r._id, checkbox));
      
      const slider = document.createElement('span');
      slider.className = 'toggle-slider';
      
      toggle.appendChild(checkbox);
      toggle.appendChild(slider);
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => handleDelete(r._id));
      
      actions.appendChild(toggle);
      actions.appendChild(deleteBtn);
      
      card.appendChild(info);
      card.appendChild(reply);
      card.appendChild(actions);
      container.appendChild(card);
    });
  } catch (err) {
    const errMsg = document.createElement('p');
    errMsg.style.cssText = 'color:var(--red);font-size:0.86rem';
    errMsg.textContent = err.message || 'Failed to load rules';
    container.innerHTML = '';
    container.appendChild(errMsg);
  }
}

async function handleToggle(ruleId, checkbox) {
  try {
    await toggleRule(ruleId);
  } catch (err) {
    checkbox.checked = !checkbox.checked;
    alert('Failed to toggle rule: ' + err.message);
  }
}

async function handleDelete(ruleId) {
  if (!confirm('Delete this rule? This cannot be undone.')) return;
  try {
    await deleteRule(ruleId);
    await loadRules();
  } catch (err) {
    alert('Failed to delete: ' + err.message);
  }
}

function addKeyword(kw) {
  if (!kw || keywords.includes(kw)) return;
  keywords.push(kw);
  const kwInput = document.getElementById('keyword-input');
  if (kwInput) kwInput.value = '';
  renderKeywords();
}

function removeKeyword(kw) {
  keywords = keywords.filter(k => k !== kw);
  renderKeywords();
}

function renderKeywords() {
  const container = document.getElementById('keywords-tags');
  if (!container) return;
  container.innerHTML = keywords.map(kw => `
    <span class="tag">
      ${escHtml(kw)}
      <button onclick="removeKeyword('${escHtml(kw)}')" type="button">×</button>
    </span>
  `).join('');
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
