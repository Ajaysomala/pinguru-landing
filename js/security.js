const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

function getAttempts() {
  return parseInt(localStorage.getItem('pg_login_attempts') || '0');
}

function getLockoutUntil() {
  return parseInt(localStorage.getItem('pg_lockout_until') || '0');
}

function isLockedOut() {
  const until = getLockoutUntil();
  if (!until) return false;
  if (Date.now() < until) return true;
  localStorage.removeItem('pg_lockout_until');
  localStorage.removeItem('pg_login_attempts');
  return false;
}

function recordAttempt() {
  const attempts = getAttempts() + 1;
  localStorage.setItem('pg_login_attempts', attempts);
  if (attempts >= MAX_ATTEMPTS) {
    const until = Date.now() + LOCKOUT_SECONDS * 1000;
    localStorage.setItem('pg_lockout_until', until);
    return { locked: true, until };
  }
  return { locked: false, remaining: MAX_ATTEMPTS - attempts };
}

function resetAttempts() {
  localStorage.removeItem('pg_login_attempts');
  localStorage.removeItem('pg_lockout_until');
}

function startLockoutCountdown(msgEl) {
  if (!msgEl) return;
  const interval = setInterval(() => {
    const until = getLockoutUntil();
    if (!until || Date.now() >= until) {
      clearInterval(interval);
      msgEl.style.display = 'none';
      const btn = document.querySelector('.auth-submit');
      if (btn) btn.disabled = false;
      resetAttempts();
      return;
    }
    const secs = Math.ceil((until - Date.now()) / 1000);
    msgEl.style.display = 'block';
    msgEl.textContent = `Too many attempts. Try again in ${secs}s`;
    const btn = document.querySelector('.auth-submit');
    if (btn) btn.disabled = true;
  }, 500);
}

function initSecurity() {
  const lockoutMsg = document.getElementById('lockout-msg');
  if (isLockedOut()) {
    if (lockoutMsg) startLockoutCountdown(lockoutMsg);
    const btn = document.querySelector('.auth-submit');
    if (btn) btn.disabled = true;
  }
}

document.addEventListener('DOMContentLoaded', initSecurity);
