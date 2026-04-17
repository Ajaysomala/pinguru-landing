// src/lib/api.ts — All backend calls, single source of truth

import type { User, DashboardStats, Rule, RuleCreatePayload, AnalyticsData } from './types';

const API = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.pinguru.me' : '/api')).replace(/\/$/, '');

type BackendRule = {
  _id?: string;
  id?: string;
  name: string;
  trigger_type: string;
  keywords?: string[];
  reply_message?: string;
  response_template?: string;
  is_active: boolean;
  created_at?: string;
  sent_count?: number;
};

function mapBackendTriggerToUi(trigger: string): Rule['trigger_type'] {
  if (trigger === 'story_reply' || trigger === 'story_mention') return 'story_mention';
  if (trigger === 'post_comment' || trigger === 'reel_comment' || trigger === 'comment') return 'comment';
  if (trigger === 'new_dm') return 'new_dm';
  return 'keyword';
}

function mapUiTriggerToBackend(trigger: RuleCreatePayload['trigger_type']): string {
  if (trigger === 'story_mention') return 'story_reply';
  if (trigger === 'comment') return 'post_comment';
  return trigger;
}

function mapRule(rule: BackendRule): Rule {
  return {
    id: String(rule.id ?? rule._id ?? ''),
    name: rule.name,
    trigger_type: mapBackendTriggerToUi(rule.trigger_type),
    keywords: rule.keywords ?? [],
    response_template: rule.response_template ?? rule.reply_message ?? '',
    is_active: Boolean(rule.is_active),
    created_at: rule.created_at ?? new Date().toISOString(),
    dm_count: rule.sent_count,
  };
}

function asErrorMessage(input: unknown, fallback: string): string {
  if (!input) return fallback;
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    const parts = input
      .map((item) => asErrorMessage(item, ''))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : fallback;
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    const nested = obj.detail ?? obj.message ?? obj.error;
    if (nested && nested !== input) return asErrorMessage(nested, fallback);
    try {
      return JSON.stringify(input);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string,string> || {}) },
  });
}

export async function loginUser(email: string, password: string) {
  const res = await authFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

export async function registerUser(email: string, password: string) {
  const res = await authFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
}

export async function verifyEmailOtp(email: string, otp: string) {
  const res = await authFetch('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'OTP verification failed');
}

export async function resendEmailOtp(email: string) {
  const res = await authFetch('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to resend OTP');
}

export async function logout() {
  try { await authFetch('/auth/logout', { method: 'POST' }); } catch {}
  localStorage.removeItem('pg_user');
  localStorage.removeItem('pg_login_attempts');
  localStorage.removeItem('pg_lockout_until');
  window.location.href = '/login';
}

export async function requireAuth(): Promise<boolean> {
  try {
    const res = await authFetch('/auth/me');
    return res.ok;
  } catch { return false; }
}

export async function getProfile(): Promise<User | null> {
  const res = await authFetch('/auth/me');
  if (res.status === 401) { window.location.href = '/login'; return null; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get profile');
  return data;
}

export async function updateOnboarding(payload: { first_name: string; last_name: string; business_category: string }) {
  const displayName = [payload.first_name, payload.last_name].filter(Boolean).join(' ').trim();
  const res = await authFetch('/auth/profile', { method: 'PATCH', body: JSON.stringify({ ...payload, display_name: displayName || payload.first_name, onboarding_complete: true }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update profile');
  return data as User;
}

export async function updateProfile(payload: Partial<User>) {
  const displayName = [payload.first_name, payload.last_name].filter(Boolean).join(' ').trim();
  const body: Record<string, unknown> = { ...payload };
  if (displayName) body.display_name = displayName;
  const res = await authFetch('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update profile');
  return data as User;
}

export async function requestDataDeletion() {
  const res = await authFetch('/auth/data-deletion', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to request data deletion');
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const res = await authFetch('/dashboard/stats');
  if (res.status === 401) { window.location.href = '/login'; return null; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get stats');

  const dmLimit = data.dm_limit === null || data.dm_limit === undefined
    ? null
    : Number(data.dm_limit);
  const dmRemaining = data.dm_remaining === null || data.dm_remaining === undefined
    ? null
    : Number(data.dm_remaining);

  return {
    dms_sent_this_month: data.dms_sent_this_month ?? data.dm_sent_this_month ?? 0,
    active_rules: data.active_rules ?? 0,
    dm_limit: Number.isNaN(dmLimit as number) ? null : dmLimit,
    dm_remaining: Number.isNaN(dmRemaining as number) ? null : dmRemaining,
    plan: String(data.plan ?? 'free').toLowerCase(),
    success_rate: typeof data.success_rate === 'number' ? data.success_rate : undefined,
  };
}

export async function getRules(): Promise<{ rules: Rule[] }> {
  const res = await authFetch('/automation/rules');
  if (res.status === 401) { window.location.href = '/login'; return { rules: [] }; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get rules');
  const rules = Array.isArray(data?.rules) ? data.rules.map((r: BackendRule) => mapRule(r)) : [];
  return { rules };
}

export async function createRule(payload: RuleCreatePayload): Promise<Rule> {
  const backendPayload = {
    name: payload.name,
    trigger_type: mapUiTriggerToBackend(payload.trigger_type),
    keywords: payload.keywords,
    reply_message: payload.response_template,
  };
  const res = await authFetch('/automation/rules', { method: 'POST', body: JSON.stringify(backendPayload) });
  const data = await res.json();
  if (!res.ok) throw new Error(asErrorMessage(data, 'Failed to create rule'));
  return mapRule((data?.rule ?? data) as BackendRule);
}

export async function updateRule(ruleId: string, payload: Partial<RuleCreatePayload>): Promise<Rule> {
  const backendPayload: Record<string, unknown> = {};
  if (payload.name !== undefined) backendPayload.name = payload.name;
  if (payload.trigger_type !== undefined) backendPayload.trigger_type = mapUiTriggerToBackend(payload.trigger_type);
  if (payload.keywords !== undefined) backendPayload.keywords = payload.keywords;
  if (payload.response_template !== undefined) backendPayload.reply_message = payload.response_template;

  const res = await authFetch(`/automation/rules/${ruleId}`, { method: 'PUT', body: JSON.stringify(backendPayload) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update rule');
  const refreshed = await getRules();
  const found = refreshed.rules.find((r) => r.id === ruleId);
  if (!found) throw new Error('Rule updated but could not refresh latest state');
  return found;
}

export async function toggleRule(ruleId: string): Promise<{ rule_id: string; is_active: boolean }> {
  const res = await authFetch(`/automation/rules/${ruleId}/toggle`, { method: 'PATCH' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to toggle rule');
  return {
    rule_id: String(data.rule_id ?? ruleId),
    is_active: Boolean(data.is_active),
  };
}

export async function deleteRule(ruleId: string): Promise<void> {
  const res = await authFetch(`/automation/rules/${ruleId}`, { method: 'DELETE' });
  if (!res.ok) { const data = await res.json(); throw new Error(data.detail || 'Failed to delete rule'); }
}

export async function getAnalytics(days: 7 | 30 = 7): Promise<AnalyticsData[]> {
  const res = await authFetch('/dashboard/dm-logs?limit=500');
  if (res.status === 401) { window.location.href = '/login'; return []; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get analytics');
  const logs = Array.isArray(data?.logs) ? data.logs : [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);

  const daily = new Map<string, { dms_sent: number; success_count: number }>();
  for (const log of logs) {
    const sentAt = new Date(log.sent_at || log.created_at || Date.now());
    if (Number.isNaN(sentAt.getTime()) || sentAt < cutoff) continue;

    const key = sentAt.toISOString().slice(0, 10);
    const entry = daily.get(key) ?? { dms_sent: 0, success_count: 0 };
    entry.dms_sent += 1;
    if (String(log.status).toLowerCase() === 'sent') entry.success_count += 1;
    daily.set(key, entry);
  }

  const points: AnalyticsData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = daily.get(key) ?? { dms_sent: 0, success_count: 0 };
    points.push({ date: key, dms_sent: entry.dms_sent, success_count: entry.success_count });
  }

  return points;
}

export async function getPlans() {
  const res = await authFetch('/plans');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get plans');
  return data;
}

export async function createCheckoutSession(planId: string): Promise<{ checkout_url: string }> {
  const res = await authFetch('/billing/create-checkout', { method: 'POST', body: JSON.stringify({ plan: planId }) });
  const data = await res.json();
  if (!res.ok) throw new Error(asErrorMessage(data, 'Failed to create checkout'));
  return data;
}

export async function getCustomerPortalUrl(): Promise<{ portal_url: string }> {
  const res = await authFetch('/billing/portal', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(asErrorMessage(data, 'Failed to get portal URL'));
  return data;
}

export async function getInstagramStatus() {
  const [meRes, statsRes] = await Promise.all([
    authFetch('/auth/me'),
    authFetch('/dashboard/stats'),
  ]);

  if (meRes.status === 401) return null;
  const me = await meRes.json();
  const stats = statsRes.ok ? await statsRes.json() : {};

  if (!meRes.ok) return null;

  return {
    connected: Boolean(me.instagram_connected),
    token_expires_at: stats?.ig_token_expires_at ?? undefined,
  };
}

export async function getInstagramAuthUrl(): Promise<string> {
  const res = await authFetch('/auth/instagram/initiate');
  const data = await res.json();
  if (!res.ok || !data?.auth_url) {
    throw new Error(asErrorMessage(data, 'Failed to start Instagram connection'));
  }
  return data.auth_url as string;
}

export async function refreshInstagramToken() {
  // Backend currently does not expose a dedicated refresh endpoint.
  throw new Error('Automatic refresh is unavailable. Please reconnect Instagram.');
}

export async function injectInstagramToken(token: string, igUserId: string) {
  void token;
  void igUserId;
  throw new Error('Direct token injection is disabled in this build. Use Instagram connect flow.');
}

export async function getInstagramStatusLegacy() {
  const res = await authFetch('/instagram/status');
  if (res.status === 401) return null;
  const data = await res.json();
  if (!res.ok) return null;
  return data;
}
