const API = 'https://api.pinguru.me';

function getToken() {
  // JWT is intentionally unavailable to JS (httpOnly cookie).
  return null;
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

async function authFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  return res;
}

async function loginUser(email, password) {
  const res = await authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

async function registerUser(email, password) {
  const res = await authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
  return data;
}

async function verifyEmailOtp(email, otp) {
  const res = await authFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'OTP verification failed');
  return data;
}

async function resendEmailOtp(email) {
  const res = await authFetch('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to resend OTP');
  return data;
}

async function getProfile() {
  const res = await authFetch('/auth/me');
  if (res.status === 401) { logout(); return null; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get profile');
  return data;
}

async function getDashboardStats() {
  const res = await authFetch('/dashboard/stats');
  if (res.status === 401) { logout(); return null; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get stats');
  return data;
}

async function getRules() {
  const res = await authFetch('/automation/rules');
  if (res.status === 401) { logout(); return null; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get rules');
  return data;
}

async function createRule(ruleData) {
  const res = await authFetch('/automation/rules', {
    method: 'POST',
    body: JSON.stringify(ruleData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create rule');
  return data;
}

async function toggleRule(ruleId) {
  const res = await authFetch(`/automation/rules/${ruleId}/toggle`, {
    method: 'PATCH'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to toggle rule');
  return data;
}

async function deleteRule(ruleId) {
  const res = await authFetch(`/automation/rules/${ruleId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Failed to delete rule');
  }
  return true;
}

async function getPlans() {
  const res = await authFetch('/plans');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get plans');
  return data;
}

async function logout() {
  try {
    await authFetch('/auth/logout', { method: 'POST' });
  } catch (_) {
    // Continue with local cleanup even if server logout fails.
  }
  localStorage.removeItem('pg_user');
  localStorage.removeItem('pg_login_attempts');
  localStorage.removeItem('pg_lockout_until');
  window.location.href = '/login.html';
}
async function requireAuth() {
  try {
    const res = await fetch(`${API}/auth/me`, {
      credentials: 'include'
    });
    if (!res.ok) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  } catch {
    window.location.href = '/login.html';
    return false;
  }
}
