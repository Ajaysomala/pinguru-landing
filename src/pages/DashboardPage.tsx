import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Zap,
  BarChart2,
  CreditCard,
  Camera,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Lock,
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

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, iconBg, delay = 0 }) => (
  <div className="stat-card motion-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [igStatus, setIgStatus] = useState<InstagramStatus | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getInstagramStatus(), getRules()])
      .then(([nextStats, nextIg, nextRules]) => {
        setStats(nextStats);
        setIgStatus(nextIg);
        setRules(nextRules?.rules?.slice(0, 3) ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const steps: Step[] = [
    { id: 'profile', label: 'Complete your profile', done: true, href: '/settings' },
    { id: 'connect', label: 'Connect Instagram account', done: !!igStatus?.connected, href: '/connect' },
    { id: 'rule', label: 'Create your first automation rule', done: rules.length > 0, href: '/rules' },
  ];
  const allDone = steps.every((step) => step.done);

  const rawLimit = stats?.dm_limit;
  const isUnlimited =
    !!stats &&
    (rawLimit === null || rawLimit === undefined || (typeof rawLimit === 'number' && rawLimit <= 0 && stats.plan !== 'free'));
  const hasLimit = !!stats && !isUnlimited && typeof rawLimit === 'number' && rawLimit > 0;
  const usagePct = stats && hasLimit ? Math.min(100, Math.round((stats.dms_sent_this_month / (rawLimit as number)) * 100)) : 0;
  const usageColor = usagePct >= 90 ? 'bg-rose-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-primary';
  const premiumAnalytics = Boolean(stats?.premium_analytics_enabled);

  const handleRefreshToken = async () => {
    setRefreshing(true);
    try {
      await refreshInstagramToken();
      const fresh = await getInstagramStatus();
      setIgStatus(fresh);
    } catch {
      // silent
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header flex items-start justify-between gap-3 motion-fade-up">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `You're on the ${toTitleCase(stats?.plan ?? user?.plan ?? 'free')} plan`}
          </p>
        </div>
        <div className="flex items-center gap-2 motion-fade-in">
          <Link to="/rules" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Zap size={14} />
            New Rule
          </Link>
          <Link to="/billing" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            <CreditCard size={14} />
            Manage Plan
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="DMs Sent" value={loading ? '—' : stats?.dms_sent_this_month ?? 0} sub="this month" icon={<MessageSquare size={18} className="text-indigo-600" />} iconBg="bg-indigo-50" delay={0} />
        <StatCard label="Active Rules" value={loading ? '—' : stats?.active_rules ?? 0} icon={<Zap size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" delay={60} />
        <StatCard
          label="Monthly Limit"
          value={loading ? '—' : (hasLimit ? rawLimit ?? 0 : 'Unlimited')}
          sub={loading ? undefined : (hasLimit ? `${usagePct}% used` : `${toTitleCase(stats?.plan ?? 'pro')} plan`)}
          icon={<BarChart2 size={18} className="text-amber-600" />}
          iconBg="bg-amber-50"
          delay={120}
        />
        <StatCard
          label="Current Plan"
          value={loading ? '—' : toTitleCase(stats?.plan ?? user?.plan ?? 'free')}
          sub={(stats?.plan ?? user?.plan) === 'free' ? 'Upgrade for more' : 'Active'}
          icon={<CreditCard size={18} className="text-violet-600" />}
          iconBg="bg-violet-50"
          delay={180}
        />
      </div>

      {!loading && stats && (
        <div className="card mb-5 motion-card motion-fade-up">
          <div className="card-header">
            <span className="card-title flex items-center gap-2"><TrendingUp size={15} className="text-slate-400" />DM Usage this month</span>
            {hasLimit && usagePct >= 90 && <Badge variant="red" dot>Near limit</Badge>}
          </div>
          <div className="card-body">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>{stats.dms_sent_this_month} sent</span>
              <span>{hasLimit ? `${rawLimit} limit` : 'Unlimited'}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${hasLimit ? usageColor : 'bg-emerald-500'}`}
                style={{ width: hasLimit ? `${usagePct}%` : '100%' }}
              />
            </div>
            {stats.plan === 'free' && (
              <p className="text-xs text-slate-400 mt-2">
                <Link to="/billing" className="text-primary font-medium hover:underline">Upgrade to Starter</Link> for premium analytics, follow-gate automation, and priority support.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="flex flex-col gap-5">
          {!allDone && (
            <div className="card motion-card motion-fade-up">
              <div className="card-header">
                <span className="card-title">Getting Started</span>
                <Badge variant="indigo">{steps.filter((step) => step.done).length}/{steps.length} done</Badge>
              </div>
              <div className="card-body"><StepChecklist steps={steps} /></div>
            </div>
          )}

          <div className="card motion-card motion-fade-up" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '18px 20px 0' }}>
              <span className="card-title">Recent Rules</span>
              <Link to="/rules" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="card-body">
              {rules.length === 0 ? (
                <div className="text-center py-6">
                  <Zap size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 mb-3">No automation rules yet.</p>
                  <Link to="/rules" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    Create your first rule <ChevronRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className={`rule-card ${rule.is_active ? '' : 'inactive'}`}>
                      <div className="rule-icon"><Zap size={15} /></div>
                      <div className="rule-info">
                        <p className="rule-name">{rule.name}</p>
                        <p className="rule-meta">
                          {TRIGGER_LABELS[rule.trigger_type]}
                          {rule.keywords?.length > 0 && ` · ${rule.keywords.slice(0, 2).join(', ')}`}
                        </p>
                      </div>
                      <Badge variant={rule.is_active ? 'green' : 'gray'} dot={rule.is_active}>
                        {rule.is_active ? 'Active' : 'Off'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="card motion-card motion-fade-up" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '18px 20px 0' }}>
              <span className="card-title flex items-center gap-2">
                <Camera size={14} className="text-pink-500" />
                Instagram
              </span>
            </div>
            <div className="card-body">
              {igStatus?.connected ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {igStatus.profile_picture ? (
                      <img src={igStatus.profile_picture} alt="IG" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                        {igStatus.username?.[0]?.toUpperCase() ?? 'I'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">@{igStatus.username}</p>
                      <Badge variant="green" dot>Connected</Badge>
                    </div>
                  </div>
                  {igStatus.token_expires_at && (
                    <div className="flex justify-between text-xs text-slate-400 mb-3 px-1">
                      <span>Token expires</span>
                      <span>{formatRelativeTime(igStatus.token_expires_at)}</span>
                    </div>
                  )}
                  <button
                    onClick={handleRefreshToken}
                    disabled={refreshing}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing…' : 'Refresh Token'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mx-auto mb-3">
                    <Camera size={22} className="text-pink-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Not connected</p>
                  <p className="text-xs text-slate-400 mb-4">Link Instagram to start automating DMs</p>
                  <Link to="/connect" className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Connect Instagram
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="card motion-card motion-fade-up motion-stagger-1 dashboard-quick-actions-card">
            <CardHeader title="Quick Actions" subtitle="Fast access to common actions" />
            <div className="flex flex-col gap-1 dashboard-action-list">
              {[
                { label: 'Create a new rule', href: '/rules', icon: <Zap size={14} /> },
                { label: 'View analytics', href: '/analytics', icon: <BarChart2 size={14} /> },
                { label: 'Manage billing', href: '/billing', icon: <CreditCard size={14} /> },
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="dashboard-action-item flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-primary transition-colors group"
                >
                  <span className="text-slate-400 group-hover:text-primary transition-colors">{item.icon}</span>
                  {item.label}
                  <ChevronRight size={13} className="ml-auto text-slate-300 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>

          <div className={`card motion-card motion-fade-up motion-stagger-2 ${premiumAnalytics ? 'dashboard-premium-unlocked' : 'dashboard-premium-locked'}`} style={{ padding: 0 }}>
            <div className="card-header dashboard-premium-header" style={{ padding: '18px 20px 0' }}>
              <span className="card-title flex items-center gap-2">
                <BarChart2 size={14} className={premiumAnalytics ? 'text-violet-500' : 'text-indigo-500'} />
                Premium Insights
              </span>
              {!premiumAnalytics && (
                <Badge variant="gray">
                  <span className="inline-flex items-center gap-1"><Lock size={11} />Locked</span>
                </Badge>
              )}
            </div>
            <div className="card-body dashboard-premium-body">
              {premiumAnalytics ? (
                <div className="dashboard-premium-stats">
                  <div className="flex items-center justify-between"><span>Success rate</span><strong>{typeof stats?.success_rate === 'number' ? `${stats.success_rate}%` : '—'}</strong></div>
                  <div className="flex items-center justify-between"><span>Avg DMs / day (30d)</span><strong>{typeof stats?.avg_dms_per_day_30d === 'number' ? stats.avg_dms_per_day_30d : '—'}</strong></div>
                  <div className="flex items-center justify-between"><span>Peak hour (UTC)</span><strong>{typeof stats?.peak_hour_utc === 'number' ? `${String(stats.peak_hour_utc).padStart(2, '0')}:00` : '—'}</strong></div>
                  <div className="flex items-center justify-between"><span>Busiest weekday</span><strong>{stats?.busiest_weekday || '—'}</strong></div>
                </div>
              ) : (
                <div className="dashboard-premium-locked-copy">
                  <div className="dashboard-premium-lock-icon">
                    <Lock size={14} />
                  </div>
                  <div>
                    <p className="dashboard-premium-locked-title">Unlock premium analytics</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Free includes basic analytics. Upgrade to Starter or Pro to unlock success rate, trend insights, peak-hour analysis, and 30-day premium reporting.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {stats?.plan === 'free' && (
            <div className="card motion-card motion-fade-up motion-stagger-3 dashboard-upgrade-card">
              <div className="dashboard-upgrade-overlay" aria-hidden="true" />
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 motion-float-slow">
                  <CheckCircle size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Unlock more power</p>
                  <p className="text-white/80 text-xs mt-0.5 mb-3">Starter: 15 automation flows + premium analytics — ₹199/mo</p>
                  <Link to="/billing" className="inline-flex items-center gap-1 bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm">
                    Upgrade now <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
