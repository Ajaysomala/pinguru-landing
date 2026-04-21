import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Zap, BarChart2, CreditCard, Camera, Plus,
  RefreshCw, ChevronRight, TrendingUp, CheckCircle,
  Lock, ArrowUpRight, Sparkles, Clock, Target,
  CheckCheck, AlertTriangle,
} from 'lucide-react';
import { getDashboardStats, getInstagramStatus, refreshInstagramToken, getRules } from '../lib/api';
import type { DashboardStats, Rule, InstagramStatus } from '../lib/types';
import { TRIGGER_LABELS } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { CardHeader } from '../components/ui/Card';
import { StepChecklist } from '../components/ui/StepChecklist';
import type { Step } from '../components/ui/StepChecklist';
import { toTitleCase, formatRelativeTime } from '../lib/utils';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/motions.css';

// ── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconClass: string;
  trend?: { value: string; up: boolean };
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, iconClass, trend, delay = 0 }) => (
  <div
    className="stat-card motion-card"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: 6, lineHeight: 1.4 }}>
            {sub}
          </p>
        )}
        {trend && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginTop: 8, fontSize: '0.75rem', fontWeight: 600,
            color: trend.up ? 'var(--color-success)' : 'var(--color-danger)',
            background: trend.up ? 'var(--color-success-light)' : 'var(--color-danger-light)',
            padding: '2px 8px', borderRadius: 999,
          }}>
            <TrendingUp size={10} />
            {trend.value}
          </div>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}
        style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
    </div>
  </div>
);

// ── Mini sparkline visual ────────────────────────────────────────────────────
const MiniSparkline: React.FC<{ pct: number; color: string }> = ({ pct, color }) => {
  const bars = [40, 65, 45, 80, 55, 90, pct].map(v => Math.min(100, v));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }}>
      {bars.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${v}%`,
            background: i === bars.length - 1 ? color : `${color}40`,
            borderRadius: 3,
            transition: 'height 0.6s ease',
          }}
        />
      ))}
    </div>
  );
};

// ── Quick action button ──────────────────────────────────────────────────────
const QuickAction: React.FC<{
  label: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}> = ({ label, desc, href, icon, gradient }) => (
  <Link
    to={href}
    style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      background: 'white',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      textDecoration: 'none',
      transition: 'all 200ms',
      group: true,
    } as any}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = 'rgba(124,58,237,0.25)';
      el.style.transform = 'translateY(-2px)';
      el.style.boxShadow = '0 8px 24px rgba(124,58,237,0.1)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = 'var(--color-border)';
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = 'none';
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 11,
      background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 4px 10px rgba(124,58,237,0.2)',
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{desc}</div>
    </div>
    <ChevronRight size={15} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
  </Link>
);

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

  const steps: Step[] = [
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
  const usageColor = usagePct >= 90 ? '#F43F5E' : usagePct >= 70 ? '#F59E0B' : '#7C3AED';

  const premiumAnalytics = Boolean(stats?.premium_analytics_enabled);
  const planName = toTitleCase(stats?.plan ?? user?.plan ?? 'free');
  const isFree   = (stats?.plan ?? user?.plan) === 'free';

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

  return (
    <div className="page-wrapper">

      {/* ── Header ─────────────────────────────── */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div className="motion-fade-up">
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.625rem', fontWeight: 800,
            color: 'var(--color-text)', letterSpacing: '-0.03em',
          }}>
            {greeting()}, {userFirstName} 👋
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginTop: 4 }}>
            {loading ? 'Loading your workspace…' : `You're on the ${planName} plan · ${stats?.active_rules ?? 0} active rules`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className="motion-fade-in">
          <Link
            to="/rules"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10,
              border: '1.5px solid var(--color-border)',
              fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)',
              textDecoration: 'none', background: 'white',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'; }}
          >
            <Zap size={14} /> New Rule
          </Link>
          <Link
            to="/billing"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10,
              background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
              fontSize: '0.875rem', fontWeight: 700, color: 'white',
              textDecoration: 'none',
              transition: 'all 150ms',
              boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
            }}
          >
            <CreditCard size={14} /> {isFree ? 'Upgrade Plan' : 'Manage Plan'}
          </Link>
        </div>
      </div>

      {/* ── Getting Started (if not complete) ─── */}
      {!allDone && !loading && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(219,39,119,0.03))',
          border: '1.5px solid rgba(124,58,237,0.15)',
          borderRadius: 16, padding: '20px 24px', marginBottom: 24,
        }} className="motion-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                  Getting started
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  {doneCount} of {steps.length} steps complete
                </div>
              </div>
            </div>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {steps.map((s, i) => (
                <div key={i} style={{
                  width: s.done ? 24 : 8, height: 8,
                  borderRadius: 999,
                  background: s.done ? 'linear-gradient(90deg, #7C3AED, #DB2777)' : 'var(--color-border)',
                  transition: 'all 300ms',
                }} />
              ))}
            </div>
          </div>
          <StepChecklist steps={steps} />
        </div>
      )}

      {/* ── Stat cards ────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="DMs Sent"
          value={loading ? '—' : stats?.dms_sent_this_month ?? 0}
          sub="this month"
          icon={<MessageSquare size={18} style={{ color: '#7C3AED' }} />}
          iconClass="stat-icon-indigo"
          delay={0}
        />
        <StatCard
          label="Active Rules"
          value={loading ? '—' : stats?.active_rules ?? 0}
          sub={`of ${rules.length} total`}
          icon={<Zap size={18} style={{ color: '#059669' }} />}
          iconClass="stat-icon-emerald"
          delay={60}
        />
        <StatCard
          label="Monthly Limit"
          value={loading ? '—' : hasLimit ? rawLimit ?? 0 : 'Unlimited'}
          sub={loading ? undefined : hasLimit ? `${usagePct}% used` : `${planName} plan`}
          icon={<BarChart2 size={18} style={{ color: '#D97706' }} />}
          iconClass="stat-icon-amber"
          delay={120}
        />
        <StatCard
          label="Current Plan"
          value={loading ? '—' : planName}
          sub={isFree ? 'Upgrade for more' : 'Active subscription'}
          icon={<CreditCard size={18} style={{ color: '#7C3AED' }} />}
          iconClass="stat-icon-violet"
          delay={180}
        />
      </div>

      {/* ── Main content grid ─────────────────── */}
      <div className="dashboard-grid">

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* DM Usage */}
          {!loading && stats && (
            <div className="card motion-card motion-fade-up">
              <div className="card-header">
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={15} style={{ color: 'var(--color-muted)' }} />
                  DM Usage — {new Date().toLocaleString('en-IN', { month: 'long' })}
                </span>
                {hasLimit && usagePct >= 90 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 999,
                    background: 'var(--color-danger-light)', color: '#9F1239',
                    fontSize: '0.75rem', fontWeight: 600,
                  }}>
                    <AlertTriangle size={11} /> Near limit
                  </span>
                )}
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.5rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}>
                    {stats.dms_sent_this_month}
                  </span>
                  <span style={{ alignSelf: 'flex-end', marginBottom: 4 }}>
                    {hasLimit ? `${rawLimit} limit` : '∞ unlimited'}
                  </span>
                </div>
                {/* Sparkline bars */}
                <MiniSparkline pct={hasLimit ? usagePct : 72} color={usageColor} />
                <div style={{ marginTop: 12 }}>
                  <div className="usage-bar-bg">
                    <div
                      className="usage-bar-fill"
                      style={{
                        width: hasLimit ? `${usagePct}%` : '100%',
                        background: hasLimit
                          ? `linear-gradient(90deg, ${usageColor}, ${usagePct > 70 ? '#F97316' : '#DB2777'})`
                          : 'linear-gradient(90deg, #7C3AED, #10B981)',
                      }}
                    />
                  </div>
                </div>
                {isFree && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginTop: 12 }}>
                    <Link to="/billing" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Upgrade to Starter</Link>
                    {' '}for premium analytics, follow-gate automation, and priority support.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recent Rules */}
          <div className="card motion-card motion-fade-up" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '18px 20px 0' }}>
              <span className="card-title">Automation Rules</span>
              <Link to="/rules" style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)',
                textDecoration: 'none',
              }}>
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      height: 56, borderRadius: 12,
                      background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite',
                    }} />
                  ))}
                </div>
              ) : rules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <Zap size={22} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                    No automation rules yet
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: 16 }}>
                    Create your first rule to start automating DMs
                  </p>
                  <Link to="/rules" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
                    color: 'white', fontWeight: 700, fontSize: '0.875rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
                  }}>
                    <Plus size={14} /> Create First Rule
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {rules.map(rule => (
                    <div
                      key={rule.id}
                      className="rule-card"
                      style={{ padding: '12px 14px', borderRadius: 12 }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: rule.is_active
                          ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(219,39,119,0.08))'
                          : '#F1F5F9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        color: rule.is_active ? 'var(--color-primary)' : 'var(--color-muted)',
                      }}>
                        <Zap size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rule.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 2 }}>
                          {TRIGGER_LABELS[rule.trigger_type]}
                          {rule.keywords?.length > 0 && ` · ${rule.keywords.slice(0, 2).join(', ')}`}
                        </p>
                      </div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 999,
                        background: rule.is_active ? 'var(--color-success-light)' : '#F1F5F9',
                        color: rule.is_active ? '#065F46' : '#64748B',
                        fontSize: '0.75rem', fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {rule.is_active ? (
                          <><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', animation: 'pulseDot 2s infinite' }} />Active</>
                        ) : 'Off'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <QuickAction
              label="Create automation rule"
              desc="Set up a new keyword or comment trigger"
              href="/rules"
              icon={<Zap size={18} style={{ color: 'white' }} />}
              gradient="linear-gradient(135deg, #7C3AED, #DB2777)"
            />
            <QuickAction
              label="View analytics"
              desc="DM volume, success rates, peak hours"
              href="/analytics"
              icon={<BarChart2 size={18} style={{ color: 'white' }} />}
              gradient="linear-gradient(135deg, #0891B2, #7C3AED)"
            />
            <QuickAction
              label="Manage billing"
              desc={isFree ? 'Upgrade for unlimited rules + analytics' : 'View invoices and plan details'}
              href="/billing"
              icon={<CreditCard size={18} style={{ color: 'white' }} />}
              gradient="linear-gradient(135deg, #D97706, #DB2777)"
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Instagram Status */}
          <div className="card motion-card motion-fade-up" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '18px 20px 0' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={14} style={{ color: '#DB2777' }} />
                Instagram
              </span>
              {igStatus?.connected && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 999,
                  background: 'var(--color-success-light)',
                  color: '#065F46', fontSize: '0.75rem', fontWeight: 600,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulseDot 2s infinite' }} />
                  Connected
                </span>
              )}
            </div>
            <div className="card-body">
              {igStatus?.connected ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 14px', background: 'var(--color-canvas)', borderRadius: 12 }}>
                    {igStatus.profile_picture ? (
                      <img src={igStatus.profile_picture} alt="IG" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F472B6, #A78BFA)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '1rem',
                        fontFamily: 'var(--font-display)',
                      }}>
                        {igStatus.username?.[0]?.toUpperCase() ?? 'I'}
                      </div>
                    )}
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                        @{igStatus.username}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 2 }}>
                        Instagram Business
                      </p>
                    </div>
                  </div>
                  {igStatus.token_expires_at && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '0.78rem', color: 'var(--color-muted)',
                      marginBottom: 14, padding: '0 2px',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={11} /> Token expires
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {formatRelativeTime(igStatus.token_expires_at)}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleRefreshToken}
                    disabled={refreshing}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '10px', fontSize: '0.875rem', fontWeight: 600,
                      color: 'var(--color-text-secondary)', background: 'var(--color-canvas)',
                      border: '1px solid var(--color-border)', borderRadius: 10,
                      cursor: 'pointer', transition: 'all 150ms',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.3)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
                  >
                    <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    {refreshing ? 'Refreshing…' : 'Refresh Token'}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: 'linear-gradient(135deg, #FCE7F3, #FBCFE8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <Camera size={22} style={{ color: '#DB2777' }} />
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                    Not connected
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: 18, lineHeight: 1.5 }}>
                    Link your Instagram account to start automating DMs
                  </p>
                  <Link to="/connect" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '10px 20px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
                    color: 'white', fontWeight: 700, fontSize: '0.875rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
                  }}>
                    <Camera size={14} /> Connect Instagram
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Premium Insights */}
          <div className="card motion-card motion-fade-up" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '18px 20px 0' }}>
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart2 size={14} style={{ color: premiumAnalytics ? '#7C3AED' : 'var(--color-muted)' }} />
                Premium Insights
              </span>
              {!premiumAnalytics && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', borderRadius: 999,
                  background: '#F1F5F9', color: '#64748B',
                  fontSize: '0.75rem', fontWeight: 600,
                }}>
                  <Lock size={10} /> Locked
                </span>
              )}
            </div>
            <div className="card-body">
              {premiumAnalytics ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Success rate', value: typeof stats?.success_rate === 'number' ? `${stats.success_rate}%` : '—', color: '#10B981' },
                    { label: 'Avg DMs / day (30d)', value: typeof stats?.avg_dms_per_day_30d === 'number' ? stats.avg_dms_per_day_30d : '—', color: '#7C3AED' },
                    { label: 'Peak hour (UTC)', value: typeof stats?.peak_hour_utc === 'number' ? `${String(stats.peak_hour_utc).padStart(2, '0')}:00` : '—', color: '#F97316' },
                    { label: 'Busiest weekday', value: stats?.busiest_weekday || '—', color: '#DB2777' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>{item.label}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: item.color }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
                    border: '1px solid rgba(124,58,237,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-primary)', flexShrink: 0,
                  }}>
                    <Lock size={14} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                      Unlock premium analytics
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 14 }}>
                      Upgrade to Starter or Pro to unlock success rate, peak-hour analysis, and 30-day trend reporting.
                    </p>
                    <Link to="/billing" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)',
                      textDecoration: 'none',
                    }}>
                      View plans <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upgrade CTA (free plan only) */}
          {isFree && !loading && (
            <div
              className="motion-card"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 60%, #F97316 100%)',
                backgroundSize: '200% auto',
                animation: 'gradientShift 6s ease-in-out infinite',
                borderRadius: 18, padding: '22px 22px',
                border: 'none', position: 'relative', overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(124,58,237,0.3)',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 40%)',
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14, animation: 'float 4s ease-in-out infinite',
                }}>
                  <CheckCircle size={18} style={{ color: 'white' }} />
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: 6 }}>
                  Unlock more power
                </p>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', marginBottom: 18, lineHeight: 1.6 }}>
                  Starter: 15 rules + premium analytics + no branding — ₹199/mo
                </p>
                <Link to="/billing" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'white', color: 'var(--color-primary)',
                  fontSize: '0.8125rem', fontWeight: 700,
                  padding: '9px 18px', borderRadius: 10,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}>
                  Upgrade now <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
