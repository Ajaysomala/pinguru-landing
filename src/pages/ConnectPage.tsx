import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera, CheckCircle, RefreshCw, AlertTriangle,
  Link2, ShieldCheck, Zap, BarChart2, ExternalLink, Clock,
} from 'lucide-react';
import { getInstagramStatus, refreshInstagramToken, getInstagramAuthUrl } from '../lib/api';
import type { InstagramStatus } from '../lib/types';
import { formatRelativeTime, isTokenExpired } from '../lib/utils';
import '../styles/dashboard.css';
import '../styles/connect.css';

const HOW_STEPS = [
  { icon: <Link2 size={18}/>, iconBg:'linear-gradient(135deg,#EDE9FE,#DDD6FE)', iconColor:'#7C3AED', title:'Click "Connect Instagram"', desc:"You'll be redirected to Instagram to authorize PinGuru." },
  { icon: <ShieldCheck size={18}/>, iconBg:'linear-gradient(135deg,#ECFDF5,#A7F3D0)', iconColor:'#059669', title:'Grant permissions', desc:'Allow DM access and basic profile info — nothing else.' },
  { icon: <Zap size={18}/>, iconBg:'linear-gradient(135deg,#FEF3C7,#FDE68A)', iconColor:'#D97706', title:'Rules activate instantly', desc:'Your automation rules start working right away.' },
  { icon: <BarChart2 size={18}/>, iconBg:'linear-gradient(135deg,#EDE9FE,#DDD6FE)', iconColor:'#7C3AED', title:'Track in analytics', desc:'See every DM sent and rule triggered in the Analytics tab.' },
];

const ConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    if (igError) { setError(decodeURIComponent(igError)); return; }
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
    } catch (err: any) { setError(err.message || 'Failed to refresh token.'); }
    finally { setRefreshing(false); }
  };

  const handleOAuthRedirect = async () => {
    setError(''); setRedirecting(true);
    try { window.location.href = await getInstagramAuthUrl(); }
    catch (err: any) { setError(err?.message || 'Failed to start Instagram connection.'); setRedirecting(false); }
  };

  useEffect(() => {
    const shouldAutoStart = params.get('autostart') === '1';
    if (!shouldAutoStart || loading || oauthStarted || status?.connected) return;
    setOauthStarted(true); handleOAuthRedirect();
  }, [params, loading, oauthStarted, status]); // eslint-disable-line

  const tokenExpired = isTokenExpired(status?.token_expires_at);

  return (
    <div className="page-wrapper" style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{
        background:'linear-gradient(145deg,#0D0B1E 0%,#1A1040 50%,#220D3A 100%)',
        borderRadius:24, padding:'36px 28px',
        marginBottom:24, position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(circle at 80% 50%,rgba(219,39,119,0.25),transparent 55%)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(circle at 20% 50%,rgba(124,58,237,0.25),transparent 55%)',pointerEvents:'none' }}/>
        <div style={{ position:'relative',zIndex:1,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16 }}>
          <div>
            <span style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:999,background:'rgba(219,39,119,0.2)',border:'1px solid rgba(219,39,119,0.35)',color:'#F472B6',fontSize:'0.75rem',fontWeight:700,marginBottom:12 }}>
              <Camera size={12}/> Instagram Integration
            </span>
            <h1 style={{ fontFamily:'var(--font-display)',fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:800,color:'white',letterSpacing:'-0.03em',marginBottom:8 }}>
              Connect Instagram
            </h1>
            <p style={{ color:'rgba(255,255,255,0.6)',fontSize:'0.9375rem' }}>
              Link your business account to enable DM automation
            </p>
          </div>
          {!loading && (
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:10,background: status?.connected?'rgba(16,185,129,0.2)':'rgba(255,255,255,0.08)',border:`1px solid ${status?.connected?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.12)'}` }}>
                <span style={{ width:8,height:8,borderRadius:'50%',background:status?.connected?'#10B981':'#64748B',flexShrink:0 }}/>
                <span style={{ fontSize:'0.8125rem',fontWeight:600,color:status?.connected?'#6EE7B7':'rgba(255,255,255,0.5)' }}>
                  {status?.connected?'Connected':'Not connected'}
                </span>
              </div>
              {status?.connected && (
                <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:10,background:tokenExpired?'rgba(244,63,94,0.2)':'rgba(124,58,237,0.2)',border:`1px solid ${tokenExpired?'rgba(244,63,94,0.4)':'rgba(124,58,237,0.4)'}` }}>
                  <Clock size={12} style={{ color:tokenExpired?'#FDA4AF':'#C4B5FD' }}/>
                  <span style={{ fontSize:'0.8125rem',fontWeight:600,color:tokenExpired?'#FDA4AF':'#C4B5FD' }}>
                    {tokenExpired?'Token expired':'Token valid'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Alerts ────────────────────────────────────────── */}
      {error && (
        <div style={{ display:'flex',alignItems:'flex-start',gap:10,background:'var(--color-danger-light)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:14,padding:'14px 16px',marginBottom:20,fontSize:'0.875rem',color:'#9F1239' }}>
          <AlertTriangle size={15} style={{ flexShrink:0,marginTop:1 }}/> {error}
        </div>
      )}
      {successMsg && (
        <div style={{ display:'flex',alignItems:'flex-start',gap:10,background:'var(--color-success-light)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:14,padding:'14px 16px',marginBottom:20,fontSize:'0.875rem',color:'#065F46' }}>
          <CheckCircle size={15} style={{ flexShrink:0,marginTop:1 }}/> {successMsg}
        </div>
      )}
      {redirecting && (
        <div style={{ display:'flex',alignItems:'center',gap:10,background:'var(--color-primary-light)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:14,padding:'14px 16px',marginBottom:20,fontSize:'0.875rem',color:'var(--color-primary)' }}>
          <RefreshCw size={15} style={{ animation:'spin 1s linear infinite',flexShrink:0 }}/> Redirecting to Instagram…
        </div>
      )}

      <div style={{ display:'grid',gridTemplateColumns:'1fr 300px',gap:20,alignItems:'start' }} className="connect-grid-responsive">

        {/* ── Left: Status card ──────────────────────────── */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

          {/* Account status card */}
          <div style={{ background:'white',border:'1.5px solid var(--color-border)',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 20px rgba(124,58,237,0.07)' }}>
            <div style={{ padding:'18px 22px',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,rgba(219,39,119,0.12),rgba(124,58,237,0.08))',display:'flex',alignItems:'center',justifyContent:'center',color:'#DB2777' }}>
                <Camera size={16}/>
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:'0.9375rem',color:'var(--color-text)' }}>Account Status</div>
                <div style={{ fontSize:'0.78rem',color:'var(--color-muted)' }}>Instagram Business</div>
              </div>
            </div>
            <div style={{ padding:'22px' }}>
              {loading ? (
                <div style={{ display:'flex',justifyContent:'center',padding:'24px 0' }}>
                  <div style={{ width:24,height:24,border:'2px solid var(--color-primary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite' }}/>
                </div>
              ) : status?.connected ? (
                <div>
                  <div style={{ display:'flex',alignItems:'center',gap:14,padding:'16px',background:'var(--color-canvas)',borderRadius:14,marginBottom:18 }}>
                    {status.profile_picture ? (
                      <img src={status.profile_picture} alt="IG" style={{ width:52,height:52,borderRadius:'50%',objectFit:'cover',boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}/>
                    ) : (
                      <div style={{ width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#F472B6,#A78BFA)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'1.1rem',fontFamily:'var(--font-display)' }}>
                        {status.username?.[0]?.toUpperCase()?? 'I'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight:800,fontSize:'1rem',color:'var(--color-text)',marginBottom:4 }}>@{status.username}</div>
                      <div style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:999,background:'var(--color-success-light)',color:'#065F46',fontSize:'0.75rem',fontWeight:600 }}>
                        <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--color-success)',animation:'pulseDot 2s infinite' }}/> Connected
                      </div>
                    </div>
                  </div>

                  <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:20 }}>
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'0.875rem',padding:'10px 14px',background:'var(--color-canvas)',borderRadius:10 }}>
                      <span style={{ color:'var(--color-muted)',display:'flex',alignItems:'center',gap:6 }}><ShieldCheck size={13}/> Token status</span>
                      <span style={{ fontWeight:700,color:tokenExpired?'var(--color-danger)':'var(--color-success)',fontSize:'0.8125rem' }}>
                        {tokenExpired?'⚠ Expired':'✓ Valid'}
                      </span>
                    </div>
                    {status.token_expires_at && (
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'0.875rem',padding:'10px 14px',background:'var(--color-canvas)',borderRadius:10 }}>
                        <span style={{ color:'var(--color-muted)',display:'flex',alignItems:'center',gap:6 }}><Clock size={13}/> Expires</span>
                        <span style={{ fontWeight:600,color:'var(--color-text-secondary)' }}>{formatRelativeTime(status.token_expires_at)}</span>
                      </div>
                    )}
                  </div>

                  {tokenExpired && (
                    <div style={{ display:'flex',alignItems:'flex-start',gap:8,background:'var(--color-warning-light)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:12,padding:'12px 14px',marginBottom:16,fontSize:'0.8125rem',color:'#92400E' }}>
                      <AlertTriangle size={13} style={{ flexShrink:0,marginTop:1 }}/> Your token has expired. Refresh it to keep automation running.
                    </div>
                  )}

                  <div style={{ display:'flex',gap:10 }}>
                    <button onClick={handleRefreshToken} disabled={refreshing}
                      style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px',borderRadius:12,background:'linear-gradient(135deg,#7C3AED,#DB2777)',color:'white',fontWeight:700,fontSize:'0.875rem',border:'none',cursor:'pointer',boxShadow:'0 4px 14px rgba(124,58,237,0.3)',transition:'all 150ms',opacity:refreshing?0.7:1 }}>
                      <RefreshCw size={14} style={{ animation:refreshing?'spin 1s linear infinite':'none' }}/>
                      {refreshing?'Refreshing…':'Refresh Token'}
                    </button>
                    <button onClick={handleOAuthRedirect}
                      style={{ padding:'12px 16px',borderRadius:12,background:'var(--color-canvas)',border:'1.5px solid var(--color-border)',color:'var(--color-text-secondary)',fontWeight:600,fontSize:'0.875rem',cursor:'pointer',display:'flex',alignItems:'center',gap:6,transition:'all 150ms' }}
                      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='rgba(124,58,237,0.3)'; el.style.color='var(--color-primary)'; }}
                      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--color-border)'; el.style.color='var(--color-text-secondary)'; }}>
                      <ExternalLink size={13}/> Reconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:'center',padding:'20px 0' }}>
                  <div style={{ width:64,height:64,borderRadius:20,background:'linear-gradient(135deg,rgba(219,39,119,0.1),rgba(124,58,237,0.08))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px',border:'1px solid rgba(219,39,119,0.15)' }}>
                    <Camera size={28} style={{ color:'#DB2777' }}/>
                  </div>
                  <div style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.0625rem',color:'var(--color-text)',marginBottom:8 }}>Connect your Instagram</div>
                  <p style={{ fontSize:'0.875rem',color:'var(--color-muted)',marginBottom:24,lineHeight:1.6,maxWidth:280,margin:'0 auto 24px' }}>
                    Authorize PinGuru to manage your DMs. We only request the permissions we need.
                  </p>
                  <button type="button" onClick={handleOAuthRedirect} disabled={redirecting}
                    style={{ display:'inline-flex',alignItems:'center',gap:10,background:'linear-gradient(135deg,#7C3AED,#DB2777)',color:'white',fontWeight:700,padding:'14px 28px',borderRadius:14,border:'none',cursor:'pointer',boxShadow:'0 8px 24px rgba(124,58,237,0.35)',fontSize:'0.9375rem',transition:'all 150ms',opacity:redirecting?0.7:1 }}>
                    <Camera size={18}/> {redirecting?'Redirecting…':'Connect Instagram'}
                  </button>
                  <p style={{ fontSize:'0.78rem',color:'var(--color-muted)',marginTop:14 }}>
                    You'll be redirected to Instagram to approve access
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Permissions card */}
          <div style={{ background:'white',border:'1.5px solid var(--color-border)',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 20px rgba(124,58,237,0.05)' }}>
            <div style={{ padding:'18px 22px',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={{ width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#ECFDF5,#A7F3D0)',display:'flex',alignItems:'center',justifyContent:'center',color:'#059669' }}>
                  <ShieldCheck size={15}/>
                </div>
                <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:'0.9rem',color:'var(--color-text)' }}>What we request</div>
              </div>
              <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:999,background:'var(--color-success-light)',color:'#065F46',fontSize:'0.72rem',fontWeight:700 }}>
                <CheckCircle size={10}/> Essential only
              </span>
            </div>
            <div style={{ padding:'18px 22px',display:'flex',flexDirection:'column',gap:14 }}>
              {[
                { perm:'instagram_basic', title:'Basic profile access', desc:'Read your username and profile picture.' },
                { perm:'instagram_manage_messages', title:'Message access', desc:'Send and receive DMs to run your automation workflows.' },
              ].map(item=>(
                <div key={item.perm} style={{ display:'flex',alignItems:'flex-start',gap:12 }}>
                  <div style={{ width:28,height:28,borderRadius:8,background:'var(--color-success-light)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-success)',flexShrink:0,marginTop:2 }}>
                    <CheckCircle size={14}/>
                  </div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:'0.875rem',color:'var(--color-text)',marginBottom:3 }}>{item.title}</div>
                    <div style={{ fontSize:'0.75rem',color:'var(--color-muted)',fontFamily:'var(--font-mono)',marginBottom:4,background:'var(--color-canvas)',padding:'2px 7px',borderRadius:5,display:'inline-block' }}>{item.perm}</div>
                    <div style={{ fontSize:'0.8125rem',color:'var(--color-muted)',lineHeight:1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize:'0.78rem',color:'var(--color-muted)',padding:'12px 14px',background:'var(--color-canvas)',borderRadius:10,lineHeight:1.5,borderLeft:'3px solid var(--color-success)' }}>
                We never post on your behalf, access your followers list, or request unnecessary permissions.
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: How It Works ────────────────────────── */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <div style={{ background:'white',border:'1.5px solid var(--color-border)',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 20px rgba(124,58,237,0.05)' }}>
            <div style={{ padding:'18px 22px',borderBottom:'1px solid var(--color-border)' }}>
              <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:'0.9375rem',color:'var(--color-text)' }}>How It Works</div>
              <div style={{ fontSize:'0.78rem',color:'var(--color-muted)',marginTop:3 }}>4 simple steps to go live</div>
            </div>
            <div style={{ padding:'22px',display:'flex',flexDirection:'column',gap:0 }}>
              {HOW_STEPS.map((step,i)=>(
                <div key={i} style={{ display:'flex',gap:14 }}>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center' }}>
                    <div style={{ width:40,height:40,borderRadius:12,background:step.iconBg,display:'flex',alignItems:'center',justifyContent:'center',color:step.iconColor,flexShrink:0 }}>
                      {step.icon}
                    </div>
                    {i<HOW_STEPS.length-1&&<div style={{ width:2,flex:1,background:'var(--color-border)',margin:'6px 0',borderRadius:1 }}/>}
                  </div>
                  <div style={{ paddingBottom:i<HOW_STEPS.length-1?16:0,paddingTop:8 }}>
                    <div style={{ fontWeight:700,fontSize:'0.875rem',color:'var(--color-text)',marginBottom:4 }}>{step.title}</div>
                    <div style={{ fontSize:'0.8rem',color:'var(--color-muted)',lineHeight:1.5 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta compliance note */}
          <div style={{ background:'linear-gradient(145deg,#0D0B1E,#1A1040)',borderRadius:18,padding:'20px',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',inset:0,background:'radial-gradient(circle at 0% 100%,rgba(16,185,129,0.2),transparent 60%)',pointerEvents:'none' }}/>
            <div style={{ position:'relative',zIndex:1,display:'flex',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'rgba(16,185,129,0.2)',border:'1px solid rgba(16,185,129,0.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'#6EE7B7',flexShrink:0 }}>
                <ShieldCheck size={16}/>
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:'0.875rem',color:'white',marginBottom:6 }}>Meta Platform Policy</div>
                <div style={{ fontSize:'0.78rem',color:'rgba(255,255,255,0.55)',lineHeight:1.6 }}>
                  PinGuru is fully compliant with Meta Platform Policy. Your data is never sold or shared.{' '}
                  <Link to="/settings" style={{ color:'#6EE7B7',fontWeight:600 }}>Revoke access anytime</Link> from settings.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
