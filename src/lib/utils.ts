// src/lib/utils.ts
// Utility helpers ported from vanilla JS utils.js

export function escHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function toTitleCase(value = ''): string {
  if (!value) return 'Free';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function getDisplayName(profile: { instagram_username?: string; email?: string; first_name?: string; last_name?: string; display_name?: string } | null): string {
  if (!profile) return 'User';
  if (profile.display_name) return profile.display_name;
  if (profile.first_name) return profile.first_name;
  if (profile.instagram_username) return `@${profile.instagram_username}`;
  if (profile.email) return profile.email.split('@')[0];
  return 'PinGuru User';
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatRelativeTime(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Unknown';
  // Handle unix timestamp in seconds (e.g. 1700000000) vs milliseconds
  let date: Date;
  if (typeof value === 'number') {
    // If number is suspiciously small, treat as seconds
    date = value < 1e12 ? new Date(value * 1000) : new Date(value);
  } else {
    date = new Date(value);
  }
  if (isNaN(date.getTime())) return 'Unknown';

  const diff = Date.now() - date.getTime();

  // Future date = token expiry in the future → show "in X days"
  if (diff < 0) {
    const future = Math.abs(diff);
    const fDays = Math.floor(future / 86400000);
    if (fDays > 0) return `in ${fDays}d`;
    const fHours = Math.floor(future / 3600000);
    if (fHours > 0) return `in ${fHours}h`;
    return `in ${Math.floor(future / 60000)}m`;
  }

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatExpiryRelative(expiresAt?: string | number | null): string {
  return formatRelativeTime(expiresAt);
}

export function isTokenExpired(expiresAt?: string | number | null): boolean {
  if (!expiresAt) return true;
  const date = typeof expiresAt === 'number'
    ? (expiresAt < 1e12 ? new Date(expiresAt * 1000) : new Date(expiresAt))
    : new Date(expiresAt);
  if (isNaN(date.getTime())) return true;
  return date < new Date();
}

// Login attempt lockout helpers (localStorage)
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export function recordLoginAttempt(): { remaining: number; locked: boolean } {
  const now = Date.now();
  const raw = localStorage.getItem('pg_login_attempts');
  const data = raw ? JSON.parse(raw) : { count: 0, since: now };

  data.count += 1;

  if (data.count >= MAX_ATTEMPTS) {
    localStorage.setItem('pg_lockout_until', String(now + LOCKOUT_MINUTES * 60 * 1000));
    localStorage.removeItem('pg_login_attempts');
    return { remaining: 0, locked: true };
  }

  localStorage.setItem('pg_login_attempts', JSON.stringify(data));
  return { remaining: MAX_ATTEMPTS - data.count, locked: false };
}

export function isLockedOut(): { locked: boolean; remainingMs: number } {
  const until = localStorage.getItem('pg_lockout_until');
  if (!until) return { locked: false, remainingMs: 0 };
  const remainingMs = parseInt(until) - Date.now();
  if (remainingMs <= 0) {
    localStorage.removeItem('pg_lockout_until');
    return { locked: false, remainingMs: 0 };
  }
  return { locked: true, remainingMs };
}

export function resetLoginAttempts(): void {
  localStorage.removeItem('pg_login_attempts');
  localStorage.removeItem('pg_lockout_until');
}

export function formatLockoutTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

// Plan helpers
export const PLAN_DM_LIMITS: Record<string, number> = {
  free:    -1,
  starter: -1,
  pro:     -1,
};

export const PLAN_RULE_LIMITS: Record<string, number> = {
  free:    5,
  starter: 15,
  pro:     -1, // unlimited
};

export function getPlanDmLimit(plan: string): number {
  return PLAN_DM_LIMITS[plan.toLowerCase()] ?? -1;
}

export function classNames(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function sanitizeApiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!err) return fallback;
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('<!DOCTYPE') || msg.includes('<html') || msg.includes('<body') || msg.includes('502') || msg.includes('503') || msg.includes('504')) {
    return 'Service temporarily unavailable. Please refresh and try again.';
  }
  if (msg.length > 240) return fallback;
  return msg;
}