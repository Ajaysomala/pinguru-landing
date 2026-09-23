import React, { useState, useEffect, useCallback } from 'react';
import { 
  Instagram, 
  Share2, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Radio, 
  Unlink,
  AlertCircle
} from 'lucide-react';
import { Card3D } from '../components/ui/Card3D';
import { getInstagramStatus, getInstagramAuthUrl, disconnectInstagram, refreshInstagramToken } from '../lib/api';
import { useToast } from '../context/ToastContext';

export const ConnectPage: React.FC = () => {
  const { showToast } = useToast();

  const [status, setStatus] = useState<{
    connected: boolean;
    username?: string;
    user_id?: string;
    profile_picture?: string;
    token_expires_at?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInstagramStatus();
      setStatus(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve Instagram status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    setIsActionLoading(true);
    try {
      const url = await getInstagramAuthUrl();
      if (url) {
        window.location.href = url;
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate Meta OAuth';
      showToast(msg);
      setIsActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect this Instagram account? Active automations will be paused.')) {
      return;
    }
    setIsActionLoading(true);
    try {
      await disconnectInstagram();
      showToast('Instagram account disconnected.');
      await fetchStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disconnect account';
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsActionLoading(true);
    try {
      const res = await refreshInstagramToken();
      showToast(res.message || 'Meta OAuth access token refreshed successfully.');
      await fetchStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh token';
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-3xl bg-slate-900/60 animate-pulse border border-white/[0.05]" />
        <div className="h-48 rounded-3xl bg-slate-900/60 animate-pulse border border-white/[0.05]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-md">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <span>Instagram & Meta Integration</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Connect your Instagram Business or Creator account to enable real-time DM & comment automation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {status?.connected && (
            <button
              onClick={handleRefreshToken}
              disabled={isActionLoading}
              className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-2xl border border-white/[0.08] transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isActionLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Token</span>
            </button>
          )}

          {status?.connected ? (
            <button
              onClick={handleDisconnect}
              disabled={isActionLoading}
              className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-2xl border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isActionLoading}
              className="flex-1 sm:flex-initial min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isActionLoading ? 'Connecting...' : 'Connect Instagram Account'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Connection Status 3D Card */}
      <Card3D intensity={6} glowColor="rgba(236, 72, 153, 0.25)">
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900 to-purple-950/60 border border-white/[0.1] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2.5px] shadow-lg shadow-purple-600/30 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-white text-xl font-black">
                  {status?.username ? status.username.slice(0, 2).toUpperCase() : 'IG'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white font-mono">
                    {status?.connected ? `@${status.username}` : 'No Account Connected'}
                  </h2>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                      status?.connected
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {status?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {status?.connected
                    ? `Account ID: ${status.user_id || 'Meta Verified'}`
                    : 'Click "Connect Instagram Account" to authorize PinGuru via Meta OAuth.'}
                </p>
              </div>
            </div>

            {/* Read-only Live Indicator Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">API State</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-1 text-[11px]">
                  <Radio className="w-3 h-3 animate-pulse" />
                  {status?.connected ? 'Active & Live' : 'Standby'}
                </span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Token Expiry</span>
                <span className="text-slate-300 font-medium mt-1 block truncate text-[11px]">
                  {status?.token_expires_at || (status?.connected ? '60 Days Lifetime' : 'N/A')}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions & Scopes Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Approved Meta Graph API Permissions
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                {status?.connected ? 'Active' : 'Pending Authorization'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  scope: 'instagram_manage_messages',
                  description: 'Send and receive direct messages, replies, and quick replies.',
                },
                {
                  scope: 'pages_manage_metadata',
                  description: 'Subscribe to webhooks and verify page webhook endpoints.',
                },
                {
                  scope: 'pages_read_engagement',
                  description: 'Read comments, reactions, and story mention metadata.',
                },
                {
                  scope: 'instagram_basic',
                  description: 'Access basic Instagram account profile and follower metrics.',
                },
              ].map((p) => (
                <div 
                  key={p.scope}
                  className="p-3.5 bg-slate-950/70 border border-white/[0.06] rounded-2xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-300 font-bold truncate">
                      {p.scope}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card3D>

      {/* Security & Architecture Marker */}
      <div className="p-4 bg-slate-900/60 border border-white/[0.06] rounded-2xl text-[11px] text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Meta Graph API v20.0 official connection. End-to-end webhook verification managed automatically.</span>
      </div>
    </div>
  );
};

export default ConnectPage;
