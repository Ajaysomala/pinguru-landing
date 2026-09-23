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
        <div className="h-44 rounded-3xl bg-slate-900/60 animate-pulse border border-white/[0.05]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-900/60 animate-pulse border border-white/[0.05]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 rounded-3xl bg-slate-900/60 animate-pulse border border-white/[0.05]" />
          <div className="h-96 rounded-3xl bg-slate-900/60 animate-pulse border border-white/[0.05]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-slate-900/80 border border-rose-500/20 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Unable to Load Dashboard</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 3D Hero Welcome Banner */}
      <Card3D intensity={6} glowColor="rgba(236, 72, 153, 0.25)">
        <div className="relative rounded-3xl p-5 sm:p-7 overflow-hidden border border-white/[0.1] bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-pink-500/20 via-purple-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-gradient-to-tr from-indigo-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Meta Webhooks Live
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <Flame className="w-3 h-3 text-pink-400" />
                  Avg Latency: &lt; 1.0s
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
                  {displayName}
                </span>
                !
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {igStatus?.connected ? (
                  <>
                    Your direct message funnel is automating leads for{' '}
                    <span className="font-mono text-purple-300 font-semibold">@{igStatus.username || user?.instagram_username}</span>.
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
                className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-2xl transition-all border border-white/[0.1] flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>{igStatus?.connected ? `@${igStatus.username || 'Connected'}` : 'Connect IG Account'}</span>
              </button>
              <button
                onClick={() => navigate('/rules')}
                className="flex-1 sm:flex-initial min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Rule</span>
              </button>
            </div>
          </div>
        </div>
      </Card3D>

      {/* 3D KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* KPI 1 */}
        <Card3D intensity={5} glowColor="rgba(99, 102, 241, 0.25)">
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">DMs Automated</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {dmsSent.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>This billing cycle</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* KPI 2 */}
        <Card3D intensity={5} glowColor="rgba(168, 85, 247, 0.25)">
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Active Rules</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {activeRulesCount}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-purple-300 mt-1">
                <span>{rules.length} total configured</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* KPI 3 */}
        <Card3D intensity={5} glowColor="rgba(236, 72, 153, 0.25)">
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">DM Quota</span>
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {quotaRemaining !== null && quotaRemaining !== undefined ? quotaRemaining.toLocaleString() : 'Unlimited'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <span>{stats?.plan ? `${stats.plan.toUpperCase()} Tier` : 'Active'}</span>
              </div>
            </div>
          </div>
        </Card3D>

        {/* KPI 4 */}
        <Card3D intensity={5} glowColor="rgba(16, 185, 129, 0.25)">
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Delivery Rate</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {successRate}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
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
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Live DM Simulator
              </h2>
              <p className="text-xs text-slate-400">
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
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Active Automation Rules
              </h2>
              <p className="text-xs text-slate-400">
                Toggle live rules or build new keyword responders.
              </p>
            </div>

            <button
              onClick={() => navigate('/rules')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Manage all ({rules.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
            {rules.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">No Rules Configured</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Create your first automation rule to begin responding to Instagram DMs and comments automatically.
                </p>
                <button
                  onClick={() => navigate('/rules')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Create Rule Now
                </button>
              </div>
            ) : (
              rules.slice(0, 5).map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/[0.06] hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{rule.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                        {rule.trigger_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(rule.keywords || []).slice(0, 3).map((kw) => (
                        <span key={kw} className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
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
                          rule.is_active ? 'bg-gradient-to-r from-indigo-600 to-purple-600 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
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
