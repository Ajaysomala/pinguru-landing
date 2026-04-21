import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Camera, CheckCircle, RefreshCw, AlertTriangle,
  Link2, ShieldCheck, Zap, BarChart2, ExternalLink, Clock, Sparkles, ArrowRight,
} from 'lucide-react';
import { getInstagramStatus, refreshInstagramToken, getInstagramAuthUrl, disconnectInstagram } from '../lib/api';
import type { InstagramStatus } from '../lib/types';
import { formatExpiryRelative, isTokenExpired, sanitizeApiError } from '../lib/utils';
import '../styles/dashboard.css';
import '../styles/connect.css';

const HOW_STEPS = [
  { icon: <Link2 size={17}/>, title:'Connect Instagram', desc:'Authorize your Instagram Business account via secure Meta OAuth.' },
  { icon: <ShieldCheck size={17}/>, title:'Grant required permissions', desc:'PinGuru only requests profile and DM permissions needed for automation.' },
  { icon: <Zap size={17}/>, title:'Activate automations', desc:'Your rules can start responding immediately after a successful connection.' },
  { icon: <BarChart2 size={17}/>, title:'Monitor performance', desc:'Review DM activity and trigger insights in your Analytics dashboard.' },
];

const ConnectPage: React.FC = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [oauthStarted, setOauthStarted] = useState(false);

  const fetchStatusWithRetry = async (attempts = 1, waitMs = 800): Promise<InstagramStatus | null> => {
    let last: InstagramStatus | null = null;
    for (let i = 0; i < attempts; i++) {
      const next = await getInstagramStatus();
      last = next; setStatus(next);
      if (next?.connected) return next;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, waitMs));
    }
    return last;
  };

  useEffect(() => { fetchStatusWithRetry(1).finally(() => setLoading(false)); }, []);

  useEffect(() => {
    const igConnected = params.get('ig_connected');
    const igError = params.get('ig_error');
    if (igError) { setError(sanitizeApiError(decodeURIComponent(igError))); return; }
    if (igConnected === 'true') {
      setSuccessMsg('Instagram connected successfully!');
      setError('');
      setStatus(prev => ({ ...(prev ?? {}), connected: true }));
      fetchStatusWithRetry(5, 1200).then(s => {
        if (s?.connected) { setError(''); }
        else { setSuccessMsg(''); setError('Instagram authorization completed, but this logged-in Pinguru account is not linked yet. Please sign in with the same Pinguru email used for Connect and retry once.'); }
      });
      window.history.replaceState({}, '', '/connect');
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
    } catch (err: any) { setError(sanitizeApiError(err, 'Failed to refresh token.')); }
    finally { setRefreshing(false); }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Instagram from PinGuru?')) return;
    setDisconnecting(true);
    setError('');
    try {
      await disconnectInstagram();
      const fresh = await getInstagramStatus();
      setStatus(fresh);
      setSuccessMsg('Instagram disconnected successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(sanitizeApiError(err, 'Failed to disconnect Instagram.'));
    } finally {
      setDisconnecting(false);
    }
  };

  const handleOAuthRedirect = async () => {
    setError(''); setRedirecting(true);
    try { window.location.href = await getInstagramAuthUrl(); }
    catch (err: any) { setError(sanitizeApiError(err, 'Failed to start Instagram connection.')); setRedirecting(false); }
  };

  useEffect(() => {
    const shouldAutoStart = params.get('autostart') === '1';
    if (!shouldAutoStart || loading || oauthStarted || status?.connected) return;
    setOauthStarted(true); handleOAuthRedirect();
  }, [params, loading, oauthStarted, status]); // eslint-disable-line

  const tokenExpired = isTokenExpired(status?.token_expires_at);
  const isConnected = Boolean(status?.connected);
  const healthLabel = isConnected && !tokenExpired ? 'Active & Healthy' : isConnected ? 'Connected · Attention Needed' : 'Not Connected';
  const heroSubtitle = isConnected
    ? 'Your Instagram connection is live. Manage token health and account access below.'
    : 'Link your Instagram Business account to start sending compliant DM automations.';

  return (
    <div className="page-wrapper connect-v5-page">
      <section className="connect-v5-hero">
        <div className="connect-v5-orb connect-v5-orb-a" />
        <div className="connect-v5-orb connect-v5-orb-b" />

        <div className="connect-v5-hero-copy">
          <p className="connect-v5-kicker"><Sparkles size={12} /> Instagram Integration</p>
          <h1 className="connect-v5-title">Connect Instagram</h1>
          <p className="connect-v5-subtitle">{heroSubtitle}</p>

          <div className="connect-v5-hero-actions">
            {!isConnected ? (
              <button className="connect-v5-btn primary" onClick={handleOAuthRedirect} disabled={redirecting}>
                <Link2 size={14} /> {redirecting ? 'Redirecting...' : 'Connect Instagram'}
              </button>
            ) : (
              <button className="connect-v5-btn secondary" onClick={handleOAuthRedirect}>
                <ExternalLink size={14} /> Reconnect Account
              </button>
            )}
            <span className={`connect-v5-health ${isConnected && !tokenExpired ? 'good' : isConnected ? 'warn' : 'off'}`}>
              <CheckCircle size={13} /> {healthLabel}
            </span>
          </div>
        </div>

        <div className="connect-v5-hero-panel">
          <div className="connect-v5-stat">
            <span>Instagram</span>
            <strong>{isConnected ? 'Connected' : 'Disconnected'}</strong>
          </div>
          <div className="connect-v5-stat">
            <span>Token</span>
            <strong>{isConnected ? (tokenExpired ? 'Expired' : 'Active') : 'Unavailable'}</strong>
          </div>
          <div className="connect-v5-stat">
            <span>Expiry</span>
            <strong>{status?.token_expires_at ? formatExpiryRelative(status.token_expires_at) : 'Unknown'}</strong>
          </div>
        </div>
      </section>

      {error && (
        <div className="connect-v5-alert error">
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="connect-v5-alert success">
          <CheckCircle size={15} />
          <span>{successMsg}</span>
        </div>
      )}
      {redirecting && (
        <div className="connect-v5-alert info">
          <RefreshCw size={15} className="spin" />
          <span>Redirecting to Instagram...</span>
        </div>
      )}

      <div className="connect-v5-grid">
        <section className="connect-v5-main-card">
          {loading ? (
            <div className="connect-v5-loading">
              <RefreshCw size={22} className="spin" />
            </div>
          ) : isConnected ? (
            <>
              <div className="connect-v5-account-head">
                <div className="connect-v5-account-user">
                  {status?.profile_picture ? (
                    <img src={status.profile_picture} alt="Instagram" className="connect-v5-avatar-image" />
                  ) : (
                    <div className="connect-v5-avatar-fallback">{status?.username?.[0]?.toUpperCase() ?? 'I'}</div>
                  )}
                  <div>
                    <p className="connect-v5-username">@{status?.username}</p>
                    <p className="connect-v5-user-sub">Instagram Business Connected</p>
                  </div>
                </div>
              </div>

              <div className="connect-v5-meta-list">
                <div className="connect-v5-meta-row">
                  <span><ShieldCheck size={12} /> Token status</span>
                  <strong className={tokenExpired ? 'expired' : 'healthy'}>{tokenExpired ? 'Expired Token' : 'Active Token'}</strong>
                </div>
                <div className="connect-v5-meta-row">
                  <span><Clock size={12} /> Expires</span>
                  <strong>{status?.token_expires_at ? `Expires ${formatExpiryRelative(status.token_expires_at)}` : 'Unknown'}</strong>
                </div>
              </div>

              <div className="connect-v5-actions">
                <button className="connect-v5-btn primary" onClick={handleRefreshToken} disabled={refreshing}>
                  <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                  {refreshing ? 'Refreshing...' : 'Refresh Token'}
                </button>
                <button className="connect-v5-btn secondary" onClick={handleOAuthRedirect}>
                  <ExternalLink size={14} /> Reconnect
                </button>
                <button className="connect-v5-btn danger" onClick={handleDisconnect} disabled={disconnecting}>
                  <AlertTriangle size={14} /> {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>

              <div className="connect-v5-perms">
                <h3><CheckCircle size={14} /> Permission Scope</h3>
                <ul>
                  <li><Camera size={13} /> Profile Info</li>
                  <li><ShieldCheck size={13} /> DM Access</li>
                </ul>
                <p>PinGuru uses only essential permissions needed for automation workflows.</p>
              </div>
            </>
          ) : (
            <div className="connect-v5-empty">
              <div className="connect-v5-empty-icon"><Camera size={28} /></div>
              <h3>Connect your Instagram Business account</h3>
              <p>Authorize PinGuru via Meta to start compliant DM automations, analytics tracking, and lead capture flows.</p>
              <button className="connect-v5-btn primary" onClick={handleOAuthRedirect} disabled={redirecting}>
                <Link2 size={14} /> {redirecting ? 'Redirecting...' : 'Connect Instagram'}
              </button>
            </div>
          )}
        </section>

        <aside className="connect-v5-side-card">
          <h3>Quick Setup Guide</h3>
          <div className="connect-v5-step-list">
            {HOW_STEPS.map((step, i) => (
              <div key={step.title} className="connect-v5-step-item">
                <div className="connect-v5-step-icon">{step.icon}</div>
                <div>
                  <p className="connect-v5-step-title">{step.title}</p>
                  <p className="connect-v5-step-desc">{step.desc}</p>
                </div>
                {i < HOW_STEPS.length - 1 && <div className="connect-v5-step-line" />}
              </div>
            ))}
          </div>

          <div className="connect-v5-policy">
            <p>Meta Policy Compliant</p>
            <Link to="/privacy">Learn more <ArrowRight size={12} /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ConnectPage;
