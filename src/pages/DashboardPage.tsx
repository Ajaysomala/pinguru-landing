import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  MessageSquare, 
  MousePointerClick, 
  Clock, 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Instagram, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Flame,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../App';
import { getDashboardStats, getRules, getInstagramStatus, toggleRule } from '../lib/api';
import type { DashboardStats, Rule } from '../lib/types';
import { TriggerSimulator } from '../components/dashboard/TriggerSimulator';
import { Card3D } from '../components/ui/Card3D';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [igStatus, setIgStatus] = useState<{ connected: boolean; username?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, rulesData, statusData] = await Promise.all([
        getDashboardStats().catch(() => null),
        getRules().catch(() => ({ rules: [] })),
        getInstagramStatus().catch(() => null),
      ]);

      setStats(statsData);
      setRules(Array.isArray(rulesData?.rules) ? rulesData.rules : []);
      setIgStatus(statusData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleToggleRule = async (ruleId: string) => {
    try {
      const res = await toggleRule(ruleId);
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, is_active: res.is_active } : r))
      );
      showToast(`Automation rule is now ${res.is_active ? 'Active' : 'Paused'}.`);
    } catch {
      showToast('Failed to update rule status. Please try again.');
    }
  };

  const displayName = user?.display_name || user?.first_name || (user?.email ? user.email.split('@')[0] : 'Creator');
  const activeRulesCount = stats?.active_rules ?? rules.filter((r) => r.is_active).length;
  const dmsSent = stats?.dms_sent_this_month ?? 0;
  const quotaRemaining = stats?.dm_remaining;
  const successRate = stats?.success_rate !== null && stats?.success_rate !== undefined ? `${stats.success_rate}%` : '100%';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-3xl bg-slate-200/60 animate-pulse border border-slate-200/50" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-200/60 animate-pulse border border-slate-200/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 rounded-3xl bg-slate-200/60 animate-pulse border border-slate-200/50" />
          <div className="h-96 rounded-3xl bg-slate-200/60 animate-pulse border border-slate-200/50" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Unable to Load Dashboard</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 3D Hero Welcome Banner — Radiant Pastel Container */}
      <Card3D intensity={4} glowColor="rgba(124, 58, 237, 0.08)">
        <div className="relative rounded-3xl p-5 sm:p-7 overflow-hidden border border-violet-100 shadow-sm bg-gradient-to-r from-violet-50/80 via-white to-pink-50/80">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-pink-200/30 via-purple-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Meta Webhooks Live
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-violet-700 border border-violet-200 shadow-2xs">
                  <Flame className="w-3 h-3 text-pink-500" />
                  Avg Latency: &lt; 1.0s
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                  {displayName}
                </span>
                !
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {igStatus?.connected ? (
                  <>
                    Your direct message funnel is automating leads for{' '}
                    <span className="font-mono text-violet-700 font-semibold">@{igStatus.username || user?.instagram_username}</span>.
                    Followers triggering keywords receive instant branded replies and trackable links within milliseconds.
                  </>
                ) : (
                  <>
                    Connect your Instagram Business or Creator account to start sending automated keyword replies and tracking lead conversion.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 pt-1 md:pt-0">
              <button
                onClick={() => navigate('/connect')}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-xs hover:border-slate-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>{igStatus?.connected ? `@${igStatus.username || 'Connected'}` : 'Connect IG Account'}</span>
              </button>
              <button
                onClick={() => navigate('/rules')}
                className="flex-1 sm:flex-initial min-h-[42px] px-5 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-semibold rounded-xl shadow-[0_8px_20px_-4px_rgba(124,58,237,0.35)] hover:shadow-[0_12px_24px_-4px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Rule</span>
              </button>
            </div>
          </div>
        </div>
      </Card3D>

      {/* Bento KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* KPI 1 */}
        <Card3D intensity={3} glowColor="rgba(124, 58, 237, 0.08)">
          <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">DMs Automated</span>
              <div className="p-2 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
                {dmsSent.toLocaleString()}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-2 py-0.5 mt-1 font-semibold">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>This billing cycle</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* KPI 2 */}
        <Card3D intensity={3} glowColor="rgba(124, 58, 237, 0.08)">
          <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Rules</span>
              <div className="p-2 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
                {activeRulesCount}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-violet-700 bg-violet-50 border border-violet-200/60 rounded-full px-2 py-0.5 mt-1 font-semibold">
                <span>{rules.length} total configured</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* KPI 3 */}
        <Card3D intensity={3} glowColor="rgba(236, 72, 153, 0.08)">
          <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">DM Quota</span>
              <div className="p-2 rounded-xl bg-pink-50 text-pink-600 border border-pink-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
                {quotaRemaining !== null && quotaRemaining !== undefined ? quotaRemaining.toLocaleString() : 'Unlimited'}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 mt-1 font-medium">
                <span>{stats?.plan ? `${stats.plan.toUpperCase()} Tier` : 'Active'}</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* KPI 4 */}
        <Card3D intensity={3} glowColor="rgba(16, 185, 129, 0.08)">
          <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Delivery Rate</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
                {successRate}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-2 py-0.5 mt-1 font-semibold">
                <span>Meta API 100% policy-safe</span>
              </div>
            </div>
          </div>
        </Card3D>
      </div>

      {/* Main Interactive Studio: Live Simulator & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Live Trigger & Keyword Simulator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                Live DM Simulator
              </h2>
              <p className="text-xs text-slate-500">
                Test keywords in real-time against your active automation rules.
              </p>
            </div>
          </div>

          <TriggerSimulator 
            rules={rules} 
            instagramUsername={igStatus?.username || user?.instagram_username || 'yourbrand'} 
          />
        </div>

        {/* Right Column: Active Rules Quick Studio */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-600" />
                Active Automation Rules
              </h2>
              <p className="text-xs text-slate-500">
                Toggle live rules or build new keyword responders.
              </p>
            </div>

            <button
              onClick={() => navigate('/rules')}
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Manage all ({rules.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            {rules.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Rules Configured</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Create your first automation rule to begin responding to Instagram DMs and comments automatically.
                </p>
                <button
                  onClick={() => navigate('/rules')}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
                >
                  Create Rule Now
                </button>
              </div>
            ) : (
              rules.slice(0, 5).map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:border-violet-300 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{rule.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200/60 capitalize font-semibold">
                        {rule.trigger_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(rule.keywords || []).slice(0, 3).map((kw) => (
                        <span key={kw} className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="min-h-[36px] min-w-[48px] flex items-center justify-center cursor-pointer"
                    >
                      <div
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all ${
                          rule.is_active ? 'bg-violet-600 justify-end' : 'bg-slate-200 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                      </div>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
