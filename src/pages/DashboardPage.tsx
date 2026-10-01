import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  MessageSquare, 
  Clock, 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Instagram, 
  Sparkles, 
  Flame,
  AlertCircle
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
        <div className="h-44 rounded-2xl bg-[#121218]/60 animate-pulse border border-white/10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#121218]/60 animate-pulse border border-white/10" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 rounded-2xl bg-[#121218]/60 animate-pulse border border-white/10" />
          <div className="h-96 rounded-2xl bg-[#121218]/60 animate-pulse border border-white/10" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#121218]/90 border border-rose-500/20 rounded-2xl text-center space-y-4 max-w-lg mx-auto my-12 shadow-xl backdrop-blur-md">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unable to Load Dashboard</h2>
        <p className="text-xs text-zinc-400">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3D Hero Welcome Banner — Adaptive Luxury Glass Container */}
      <Card3D intensity={4} glowColor="rgba(99, 102, 241, 0.15)">
        <div className="relative rounded-2xl p-6 lg:p-8 overflow-hidden border border-slate-200 dark:border-white/10 shadow-xs dark:shadow-xl bg-white/90 dark:bg-[#121218]/80 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-gradient-to-tr from-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
                  Meta Webhooks Live
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10 shadow-2xs">
                  <Flame className="w-3 h-3 text-pink-500 dark:text-pink-400" />
                  Avg Latency: &lt; 1.0s
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {displayName}
                </span>
                !
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {igStatus?.connected ? (
                  <>
                    Your direct message funnel is automating leads for{' '}
                    <span className="font-mono text-cyan-400 font-semibold">@{igStatus.username || user?.instagram_username}</span>.
                    Followers triggering keywords receive instant branded replies and trackable links within milliseconds.
                  </>
                ) : (
                  <>
                    Connect your Instagram Business or Creator account to start sending automated keyword replies and tracking lead conversion.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-1 md:pt-0">
              <button
                onClick={() => navigate('/connect')}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>{igStatus?.connected ? `@${igStatus.username || 'Connected'}` : 'Connect IG Account'}</span>
              </button>
              <button
                onClick={() => navigate('/rules')}
                className="flex-1 sm:flex-initial min-h-[42px] px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />

                <span>New Rule</span>
              </button>
            </div>
          </div>
        </div>
      </Card3D>

      {/* Bento KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1 */}
        <Card3D intensity={3} glowColor="rgba(99, 102, 241, 0.15)">
          <div className="bg-white/90 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs dark:shadow-xl backdrop-blur-md hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600 dark:text-zinc-400">DMs Automated</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-cyan-600 dark:text-cyan-400 border border-indigo-500/20">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
                {dmsSent.toLocaleString()}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5 mt-1.5 font-semibold">
                <TrendingUp className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span>This billing cycle</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* KPI 2 */}
        <Card3D intensity={3} glowColor="rgba(99, 102, 241, 0.15)">
          <div className="bg-white/90 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs dark:shadow-xl backdrop-blur-md hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Active Rules</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
                {activeRulesCount}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-2 py-0.5 mt-1.5 font-semibold">
                <span>{rules.length} total configured</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* KPI 3 */}
        <Card3D intensity={3} glowColor="rgba(168, 85, 247, 0.15)">
          <div className="bg-white/90 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs dark:shadow-xl backdrop-blur-md hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">DM Quota</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
                {quotaRemaining !== null && quotaRemaining !== undefined ? quotaRemaining.toLocaleString() : 'Unlimited'}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-2 py-0.5 mt-1.5 font-medium">
                <span>{stats?.plan ? `${stats.plan.toUpperCase()} Tier` : 'Active'}</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* KPI 4 */}
        <Card3D intensity={3} glowColor="rgba(6, 182, 212, 0.15)">
          <div className="bg-white/90 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs dark:shadow-xl backdrop-blur-md hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Delivery Rate</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
                {successRate}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5 mt-1.5 font-semibold">
                <span>Meta API 100% policy-safe</span>
              </div>
            </div>
          </div>
        </Card3D>
      </div>

      {/* Main Interactive Studio: Live Simulator & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2 border-t border-slate-200 dark:border-white/5">
        {/* Left Column: Live Trigger & Keyword Simulator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                Live DM Simulator
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
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
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Active Automation Rules
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Toggle live rules or build new keyword responders.
              </p>
            </div>

            <button
              onClick={() => navigate('/rules')}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Manage all ({rules.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white/90 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xs dark:shadow-xl space-y-3">
            {rules.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Rules Configured</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xs mx-auto">
                  Create your first automation rule to begin responding to Instagram DMs and comments automatically.
                </p>
                <button
                  onClick={() => navigate('/rules')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Create Rule Now
                </button>
              </div>
            ) : (
              rules.slice(0, 5).map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#09090B]/60 border border-slate-200/80 dark:border-white/5 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{rule.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 capitalize font-semibold">
                        {rule.trigger_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(rule.keywords || []).slice(0, 3).map((kw) => (
                        <span key={kw} className="text-[10px] font-mono text-slate-700 dark:text-zinc-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
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
                          rule.is_active 
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 justify-end shadow-[0_0_8px_rgba(99,102,241,0.4)]' 
                            : 'bg-slate-300 dark:bg-white/10 justify-start'
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
