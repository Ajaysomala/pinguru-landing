import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, MessageSquare, Zap, Lock, Unlock, Sparkles } from 'lucide-react';
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
    <div className="page-wrapper analytics-v6-page">
      <div className="page-header analytics-v6-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Detailed performance insights for your DM automation</p>
        <span className="analytics-v6-plan-chip">Current plan: {planName}</span>
      </div>

      <div className="analytics-v6-stats-row">
        <div className="analytics-v6-stat-card">
          <div className="top">
            <p>Total messages</p>
            <span><MessageSquare size={15} /></span>
          </div>
          <h3>{stats?.dms_sent_this_month ?? 0}</h3>
          <small>this month</small>
        </div>

        <div className="analytics-v6-stat-card success">
          <div className="top">
            <p>Success rate</p>
            <span><TrendingUp size={15} /></span>
          </div>
          <h3>{premiumEnabled ? `${successRate}%` : '—'}</h3>
          <small className="with-icon">{premiumEnabled ? <><Unlock size={12} /> unlocked</> : <><Lock size={12} /> locked on free</>}</small>
        </div>

        <div className="analytics-v6-stat-card">
          <div className="top">
            <p>Active rules</p>
            <span><Zap size={15} /></span>
          </div>
          <h3>{stats?.active_rules ?? 0}</h3>
          <small>running now</small>
        </div>
      </div>

      <section className="analytics-v6-chart-shell">
        <DMVolumeChart
          isLocked={!premiumEnabled}
          loading={loading}
          data={data}
          days={days}
          onDaysChange={setDays}
        />
      </section>

      {premiumEnabled && (
        <div className="analytics-v6-insight-grid">
          <div className="analytics-v6-insight-card">
            <p>Average DMs per day</p>
            <h4>{avgDmsPerDay ?? '—'}</h4>
          </div>
          <div className="analytics-v6-insight-card">
            <p>Peak hour</p>
            <h4>{peakHour}</h4>
          </div>
          <div className="analytics-v6-insight-card">
            <p>Best day</p>
            <h4>{bestDay}</h4>
          </div>
        </div>
      )}

      {!premiumEnabled && (
        <div className="analytics-v6-upgrade">
          <Sparkles size={18} />
          <Badge variant="indigo">{isFree ? 'Free Plan' : 'Upgrade Required'}</Badge>
          <span>Unlock success rate, trend chart details, peak-hour insights and best-day tracking.</span>
          <Link to="/billing">Upgrade now</Link>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
