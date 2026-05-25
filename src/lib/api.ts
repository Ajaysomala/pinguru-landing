import type { User, DashboardStats, Rule, RuleCreatePayload, AnalyticsData, PlanStatus, InstagramMediaItem } from './types';

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
  comment_target_type?: 'specific' | 'any';
  comment_media_filter?: 'post' | 'reel' | 'all';
  comment_media_id?: string;
  comment_media_permalink?: string;
  comment_media_caption?: string;
  comment_media_type?: string;
  dm_attachment_url?: string;
  dm_attachment_type?: string;
  any_comment_keyword?: boolean;
  public_comment_reply_enabled?: boolean;
  public_comment_reply_template?: string;
  ask_follow_before_dm?: boolean;
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
    comment_target_type: rule.comment_target_type,
    comment_media_filter: rule.comment_media_filter,
    comment_media_id: rule.comment_media_id,
    comment_media_permalink: rule.comment_media_permalink,
    comment_media_caption: rule.comment_media_caption,
    comment_media_type: rule.comment_media_type,
    dm_attachment_url: rule.dm_attachment_url,
    dm_attachment_type: rule.dm_attachment_type,
    any_comment_keyword: rule.any_comment_keyword,
    public_comment_reply_enabled: rule.public_comment_reply_enabled,
    public_comment_reply_template: rule.public_comment_reply_template,
    ask_follow_before_dm: rule.ask_follow_before_dm,
    is_active: Boolean(rule.is_active),
    created_at: rule.created_at ?? new Date().toISOString(),
    dm_count: rule.sent_count,
  };
}

function asErrorMessage(input: unknown, fallback: string): string {
  if (!input) return fallback;
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    const parts = input.map((item) => asErrorMessage(item, '')).filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : fallback;
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    const nested = obj.detail ?? obj.message ?? obj.error;
    if (nested && nested !== input) return asErrorMessage(nested, fallback);
    try {
      const serialized = JSON.stringify(input);
      return serialized || fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function sanitizeErrorText(message: string, fallback: string): string {
  if (!message) return fallback;
  if (message.includes('<!DOCTYPE') || message.includes('<html') || message.includes('<body') || message.includes('via_upstream')) {
    return fallback;
  }
  if (message.includes('502') || message.includes('503') || message.includes('504')) {
    return fallback;
  }
  if (message.length > 500) return fallback;
  return message;
}

type ApiRequestError = Error & { status?: number };

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const found = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!found) return '';
  return decodeURIComponent(found.slice(name.length + 1));
}

function createApiRequestError(status: number, detail: unknown, fallback: string): ApiRequestError {
  const err = new Error(sanitizeErrorText(asErrorMessage(detail, fallback), fallback)) as ApiRequestError;
  err.status = status;
  return err;
}

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const isStateChanging = !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (isStateChanging) {
    const csrfToken = readCookie('pg_csrf') || readCookie('pg_admin_csrf');
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  }

  return fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });
}

export async function loginUser(email: string, password: string) {
  const res = await authFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

export async function registerUser(
  email: string,
  password: string,
  firstName: string = '',
  lastName: string = '',
  businessCategory: string = '',
) {
  const res = await authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, business_category: businessCategory }),
  });
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

export async function requestPasswordReset(email: string): Promise<{ message: string; reset_token?: string; reset_url?: string }> {
  const res = await authFetch('/auth/forgot-password/request', { method: 'POST', body: JSON.stringify({ email }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to request password reset');
  return data;
}

export async function resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ message: string }> {
  const res = await authFetch('/auth/forgot-password/reset', {
    method: 'POST',
    body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to reset password');
  return data;
}

export async function logout() {
  try { await authFetch('/auth/logout', { method: 'POST' }); } catch {}
  window.location.href = '/login';
}

export async function requireAuth(): Promise<boolean> {
  try {
    const res = await authFetch('/auth/me');
    return res.ok;
  } catch {
    return false;
  }
}

export const getMe = async () => getProfile();

export async function getProfile(): Promise<User | null> {
  const res = await authFetch('/auth/me');
  // Return unauthenticated state for route guards to handle without full-page reload loops.
  if (res.status === 401) return null;
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
  const dmLimit = typeof data.dm_limit === 'number' ? data.dm_limit : null;
  const dmRemaining = typeof data.dm_remaining === 'number' ? data.dm_remaining : null;
  const apiSent = typeof data.dms_sent_this_month === 'number'
    ? data.dms_sent_this_month
    : typeof data.dm_sent_this_month === 'number'
      ? data.dm_sent_this_month
      : null;
  const derivedSent = apiSent ?? ((typeof dmLimit === 'number' && dmLimit > 0 && typeof dmRemaining === 'number') ? Math.max(0, dmLimit - dmRemaining) : 0);
  return {
    dms_sent_this_month: derivedSent,
    active_rules: data.active_rules ?? 0,
    dm_limit: dmLimit,
    dm_remaining: dmRemaining,
    plan: String(data.plan ?? 'free').toLowerCase(),
    total_dms_sent: typeof data.total_dms_sent === 'number' ? data.total_dms_sent : undefined,
    success_rate: typeof data.success_rate === 'number' ? data.success_rate : null,
    analytics_tier: data.analytics_tier === 'premium' ? 'premium' : 'basic',
    premium_analytics_enabled: Boolean(data.premium_analytics_enabled),
    avg_dms_per_day_30d: typeof data.avg_dms_per_day_30d === 'number' ? data.avg_dms_per_day_30d : null,
    best_day_30d: data.best_day_30d && typeof data.best_day_30d === 'object' ? data.best_day_30d : null,
    dm_failed_this_month: typeof data.dm_failed_this_month === 'number' ? data.dm_failed_this_month : undefined,
    peak_hour_utc: typeof data.peak_hour_utc === 'number' ? data.peak_hour_utc : null,
    busiest_weekday: typeof data.busiest_weekday === 'string' ? data.busiest_weekday : null,
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
    comment_target_type: payload.comment_target_type,
    comment_media_filter: payload.comment_media_filter,
    comment_media_id: payload.comment_media_id,
    comment_media_permalink: payload.comment_media_permalink,
    comment_media_caption: payload.comment_media_caption,
    comment_media_type: payload.comment_media_type,
    dm_attachment_url: payload.dm_attachment_url,
    dm_attachment_type: payload.dm_attachment_type,
    any_comment_keyword: payload.any_comment_keyword,
    public_comment_reply_enabled: payload.public_comment_reply_enabled,
    public_comment_reply_template: payload.public_comment_reply_template,
    ask_follow_before_dm: payload.ask_follow_before_dm,
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
  if (payload.comment_target_type !== undefined) backendPayload.comment_target_type = payload.comment_target_type;
  if (payload.comment_media_filter !== undefined) backendPayload.comment_media_filter = payload.comment_media_filter;
  if (payload.comment_media_id !== undefined) backendPayload.comment_media_id = payload.comment_media_id;
  if (payload.comment_media_permalink !== undefined) backendPayload.comment_media_permalink = payload.comment_media_permalink;
  if (payload.comment_media_caption !== undefined) backendPayload.comment_media_caption = payload.comment_media_caption;
  if (payload.comment_media_type !== undefined) backendPayload.comment_media_type = payload.comment_media_type;
  if (payload.dm_attachment_url !== undefined) backendPayload.dm_attachment_url = payload.dm_attachment_url;
  if (payload.dm_attachment_type !== undefined) backendPayload.dm_attachment_type = payload.dm_attachment_type;
  if (payload.any_comment_keyword !== undefined) backendPayload.any_comment_keyword = payload.any_comment_keyword;
  if (payload.public_comment_reply_enabled !== undefined) backendPayload.public_comment_reply_enabled = payload.public_comment_reply_enabled;
  if (payload.public_comment_reply_template !== undefined) backendPayload.public_comment_reply_template = payload.public_comment_reply_template;
  if (payload.ask_follow_before_dm !== undefined) backendPayload.ask_follow_before_dm = payload.ask_follow_before_dm;

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
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Failed to delete rule');
  }
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

export async function getPlanStatus(): Promise<PlanStatus> {
  const res = await authFetch('/plans/status', { method: 'GET' });
  const data = await res.json();
  if (!res.ok) {
    throw createApiRequestError(res.status, data, 'Failed to fetch plan status');
  }
  return data as PlanStatus;
}

export async function createPlanCheckout(
  plan: 'starter' | 'pro',
  billingCycle: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
): Promise<{
  subscription_id: string;
  checkout_url: string;
  key_id: string;
  prefill_email: string;
  plan: string;
  billing_cycle: string;
}> {
  const res = await authFetch('/billing/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ plan, billing_cycle: billingCycle }),
  });

  let data: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw createApiRequestError(res.status, text || 'Unexpected non-JSON response', 'Failed to create payment session');
    }
    throw new Error('Payment service returned an unexpected response format.');
  }

  if (!res.ok) {
    throw createApiRequestError(res.status, data, 'Failed to create payment session');
  }
  if (!data?.checkout_url && !data?.subscription_id) {
    throw new Error('Payment session returned invalid data. Please try again.');
  }

  return data as {
    subscription_id: string;
    checkout_url: string;
    key_id: string;
    prefill_email: string;
    plan: string;
    billing_cycle: string;
  };
}

export async function getCustomerPortalUrl(): Promise<{ portal_url: string }> {
  const res = await authFetch('/billing/portal', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get portal URL');
  return data;
}

export async function cancelPendingCheckout(): Promise<{ cancelled: boolean; message?: string }> {
  const res = await authFetch('/billing/cancel-pending', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw createApiRequestError(res.status, data, 'Failed to cancel pending checkout');
  return data as { cancelled: boolean; message?: string };
}

export async function requestRefund(reason: string, paymentId?: string): Promise<{ message: string }> {
  const res = await authFetch('/billing/refund', { method: 'POST', body: JSON.stringify({ reason, payment_id: paymentId || null }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to submit refund request');
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
    username: me.instagram_username || undefined,
    user_id: me.instagram_user_id || undefined,
    profile_picture: me.profile_picture || undefined,
    token_expires_at: stats?.ig_token_expires_at ?? undefined,
  };
}

export async function getInstagramMedia(mediaType: 'all' | 'post' | 'reel' = 'all', limit: number = 24): Promise<InstagramMediaItem[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const res = await authFetch(`/auth/instagram/media?media_type=${mediaType}&limit=${safeLimit}`);
  if (res.status === 401) return [];
  const data = await res.json();
  if (!res.ok) throw new Error(asErrorMessage(data, 'Failed to load Instagram media'));
  return Array.isArray(data?.media) ? data.media : [];
}

export async function getInstagramAuthUrl(): Promise<string> {
  const res = await authFetch('/auth/instagram/initiate');
  const data = await res.json();
  if (!res.ok || !data?.auth_url) {
    throw new Error(asErrorMessage(data, 'Failed to start Instagram connection'));
  }
  return data.auth_url as string;
}

export async function refreshInstagramToken(): Promise<{ refreshed: boolean; expires_at: string; message: string }> {
  const res = await authFetch('/auth/instagram/refresh-token', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(asErrorMessage(data, 'Failed to refresh Instagram token'));
  return data;
}

export async function disconnectInstagram() {
  const res = await authFetch('/auth/instagram/disconnect', { method: 'POST' });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(asErrorMessage(data, 'Failed to disconnect Instagram'));
  return data;
}

export async function injectInstagramToken(_token: string, _igUserId: string) {
  throw new Error('Direct token injection is disabled. Use the Instagram connect flow.');
}

export async function getContacts(page: number = 1): Promise<{ contacts: any[]; total: number }> {
  try {
    const res = await authFetch(`/dashboard/contacts?page=${page}&limit=20`);
    if (res.status === 401) { window.location.href = '/login'; return { contacts: [], total: 0 }; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to get contacts');
    return {
      contacts: Array.isArray(data?.contacts) ? data.contacts : [],
      total: data.total ?? 0,
    };
  } catch {
    return { contacts: [], total: 0 };
  }
}

export async function getContactStats(): Promise<{ total: number; limit: number | null }> {
  try {
    const res = await authFetch('/dashboard/contact-stats');
    if (res.status === 401) return { total: 0, limit: null };
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to get contact stats');
    return {
      total: data.total ?? 0,
      limit: data.limit ?? null,
    };
  } catch {
    return { total: 0, limit: null };
  }
}