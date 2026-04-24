import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Zap, CreditCard, Camera, Plus,
  RefreshCw, TrendingUp, CheckCircle, Lock,
  ArrowUpRight, Sparkles, Clock, Target,
} from 'lucide-react';
import { getDashboardStats, getInstagramStatus, refreshInstagramToken, getRules } from '../lib/api';
import type { DashboardStats, Rule, InstagramStatus } from '../lib/types';
import { TRIGGER_LABELS } from '../lib/types';
import { toTitleCase, formatExpiryRelative } from '../lib/utils';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/motions.css';

// ── DashboardPage ────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats]       = useState<DashboardStats | null>(null);
  const [igStatus, setIgStatus] = useState<InstagramStatus | null>(null);
  const [rules, setRules]       = useState<Rule[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getInstagramStatus(), getRules()])
      .then(([s, ig, r]) => {
        setStats(s);
        setIgStatus(ig);
        setRules(r?.rules?.slice(0, 4) ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const steps = [
    { id: 'profile', label: 'Complete your profile',          done: true,                href: '/settings' },
    { id: 'connect', label: 'Connect Instagram account',      done: !!igStatus?.connected, href: '/connect' },
    { id: 'rule',    label: 'Create your first automation rule', done: rules.length > 0,  href: '/rules' },
  ];
  const allDone   = steps.every(s => s.done);
  const doneCount = steps.filter(s => s.done).length;

  const rawLimit   = stats?.dm_limit;
  const isUnlimited = !!stats && (rawLimit === null || rawLimit === undefined || (typeof rawLimit === 'number' && rawLimit <= 0 && stats.plan !== 'free'));
  const hasLimit   = !!stats && !isUnlimited && typeof rawLimit === 'number' && rawLimit > 0;
  const usagePct   = stats && hasLimit ? Math.min(100, Math.round((stats.dms_sent_this_month / (rawLimit as number)) * 100)) : 0;

  const premiumAnalytics = Boolean(stats?.premium_analytics_enabled);
  const planName = toTitleCase(stats?.plan ?? user?.plan ?? 'free');
  const isFree   = (stats?.plan ?? user?.plan) === 'free';

  const recentRuleItems = rules.slice(0, 2);

  const handleRefreshToken = async () => {
    setRefreshing(true);
    try {
      await refreshInstagramToken();
      const fresh = await getInstagramStatus();
      setIgStatus(fresh);
    } catch { /* silent */ }
    finally { setRefreshing(false); }
  };

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userFirstName = user?.first_name || user?.display_name?.split(' ')[0] || 'there';
  const latestRule = rules[0];

  return (
    <div className="page-wrapper dashboard-v5-page">
      <section className="dashboard-v5-hero">
        <div className="dashboard-v5-orb dashboard-v5-orb-a" />
        <div className="dashboard-v5-orb dashboard-v5-orb-b" />

        <div className="dashboard-v5-hero-copy">
          <p className="dashboard-v5-kicker"><Sparkles size={12} /> Automation Performance Center</p>
          <h1 className="dashboard-v5-title">{greeting()}, {userFirstName}</h1>
          <p className="dashboard-v5-subtitle">
            {loading ? 'Loading your workspace...' : `You are on ${planName} · ${stats?.active_rules ?? 0} active rule${(stats?.active_rules ?? 0) !== 1 ? 's' : ''}`}
          </p>

          <div className="dashboard-v5-hero-actions">
            <Link to="/rules" className="dashboard-v5-btn primary"><Plus size={14} /> New Rule</Link>
            <Link to="/billing" className="dashboard-v5-btn secondary"><CreditCard size={14} /> {isFree ? 'Upgrade Plan' : 'Manage Plan'}</Link>
          </div>

          <div className="dashboard-v5-hero-chips">
            <span className="dashboard-v5-chip"><MessageSquare size={12} /> {loading ? '—' : stats?.dms_sent_this_month ?? 0} DMs this month</span>
            <span className="dashboard-v5-chip"><Target size={12} /> {hasLimit ? `${usagePct}% limit used` : 'Unlimited DM capacity'}</span>
          </div>
        </div>

        <div className="dashboard-v5-hero-panel">
          <div className="dashboard-v5-mini-stat">
            <span>Plan</span>
            <strong>{loading ? '—' : planName}</strong>
          </div>
          <div className="dashboard-v5-mini-stat">
            <span>Instagram</span>
            <strong>{igStatus?.connected ? 'Connected' : 'Not connected'}</strong>
          </div>
          <div className="dashboard-v5-mini-stat">
            <span>Latest rule</span>
            <strong>{latestRule ? latestRule.name : 'No rules yet'}</strong>
          </div>
        </div>
      </section>

      {!allDone && !loading && (
        <section className="dashboard-v5-setup-card">
          <div className="dashboard-v5-setup-head">
            <div>
              <p className="dashboard-v5-setup-title">Setup progress</p>
              <p className="dashboard-v5-setup-subtitle">{doneCount} of {steps.length} milestones completed</p>
            </div>
          </div>
          <div className="dashboard-v5-setup-grid">
            {steps.map((step) => (
              <Link key={step.id} to={step.href} className={`dashboard-v5-setup-item ${step.done ? 'done' : ''}`}>
                <span className="dashboard-v5-setup-dot">{step.done ? <CheckCircle size={12} /> : <Clock size={12} />}</span>
                <span>{step.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-v5-stats-grid">
        <article className="dashboard-v5-stat-card">
          <p className="label">DMs Sent</p>
          <p className="value">{loading ? '—' : stats?.dms_sent_this_month ?? 0}</p>
          <p className="meta">Current billing cycle</p>
        </article>
        <article className="dashboard-v5-stat-card">
          <p className="label">Active Rules</p>
          <p className="value">{loading ? '—' : stats?.active_rules ?? 0}</p>
          <p className="meta">From {rules.length} total rules</p>
        </article>
        <article className="dashboard-v5-stat-card">
          <p className="label">DM Limit</p>
          <p className="value">{loading ? '—' : hasLimit ? rawLimit ?? 0 : 'Unlimited'}</p>
          <p className="meta">{loading ? '—' : hasLimit ? `${usagePct}% used` : `${planName} plan`}</p>
        </article>
        <article className="dashboard-v5-stat-card">
          <p className="label">Analytics Tier</p>
          <p className="value">{premiumAnalytics ? 'Premium' : 'Basic'}</p>
          <p className="meta">{premiumAnalytics ? 'Advanced insights unlocked' : 'Upgrade to unlock more'}</p>
        </article>
      </section>

      <div className="dashboard-v5-grid">
        <div className="dashboard-v5-main-col">
          <section className="dashboard-v5-card dashboard-v5-chart-card">
            <div className="dashboard-v5-card-head">
              <h3>DM Volume - Last 7 days</h3>
              <span className="dashboard-v5-live-badge"><span className="dashboard-v5-live-dot" /> Live</span>
            </div>
            <div className="dashboard-v5-bars">
              {[40, 65, 50, 80, 60, 95, hasLimit ? Math.max(35, usagePct) : 75].map((barHeight, index) => (
                <div
                  key={index}
                  className={`dashboard-v5-bar ${index === 6 ? 'accent' : ''}`}
                  style={{ height: `${barHeight}%` }}
                />
              ))}
            </div>
            <div className="dashboard-v5-bar-labels">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </section>

          <section className="dashboard-v5-card">
            <div className="dashboard-v5-card-head">
              <h3>Automation Rules</h3>
              <Link to="/rules">View all <ArrowUpRight size={12} /></Link>
            </div>
            {loading ? (
              <div className="dashboard-v5-skeleton-list">
                {[1, 2, 3].map((i) => <div key={i} className="dashboard-v5-skeleton" />)}
              </div>
            ) : rules.length === 0 ? (
              <div className="dashboard-v5-empty-state">
                <div className="icon"><Zap size={22} /></div>
                <p className="title">No automation rules yet</p>
                <p className="desc">Create your first rule to start automating DM replies.</p>
                <Link to="/rules" className="dashboard-v5-btn primary"><Plus size={14} /> Create First Rule</Link>
              </div>
            ) : (
              <div className="dashboard-v5-rule-list">
                {rules.map((rule) => (
                  <div key={rule.id} className="dashboard-v5-rule-item">
                    <div className="icon"><Zap size={14} /></div>
                    <div className="copy">
                      <p className="name">{rule.name}</p>
                      <p className="meta">{TRIGGER_LABELS[rule.trigger_type]}{rule.keywords?.length ? ` · ${rule.keywords.slice(0, 2).join(', ')}` : ''}</p>
                    </div>
                    <span className={`state ${rule.is_active ? 'active' : 'off'}`}>{rule.is_active ? 'Active' : 'Off'}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="dashboard-v5-side-col">
          <section className="dashboard-v5-card">
            <div className="dashboard-v5-card-head">
              <h3><Camera size={14} /> Instagram</h3>
            </div>
            {igStatus?.connected ? (
              <div className="dashboard-v5-ig-connected">
                <div className="profile">
                  {igStatus.profile_picture ? (
                    <img src={igStatus.profile_picture} alt="Instagram" />
                  ) : (
                    <div className="fallback">{igStatus.username?.[0]?.toUpperCase() ?? 'I'}</div>
                  )}
                  <div>
                    <p className="username">@{igStatus.username}</p>
                    <p className="sub">Instagram Business</p>
                  </div>
                </div>
                {igStatus.token_expires_at && (
                  <div className="token-row">
                    <span><Clock size={11} /> Token expires</span>
                    <strong>{formatExpiryRelative(igStatus.token_expires_at)}</strong>
                  </div>
                )}
                <button onClick={handleRefreshToken} disabled={refreshing} className="dashboard-v5-btn ghost">
                  <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                  {refreshing ? 'Refreshing...' : 'Refresh Token'}
                </button>
              </div>
            ) : (
              <div className="dashboard-v5-empty-state compact">
                <div className="icon"><Camera size={20} /></div>
                <p className="title">Instagram not connected</p>
                <p className="desc">Connect your account to activate automations.</p>
                <Link to="/connect" className="dashboard-v5-btn primary"><Camera size={14} /> Connect Instagram</Link>
              </div>
            )}
          </section>

          <section className="dashboard-v5-card">
            <div className="dashboard-v5-card-head">
              <h3><TrendingUp size={14} /> Insights</h3>
              {!premiumAnalytics && <span className="dashboard-v5-lock"><Lock size={10} /> Locked</span>}
            </div>
            {premiumAnalytics ? (
              <div className="dashboard-v5-insights-list">
                <div className="item"><span>Success rate</span><strong>{typeof stats?.success_rate === 'number' ? `${stats.success_rate}%` : '—'}</strong></div>
                <div className="item"><span>Avg DMs/day</span><strong>{typeof stats?.avg_dms_per_day_30d === 'number' ? stats.avg_dms_per_day_30d : '—'}</strong></div>
                <div className="item"><span>Peak hour (UTC)</span><strong>{typeof stats?.peak_hour_utc === 'number' ? `${String(stats.peak_hour_utc).padStart(2, '0')}:00` : '—'}</strong></div>
                <div className="item"><span>Busiest weekday</span><strong>{stats?.busiest_weekday || '—'}</strong></div>
              </div>
            ) : (
              <div className="dashboard-v5-upgrade-note">
                <p>Upgrade to Starter or Pro to unlock success-rate tracking, peak-hour insights, and advanced trends.</p>
                <Link to="/billing">View plans <ArrowUpRight size={12} /></Link>
              </div>
            )}
          </section>

          <section className="dashboard-v5-card">
            <div className="dashboard-v5-card-head">
              <h3>Setup checklist</h3>
              <span className="dashboard-v5-step-count">{doneCount}/{steps.length} done</span>
            </div>
            <div className="dashboard-v5-setup-grid compact">
              {steps.map((step) => (
                <Link key={step.id} to={step.href} className={`dashboard-v5-setup-item ${step.done ? 'done' : ''}`}>
                  <span className="dashboard-v5-setup-dot">{step.done ? <CheckCircle size={12} /> : <Clock size={12} />}</span>
                  <span>{step.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="dashboard-v5-card">
            <div className="dashboard-v5-card-head">
              <h3>Recent rules</h3>
              <Link to="/rules">View all <ArrowUpRight size={12} /></Link>
            </div>
            {loading ? (
              <div className="dashboard-v5-skeleton-list">
                {[1, 2].map((i) => <div key={i} className="dashboard-v5-skeleton" />)}
              </div>
            ) : recentRuleItems.length === 0 ? (
              <div className="dashboard-v5-empty-state compact">
                <div className="icon"><Zap size={20} /></div>
                <p className="title">No recent rules</p>
                <p className="desc">Create your first automation rule to see it here.</p>
              </div>
            ) : (
              <div className="dashboard-v5-rule-list">
                {recentRuleItems.map((rule) => (
                  <div key={rule.id} className="dashboard-v5-rule-item">
                    <div className="icon"><Zap size={14} /></div>
                    <div className="copy">
                      <p className="name">{rule.name}</p>
                      <p className="meta">{TRIGGER_LABELS[rule.trigger_type]}{rule.keywords?.length ? ` · ${rule.keywords.slice(0, 2).join(', ')}` : ''}</p>
                      <div className="dashboard-v5-rule-tags">
                        <span className={`dashboard-v5-mini-badge ${rule.is_active ? 'active' : 'off'}`}>{rule.is_active ? 'Active' : 'Off'}</span>
                        {rule.trigger_type && <span className="dashboard-v5-mini-badge muted">{rule.trigger_type}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {isFree && !loading && (
            <section className="dashboard-v5-upgrade-card">
              <div className="icon"><CheckCircle size={16} /></div>
              <p className="title">Unlock more power</p>
              <p className="desc">Starter includes premium analytics, more rules, and cleaner branded messages.</p>
              <Link to="/billing" className="dashboard-v5-btn light">Upgrade now</Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;
