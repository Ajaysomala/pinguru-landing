import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, MessageSquare, Zap, Lock, Unlock } from 'lucide-react';
import { getDashboardStats, getAnalytics } from '../lib/api';
import type { DashboardStats, AnalyticsData } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { DMVolumeChart } from '../components/analytics/DMVolumeChart';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/analytics.css';

const AnalyticsPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [data, setData]       = useState<AnalyticsData[]>([]);
  const [days, setDays]       = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);
  const planName = authUser?.plan ?? 'free';

  useEffect(() => {
    getDashboardStats()
      .then(s => setStats(s));
  }, []);

  const premiumEnabled = Boolean(stats?.premium_analytics_enabled || stats?.analytics_tier === 'premium');

  useEffect(() => {
    if (!premiumEnabled) { setData([]); setLoading(false); return; }
    setLoading(true);
    getAnalytics(days)
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [days, premiumEnabled]);

  const isFree = planName === 'free';

  const successRate = data.length
    ? Math.round((data.reduce((a, d) => a + (d.success_count ?? 0), 0) /
        Math.max(1, data.reduce((a, d) => a + d.dms_sent, 0))) * 100)
    : stats?.success_rate ?? 0;

  const avgDmsPerDay = typeof stats?.avg_dms_per_day_30d === 'number' ? stats.avg_dms_per_day_30d : null;
  const peakHour = typeof stats?.peak_hour_utc === 'number' ? `${String(stats.peak_hour_utc).padStart(2, '0')}:00 UTC` : '—';
  const bestDay = stats?.best_day_30d?.date
    ? `${new Date(stats.best_day_30d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (${stats.best_day_30d.sent})`
    : '—';

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Track your DM automation performance</p>
      </div>

      {/* Overview stats */}
      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="analytics-stat-label">Total DMs Sent</p>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <MessageSquare size={14} className="text-primary"/>
            </div>
          </div>
          <p className="analytics-stat-value">{stats?.dms_sent_this_month ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">this month</p>
        </div>

        <div className="analytics-stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="analytics-stat-label">Automation Success Rate</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={14} className="text-success"/>
            </div>
          </div>
          <p className="analytics-stat-value success">{premiumEnabled ? `${successRate}%` : '—'}</p>
          <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1.5">{premiumEnabled ? <><Unlock size={12} />of automations succeeded</> : <><Lock size={12} />Upgrade to view</>}</p>
        </div>

        <div className="analytics-stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="analytics-stat-label">Active Rules</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Zap size={14} className="text-warning"/>
            </div>
          </div>
          <p className="analytics-stat-value">{stats?.active_rules ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">rules running</p>
        </div>
      </div>

      <DMVolumeChart
        isLocked={!premiumEnabled}
        loading={loading}
        data={data}
        days={days}
        onDaysChange={setDays}
      />

      {premiumEnabled && (
        <div className="analytics-stats mt-5">
          <div className="analytics-stat-card">
            <p className="analytics-stat-label mb-2">Avg DMs / Day (30d)</p>
            <p className="analytics-stat-value">{avgDmsPerDay ?? '—'}</p>
          </div>
          <div className="analytics-stat-card">
            <p className="analytics-stat-label mb-2">Peak Hour</p>
            <p className="analytics-stat-value">{peakHour}</p>
          </div>
          <div className="analytics-stat-card">
            <p className="analytics-stat-label mb-2">Best Day</p>
            <p className="analytics-stat-value">{bestDay}</p>
          </div>
        </div>
      )}

      {/* Meta compliance note for free */}
      {!premiumEnabled && (
        <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2.5">
          <Badge variant="indigo">{isFree ? 'Free Plan' : 'Upgrade Required'}</Badge>
          <span>Basic analytics are visible on all plans. Upgrade to Starter or Pro for premium analytics: success rate, DM trend charts, peak-hour insights, and 30-day reporting.</span>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
