import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare, Zap, BarChart2, CreditCard,
  Camera, RefreshCw, ChevronRight, TrendingUp, CheckCircle,
} from 'lucide-react';
import { getDashboardStats, getInstagramStatus, refreshInstagramToken, getRules, requireAuth } from '../lib/api';
import type { DashboardStats, Rule, InstagramStatus } from '../lib/types';
import { TRIGGER_LABELS } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { StepChecklist } from '../components/ui/StepChecklist';
import type { Step } from '../components/ui/StepChecklist';
import { toTitleCase, formatRelativeTime } from '../lib/utils';
import '../styles/dashboard.css';

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; iconBg: string; delay?: number;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, iconBg, delay = 0 }) => (
  <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
    </div>
  </div>
);

// ── DashboardPage ─────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats]             = useState<DashboardStats | null>(null);
  const [igStatus, setIgStatus]       = useState<InstagramStatus | null>(null);
  const [rules, setRules]             = useState<Rule[]>([]);
  const [refreshing, setRefreshing]   = useState(false);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    requireAuth().then(ok => { if (!ok) navigate('/login'); });
    Promise.all([getDashboardStats(), getInstagramStatus(), getRules()])
      .then(([s, ig, r]) => {
        setStats(s);
        setIgStatus(ig);
        setRules(r?.rules?.slice(0, 3) ?? []);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const steps: Step[] = [
    { id: 'profile', label: 'Complete your profile',          done: true,                   href: '/settings' },
    { id: 'connect', label: 'Connect Instagram account',      done: !!igStatus?.connected,  href: '/connect'  },
    { id: 'rule',    label: 'Create your first automation rule', done: rules.length > 0,    href: '/rules'    },
  ];
  const allDone = steps.every(s => s.done);

  const hasLimit = stats?.dm_limit !== null && stats?.dm_limit !== undefined;
  const usagePct = stats && hasLimit
    ? Math.min(100, Math.round((stats.dms_sent_this_month / (stats.dm_limit as number)) * 100))
    : 0;
  const usageColor = usagePct >= 90 ? 'bg-rose-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-primary';

  const handleRefreshToken = async () => {
    setRefreshing(true);
    try { await refreshInstagramToken(); const ig = await getInstagramStatus(); setIgStatus(ig); }
    catch { /* silent */ }
    finally { setRefreshing(false); }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          {loading ? 'Loading…' : `You're on the ${toTitleCase(stats?.plan ?? 'free')} plan`}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard label="DMs Sent"     value={loading ? '—' : stats?.dms_sent_this_month ?? 0} sub="this month"                              icon={<MessageSquare size={18} className="text-indigo-600"/>} iconBg="bg-indigo-50"  delay={0}   />
        <StatCard label="Active Rules" value={loading ? '—' : stats?.active_rules ?? 0}                                                      icon={<Zap            size={18} className="text-emerald-600"/>} iconBg="bg-emerald-50" delay={60}  />
        <StatCard
          label="Monthly Limit"
          value={loading ? '—' : (hasLimit ? stats?.dm_limit ?? 0 : 'Unlimited')}
          sub={loading ? undefined : (hasLimit ? `${usagePct}% used` : 'Unlimited usage')}
          icon={<BarChart2 size={18} className="text-amber-600"/>}
          iconBg="bg-amber-50"
          delay={120}
        />
        <StatCard label="Current Plan" value={loading ? '—' : toTitleCase(stats?.plan ?? 'free')} sub={stats?.plan === 'free' ? 'Upgrade for more' : 'Active'} icon={<CreditCard     size={18} className="text-violet-600"/>} iconBg="bg-violet-50"  delay={180} />
      </div>

      {/* DM Usage Bar */}
      {!loading && stats && (
        <div className="card mb-5">
          <div className="card-header">
            <span className="card-title flex items-center gap-2"><TrendingUp size={15} className="text-slate-400"/>DM Usage this month</span>
            {hasLimit && usagePct >= 90 && <Badge variant="red" dot>Near limit</Badge>}
          </div>
          <div className="card-body">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>{stats.dms_sent_this_month} sent</span>
              <span>{hasLimit ? `${stats.dm_limit} limit` : 'Unlimited'}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${hasLimit ? usageColor : 'bg-emerald-500'}`}
                style={{ width: hasLimit ? `${usagePct}%` : '100%' }}
              />
            </div>
            {stats.plan === 'free' && (
              <p className="text-xs text-slate-400 mt-2">
                <Link to="/billing" className="text-primary font-medium hover:underline">Upgrade to Starter</Link> for 1,000 DMs/month
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">

        {/* Left */}
        <div className="flex flex-col gap-5">

          {/* Getting Started */}
          {!allDone && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Getting Started</span>
                <Badge variant="indigo">{steps.filter(s => s.done).length}/{steps.length} done</Badge>
              </div>
              <div className="card-body"><StepChecklist steps={steps} /></div>
            </div>
          )}

          {/* Recent Rules */}
          <div className="card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '18px 20px 0' }}>
              <span className="card-title">Recent Rules</span>
              <Link to="/rules" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
                View all <ChevronRight size={12}/>
              </Link>
            </div>
            <div className="card-body">
              {rules.length === 0 ? (
                <div className="text-center py-6">
                  <Zap size={28} className="text-slate-200 mx-auto mb-2"/>
                  <p className="text-sm text-slate-400 mb-3">No automation rules yet.</p>
                  <Link to="/rules" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    Create your first rule <ChevronRight size={13}/>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {rules.map(rule => (
                    <div key={rule.id} className={`rule-card ${rule.is_active ? '' : 'inactive'}`}>
                      <div className="rule-icon"><Zap size={15}/></div>
                      <div className="rule-info">
                        <p className="rule-name">{rule.name}</p>
                        <p className="rule-meta">
                          {TRIGGER_LABELS[rule.trigger_type]}
                          {rule.keywords?.length > 0 && ` · ${rule.keywords.slice(0,2).join(', ')}`}
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

        {/* Right */}
        <div className="flex flex-col gap-5">

          {/* IG Connectivity Hub */}
          <div className="card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '18px 20px 0' }}>
              <span className="card-title flex items-center gap-2">
                <Camera size={14} className="text-pink-500"/>Instagram
              </span>
            </div>
            <div className="card-body">
              {igStatus?.connected ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {igStatus.profile_picture ? (
                      <img src={igStatus.profile_picture} alt="IG" className="w-10 h-10 rounded-full object-cover"/>
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
                    onClick={handleRefreshToken} disabled={refreshing}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''}/>
                    {refreshing ? 'Refreshing…' : 'Refresh Token'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mx-auto mb-3">
                    <Camera size={22} className="text-pink-500"/>
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

          {/* Quick Actions */}
          <div className="card">
            <CardHeader title="Quick Actions"/>
            <div className="flex flex-col gap-1">
              {[
                { label: 'Create a new rule', href: '/rules',     icon: <Zap size={14}/> },
                { label: 'View analytics',    href: '/analytics', icon: <BarChart2 size={14}/> },
                { label: 'Manage billing',    href: '/billing',   icon: <CreditCard size={14}/> },
              ].map(item => (
                <Link key={item.href} to={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-primary transition-colors group"
                >
                  <span className="text-slate-400 group-hover:text-primary transition-colors">{item.icon}</span>
                  {item.label}
                  <ChevronRight size={13} className="ml-auto text-slate-300 group-hover:text-primary"/>
                </Link>
              ))}
            </div>
          </div>

          {/* Free plan upgrade nudge */}
          {stats?.plan === 'free' && (
            <div className="card" style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)', border: 'none' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={18} className="text-white"/>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Unlock more power</p>
                  <p className="text-white/70 text-xs mt-0.5 mb-3">Starter: 1,000 DMs + 5 rules — ₹199/mo</p>
                  <Link to="/billing" className="inline-flex items-center gap-1 bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                    Upgrade now <ChevronRight size={12}/>
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
