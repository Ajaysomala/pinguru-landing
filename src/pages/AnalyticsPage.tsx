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
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-violet-50 text-violet-600 border border-violet-200/60">
              <BarChart3 className="w-5 h-5 text-violet-600" />
            </div>
            <span>Analytics & Performance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time delivery statistics and volume trends sourced directly from your Instagram event logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-2xl text-xs">
            <button
              onClick={() => setDays(7)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                days === 7
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center ${
                days === 30
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="min-h-[38px] px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-xs hover:border-slate-300 flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-violet-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-3xl bg-slate-200/60 animate-pulse border border-slate-200/50" />
            ))}
          </div>
          <div className="h-80 rounded-3xl bg-slate-200/60 animate-pulse border border-slate-200/50" />
        </div>
      ) : error ? (
        <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-8 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Error Loading Analytics</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer shadow-sm"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <Card3D intensity={3} glowColor="rgba(124, 58, 237, 0.08)">
              <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-2">
                <span className="text-xs font-semibold text-slate-500">Total DMs in Period</span>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
                  {totalDms.toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-violet-700 bg-violet-50 border border-violet-200/60 rounded-full px-2 py-0.5 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
                  <span>Last {days} days activity</span>
                </div>
              </div>
            </Card3D>

            <Card3D intensity={3} glowColor="rgba(16, 185, 129, 0.08)">
              <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-2">
                <span className="text-xs font-semibold text-slate-500">Successful Deliveries</span>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
                  {totalSuccess.toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-2 py-0.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified by Meta Webhook</span>
                </div>
              </div>
            </Card3D>

            <Card3D intensity={3} glowColor="rgba(236, 72, 153, 0.08)">
              <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-2">
                <span className="text-xs font-semibold text-slate-500">Delivery Success Rate</span>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
                  {overallSuccessRate}%
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-pink-700 bg-pink-50 border border-pink-200/60 rounded-full px-2 py-0.5 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-pink-600" />
                  <span>Policy-compliant</span>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Interactive Volume Trend Chart */}
          <Card3D intensity={3} glowColor="rgba(124, 58, 237, 0.08)">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Automated DM Volume Trend</h2>
                  <p className="text-xs text-slate-500">Daily message dispatch volume over the last {days} days.</p>
                </div>
              </div>

              {totalDms === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">
                    No automated DM activity recorded in the selected period.
                  </p>
                  <p className="text-[11px] text-slate-400">
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
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.20" />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient area */}
                    {areaD && <path d={areaD} fill="url(#analyticsGradient)" />}

                    {/* Main stroke line */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#7C3AED"
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
                          className="fill-violet-600 stroke-white stroke-2 transition-all cursor-pointer shadow-xs"
                          onMouseEnter={() => setHoveredIndex(i)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Tooltip display */}
                  {hoveredIndex !== null && points[hoveredIndex] && (
                    <div
                      className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs shadow-xl pointer-events-none font-mono"
                    >
                      <span className="text-violet-300 font-bold">{points[hoveredIndex].data.date}</span>: {points[hoveredIndex].data.dms_sent} DMs ({points[hoveredIndex].data.success_count} delivered)
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
