import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { InstagramStatus } from '../../lib/types';
import { needsReconnect } from '../../lib/instagram';

export const ReconnectBanner: React.FC<{ status: InstagramStatus | null; onReconnect: () => void; busy?: boolean }> = ({ status, onReconnect, busy }) => {
  if (!needsReconnect(status)) return null;
  const expired = status?.connection_status === 'expired';
  return (
    <div role="alert" className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-slate-900 dark:text-white">
          {expired ? 'Your Instagram connection has expired' : 'Instagram needs you to sign in again'}
        </p>
        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
          Automations are paused for {status?.username ? `@${status.username}` : 'this account'} until you reconnect.
        </p>
      </div>
      <button
        type="button"
        onClick={onReconnect}
        disabled={busy}
        className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
        Reconnect Instagram
      </button>
    </div>
  );
};

export const WebhookWarning: React.FC<{ status: InstagramStatus | null }> = ({ status }) => {
  if (!status?.connected || status.webhook_subscribed !== false || needsReconnect(status)) return null;
  return (
    <div role="status" className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
      <span>
        Instagram is not sending new messages and comments to PinGuru yet, so automations will not fire.
        Disconnect and connect the account again to fix this. If it keeps happening, contact support.
      </span>
    </div>
  );
};

// Plain Indian grouping (15,230); compact notation renders as "15T" in some browsers.
const formatFollowers = (n: number) => new Intl.NumberFormat('en-IN').format(n);
const formatAccountType = (t: string) => t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Avatar, username, account type and followers: each shown only if the backend sent it. */
export const InstagramAccountSummary: React.FC<{ status: InstagramStatus }> = ({ status }) => {
  const details = [
    status.account_type ? formatAccountType(status.account_type) : null,
    typeof status.followers_count === 'number' ? `${formatFollowers(status.followers_count)} followers` : null,
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-3 min-w-0">
      {status.profile_picture_url ? (
        <img
          src={status.profile_picture_url}
          alt={status.username ? `@${status.username} profile picture` : 'Instagram profile picture'}
          width={40}
          height={40}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10 shrink-0"
        />
      ) : null}
      <div className="min-w-0">
        {status.username && <p className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">@{status.username}</p>}
        {details.length > 0 && <p className="text-xs text-slate-600 dark:text-zinc-400">{details.join(' · ')}</p>}
      </div>
    </div>
  );
};
