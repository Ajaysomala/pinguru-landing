import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Zap, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { getAnalytics } from '../lib/api';
import type { AnalyticsData } from '../lib/types';
import { Card3D } from '../components/ui/Card3D';
import { useToast } from '../context/ToastContext';

export const AnalyticsPage: React.FC = () => {
  const { showToast } = useToast();

  const [days, setDays] = useState<7 | 30>(7);
  const [metrics, setMetrics] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAnalytics(days);
      setMetrics(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totalDms = metrics.reduce((sum, d) => sum + (d.dms_sent || 0), 0);
  const totalSuccess = metrics.reduce((sum, d) => sum + (d.success_count || 0), 0);
  const overallSuccessRate = totalDms > 0 ? ((totalSuccess / totalDms) * 100).toFixed(1) : '100';

  // SVG Chart Dimensions
  const maxDms = Math.max(...metrics.map((d) => d.dms_sent || 0), 10);
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 35;
  const paddingY = 25;

  const points = metrics.map((d, idx) => {
    const x = paddingX + (idx / Math.max(1, metrics.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((d.dms_sent || 0) / maxDms) * (svgHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`
    : '';

  const handleExportCSV = () => {
    if (metrics.length === 0) {
      showToast('No analytics data available to export.');
      return;
    }
    const headers = ['Date,Automated DMs Sent,Successful Deliveries\n'];
    const rows = metrics.map((d) => `${d.date},${d.dms_sent},${d.success_count}\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinguru_analytics_${days}d_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Analytics CSV exported successfully.');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <span>Analytics & Performance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time delivery statistics and volume trends sourced directly from your Instagram event logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-white/[0.08] p-1 rounded-2xl text-xs">
            <button
              onClick={() => setDays(7)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                days === 7
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                days === 30
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl border border-white/[0.08] transition-colors flex items-center gap-1.5 active:scale-95 shrink-0 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-3xl bg-slate-900/60 animate-pulse border border-white/[0.05]" />
            ))}
          </div>
          <div className="h-80 rounded-3xl bg-slate-900/60 animate-pulse border border-white/[0.05]" />
        </div>
      ) : error ? (
        <div className="p-8 bg-slate-900/80 border border-rose-500/20 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-8">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Error Loading Analytics</h2>
          <p className="text-xs text-slate-400">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <Card3D intensity={5} glowColor="rgba(99, 102, 241, 0.2)">
              <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-2">
                <span className="text-xs font-semibold text-slate-400">Total DMs in Period</span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {totalDms.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-purple-300">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Last {days} days activity</span>
                </div>
              </div>
            </Card3D>

            <Card3D intensity={5} glowColor="rgba(16, 185, 129, 0.2)">
              <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-2">
                <span className="text-xs font-semibold text-slate-400">Successful Deliveries</span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {totalSuccess.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified by Meta Webhook</span>
                </div>
              </div>
            </Card3D>

            <Card3D intensity={5} glowColor="rgba(236, 72, 153, 0.2)">
              <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-2">
                <span className="text-xs font-semibold text-slate-400">Delivery Success Rate</span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {overallSuccessRate}%
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-pink-300">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Policy-compliant</span>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Interactive Volume Trend Chart */}
          <Card3D intensity={5} glowColor="rgba(168, 85, 247, 0.2)">
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Automated DM Volume Trend</h2>
                  <p className="text-xs text-slate-400">Daily message dispatch volume over the last {days} days.</p>
                </div>
              </div>

              {totalDms === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No automated DM activity recorded in the selected period.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Once followers trigger keywords on your Instagram account, volume metrics will appear here.
                  </p>
                </div>
              ) : (
                <div className="relative w-full overflow-hidden">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-48 sm:h-64 overflow-visible"
                  >
                    <defs>
                      <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient area */}
                    {areaD && <path d={areaD} fill="url(#analyticsGradient)" />}

                    {/* Main stroke line */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#C084FC"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Interactive points */}
                    {points.map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredIndex === i ? 6 : 4}
                          className="fill-purple-400 stroke-slate-950 stroke-2 transition-all cursor-pointer"
                          onMouseEnter={() => setHoveredIndex(i)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Tooltip display */}
                  {hoveredIndex !== null && points[hoveredIndex] && (
                    <div
                      className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-slate-200 shadow-xl pointer-events-none font-mono"
                    >
                      <span className="text-purple-300 font-bold">{points[hoveredIndex].data.date}</span>: {points[hoveredIndex].data.dms_sent} DMs ({points[hoveredIndex].data.success_count} delivered)
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card3D>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
