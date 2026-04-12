// Password validation rules for real-world security

const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: true,
  specialChars: '!@#$%^&*()-_=+[]{}|;:,.<>?'
};

function validatePassword(password) {
  const errors = [];
  
  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Minimum ${PASSWORD_RULES.minLength} characters`);
  }
  
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('One uppercase letter (A-Z)');
  }
  
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('One lowercase letter (a-z)');
  }
  
  if (PASSWORD_RULES.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('One number (0-9)');
  }
  
  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('One special character (!@#$%^&*...)');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    strength: calculateStrength(password)
  };
}

function calculateStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*\-_=+\[\]{}|;:,.<>?]/.test(password)) score++;
  
  if (score <= 2) return { level: 'weak', color: '#dc2626' };
  if (score <= 4) return { level: 'fair', color: '#f59e0b' };
  if (score <= 5) return { level: 'good', color: '#10b981' };
  return { level: 'strong', color: '#0ea5e9' };
}

function renderPasswordRules(containerId, password = '') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const validation = validatePassword(password);
  
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'margin-top:12px;padding:12px;background:#f0f9ff;border-radius:8px;border:1px solid #bfdbfe';
  
  const title = document.createElement('div');
  title.style.cssText = 'font-size:0.78rem;font-weight:600;color:#1e40af;margin-bottom:8px';
  title.textContent = 'Password Requirements:';
  wrapper.appendChild(title);
  
  const list = document.createElement('ul');
  list.style.cssText = 'list-style:none;margin:0;padding:0;font-size:0.82rem';
  
  const rules = [
    { rule: `${PASSWORD_RULES.minLength}+ characters`, check: password.length >= PASSWORD_RULES.minLength },
    { rule: 'Uppercase letter (A-Z)', check: /[A-Z]/.test(password) },
    { rule: 'Lowercase letter (a-z)', check: /[a-z]/.test(password) },
    { rule: 'Number (0-9)', check: /[0-9]/.test(password) },
    { rule: 'Special character (!@#$%...)', check: /[!@#$%^&*\-_=+\[\]{}|;:,.<>?]/.test(password) }
  ];
  
  rules.forEach(r => {
    const item = document.createElement('li');
    item.style.cssText = `padding:4px 0;color:${r.check ? '#16a34a' : '#6b7280'}`;
    const check = r.check ? '✓' : '○';
    item.textContent = `${check} ${r.rule}`;
    list.appendChild(item);
  });
  
  wrapper.appendChild(list);
  
  if (password && validation.strength) {
    const strength = document.createElement('div');
    strength.style.cssText = `margin-top:8px;font-size:0.75rem;font-weight:600;color:${validation.strength.color}`;
    strength.textContent = `Strength: ${validation.strength.level.toUpperCase()}`;
    wrapper.appendChild(strength);
  }
  
  container.innerHTML = '';
  container.appendChild(wrapper);
}
