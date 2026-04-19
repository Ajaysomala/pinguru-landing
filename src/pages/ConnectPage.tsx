import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera, CheckCircle, RefreshCw, AlertTriangle,
  Link2, ShieldCheck, Zap, BarChart2, ExternalLink,
} from 'lucide-react';
import { getInstagramStatus, refreshInstagramToken, getInstagramAuthUrl } from '../lib/api';
import type { InstagramStatus } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime, isTokenExpired } from '../lib/utils';
import '../styles/dashboard.css';
import '../styles/connect.css';

// ── How It Works steps ────────────────────────────────────────────────────────
const HOW_STEPS = [
  { icon: <Link2 size={18} className="text-primary" />, title: 'Click "Connect Instagram"', desc: "You'll be redirected to Instagram to authorize PinGuru." },
  { icon: <ShieldCheck size={18} className="text-emerald-600" />, title: 'Grant permissions', desc: 'Allow DM access and basic profile info - nothing else.' },
  { icon: <Zap size={18} className="text-amber-600" />, title: 'Rules activate instantly', desc: 'Your automation rules start working right away.' },
  { icon: <BarChart2 size={18} className="text-violet-600" />, title: 'Track in analytics', desc: 'See every DM sent and rule triggered in the Analytics tab.' },
];

// ── ConnectPage ───────────────────────────────────────────────────────────────
const ConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [status, setStatus]           = useState<InstagramStatus | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [oauthStarted, setOauthStarted] = useState(false);

  const fetchStatusWithRetry = async (attempts = 1, waitMs = 800): Promise<InstagramStatus | null> => {
    let last: InstagramStatus | null = null;
    for (let i = 0; i < attempts; i += 1) {
      const next = await getInstagramStatus();
      last = next;
      setStatus(next);
      if (next?.connected) return next;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
    return last;
  };

  // Load IG status on mount
  useEffect(() => {
    fetchStatusWithRetry(1)
      .finally(() => setLoading(false));
  }, []);

  // Handle backend callback flags from /auth/instagram/callback redirect
  useEffect(() => {
    const igConnected = params.get('ig_connected');
    const igError = params.get('ig_error');

    if (igError) {
      setError(decodeURIComponent(igError));
      return;
    }

    if (igConnected === 'true') {
      setSuccessMsg('Instagram connected successfully!');
      setError(''); // clear any stale error
      // Optimistic update prevents contradictory UI while backend status settles.
      setStatus(prev => ({ ...(prev ?? {}), connected: true }));
      fetchStatusWithRetry(5, 1200).then((s) => {
        if (s?.connected) {
          setError(''); // confirmed — ensure no leftover error shown
        } else {
          setSuccessMsg(''); // retract optimistic success
          setError('Instagram authorization completed, but this logged-in Pinguru account is not linked yet. Please sign in with the same Pinguru email used for Connect and retry once.');
        }
      });
      window.history.replaceState({}, '', '/connect');
      return;
    }
  }, [params]); // eslint-disable-line

  const handleRefreshToken = async () => {
    setRefreshing(true); setError('');
    try {
      await refreshInstagramToken();
      const fresh = await getInstagramStatus();
      setStatus(fresh);
      setSuccessMsg('Token refreshed successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh token.');
    } finally { setRefreshing(false); }
  };

  const tokenExpired = isTokenExpired(status?.token_expires_at);

  const handleOAuthRedirect = async () => {
    setError('');
    setRedirecting(true);
    try {
      const oauthUrl = await getInstagramAuthUrl();
      window.location.href = oauthUrl;
    } catch (err: any) {
      setError(err?.message || 'Failed to start Instagram connection.');
      setRedirecting(false);
    }
  };

  useEffect(() => {
    const shouldAutoStart = params.get('autostart') === '1';
    if (!shouldAutoStart || loading || oauthStarted) return;
    if (status?.connected) return;

    setOauthStarted(true);
    handleOAuthRedirect();
  }, [params, loading, oauthStarted, status]);

  return (
    <div className="page-wrapper connect-page">
      <div className="page-header">
        <h1 className="page-title">Connect Instagram</h1>
        <p className="page-subtitle">Link your business Instagram account to enable DM automation</p>
        {!loading && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <Badge variant={status?.connected ? 'green' : 'gray'} dot>{status?.connected ? 'Connected' : 'Not connected'}</Badge>
            {status?.connected && (
              <Badge variant={tokenExpired ? 'red' : 'indigo'}>{tokenExpired ? 'Token expired' : 'Token valid'}</Badge>
            )}
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="connect-alert flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5"/>
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <CheckCircle size={15} className="flex-shrink-0 mt-0.5"/>
          <span>{successMsg}</span>
        </div>
      )}
      {redirecting && (
        <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>Redirecting to Instagram…</span>
        </div>
      )}

      <div className="connect-grid">
        {/* Left — connect / status card */}
        <div className="connect-main-col flex flex-col gap-5">

          {/* Main connect card */}
          <div className="card connect-main-card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '20px 22px 0' }}>
              <span className="card-title flex items-center gap-2">
                <Camera size={16} className="text-pink-500"/> Account Status
              </span>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
              ) : status?.connected ? (
                /* ── Connected State ── */
                <div>
                  {/* Profile row */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-5">
                    {status.profile_picture ? (
                      <img src={status.profile_picture} alt="IG" className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow"/>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow">
                        {status.username?.[0]?.toUpperCase() ?? 'I'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900">@{status.username}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {status.user_id}</p>
                      <div className="mt-1">
                        <Badge variant="green" dot>Connected</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Token info */}
                  <div className="flex flex-col gap-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Token status</span>
                      {tokenExpired ? (
                        <Badge variant="red" dot>Expired</Badge>
                      ) : (
                        <Badge variant="green" dot>Valid</Badge>
                      )}
                    </div>
                    {status.token_expires_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Expires</span>
                        <span className="text-slate-700 font-medium">{formatRelativeTime(status.token_expires_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Token warning */}
                  {tokenExpired && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4 text-xs text-amber-700">
                      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5"/>
                      <span>Your token has expired. Refresh it to keep automation running.</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleRefreshToken} disabled={refreshing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''}/>
                      {refreshing ? 'Refreshing…' : 'Refresh Token'}
                    </button>
                    <a
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault();
                        await handleOAuthRedirect();
                      }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      <ExternalLink size={13}/>
                      Reconnect
                    </a>
                  </div>
                </div>
              ) : (
                /* ── Not Connected State ── */
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-50 to-violet-50 flex items-center justify-center mx-auto mb-4 ring-1 ring-pink-100">
                    <Camera size={30} className="text-pink-500"/>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Connect your Instagram</h2>
                  <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                    Authorize PinGuru to manage your DMs. We only request the permissions we need.
                  </p>
                  <button
                    type="button"
                    onClick={handleOAuthRedirect}
                    disabled={redirecting}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera size={18}/>
                    {redirecting ? 'Redirecting…' : 'Connect Instagram'}
                  </button>
                  <p className="text-xs text-slate-400 mt-4">
                    You'll be redirected to Instagram to approve access
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Permissions info */}
          <div className="card">
            <div className="card-header">
              <span className="card-title flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-500"/> What we request
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { perm: 'instagram_basic',           desc: 'Read your username and profile picture' },
                { perm: 'instagram_manage_messages', desc: 'Send and receive DMs on your behalf' },
              ].map(item => (
                <div key={item.perm} className="flex items-start gap-2.5">
                  <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                  <div>
                    <code className="text-xs font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{item.perm}</code>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-1 border-t border-slate-100 pt-3">
                We never post on your behalf, access your followers list, or request unnecessary permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Right — How It Works */}
        <div className="connect-side-col flex flex-col gap-5">
          <div className="card connect-side-card">
            <div className="card-header">
              <span className="card-title">How It Works</span>
            </div>
            <div className="flex flex-col gap-5">
              {HOW_STEPS.map((step, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      {step.icon}
                    </div>
                    {i < HOW_STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-slate-100 my-2"/>
                    )}
                  </div>
                  <div className="pb-1 pt-1">
                    <p className="font-semibold text-slate-800 text-sm">{step.title}</p>
                    <p className="connect-how-desc text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta compliance note */}
          <div className="card connect-side-card connect-policy-card" style={{ background: '#FAFAFA' }}>
            <div className="flex items-start gap-3">
              <ShieldCheck size={18} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="font-semibold text-slate-800 text-sm mb-1">Meta Platform Policy</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  PinGuru is built in compliance with Meta's Platform Policy. Your data is never sold or shared with third parties.
                  You can revoke access anytime from your Instagram settings or via{' '}
                  <a href="/settings" className="text-primary hover:underline">Settings → Delete My Data</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
