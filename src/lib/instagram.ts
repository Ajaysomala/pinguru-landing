import type { InstagramStatus } from './types';

/**
 * Turns the ?ig_error= message from the backend's Instagram OAuth callback into
 * something a user can act on. Unknown messages are shown as sent.
 */
export function describeInstagramOAuthError(raw: string): string {
  const message = raw.trim();
  if (/invalid oauth state/i.test(message)) {
    return 'The Instagram connection could not be verified. The link may have expired or been opened in another browser. Please start the connection again from this page.';
  }
  const missing = message.match(/missing required instagram permissions:\s*([^.]+)/i);
  if (missing) {
    return `Instagram did not grant every permission PinGuru needs (${missing[1].trim()}). Please connect again and keep all permissions switched on.`;
  }
  return message || 'Instagram connection failed. Please try again.';
}

export function needsReconnect(status: InstagramStatus | null): boolean {
  return status?.connection_status === 'needs_reauth' || status?.connection_status === 'expired';
}
