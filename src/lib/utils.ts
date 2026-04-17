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

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function isTokenExpired(expiresAt?: string): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
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
  free:    200,
  starter: 1000,
  pro:     5000,
};

export const PLAN_RULE_LIMITS: Record<string, number> = {
  free:    1,
  starter: 5,
  pro:     -1, // unlimited
};

export function getPlanDmLimit(plan: string): number {
  return PLAN_DM_LIMITS[plan.toLowerCase()] ?? 200;
}

export function classNames(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
