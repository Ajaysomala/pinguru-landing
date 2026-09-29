import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Zap, 
  Plus, 
  Search, 
  MessageSquare, 
  AtSign, 
  Instagram, 
  Sparkles, 
  Edit3, 
  Trash2, 
  AlertCircle,
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { getRules, deleteRule, toggleRule } from '../lib/api';
import type { Rule } from '../lib/types';
import { Card3D } from '../components/ui/Card3D';
import { RuleBuilderModal } from '../components/rules/RuleBuilderModal';
import { useToast } from '../context/ToastContext';

export const RulesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [triggerFilter, setTriggerFilter] = useState<'all' | string>('all');
  const [statusFilter, _setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getRules();
      setRules(Array.isArray(res?.rules) ? res.rules : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load automation rules');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setEditingRule(null);
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleToggle = async (ruleId: string) => {
    setActionLoadingId(ruleId);
    try {
      const res = await toggleRule(ruleId);
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, is_active: res.is_active } : r))
      );
      showToast(`Rule is now ${res.is_active ? 'Active' : 'Paused'}.`);
    } catch {
      showToast('Failed to toggle rule state.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (ruleId: string, ruleName: string) => {
    if (!window.confirm(`Are you sure you want to delete the automation "${ruleName}"?`)) {
      return;
    }
    setActionLoadingId(ruleId);
    try {
      await deleteRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      showToast(`Rule "${ruleName}" deleted successfully.`);
    } catch {
      showToast('Failed to delete rule.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEditClick = (rule: Rule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const filteredRules = rules.filter((rule) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      rule.name.toLowerCase().includes(query) ||
      (rule.keywords || []).some((k) => k.toLowerCase().includes(query)) ||
      (rule.response_template || '').toLowerCase().includes(query);

    const matchesTrigger = triggerFilter === 'all' || rule.trigger_type === triggerFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && rule.is_active) ||
      (statusFilter === 'paused' && !rule.is_active);

    return matchesSearch && matchesTrigger && matchesStatus;
  });

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'comment':
      case 'post_comment':
        return <AtSign className="w-4 h-4 text-purple-400" />;
      case 'story_mention':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'new_dm':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <span>Automations Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Trigger custom auto-responses, lead magnets, and story mention rewards on Instagram.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRule(null);
            setIsModalOpen(true);
          }}
          className="min-h-[42px] px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-[0_8px_20px_-4px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_24px_-4px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Automation</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121218]/80 border border-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, keyword, or response..."
              className="w-full bg-white dark:bg-[#181822] border border-slate-300 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[40px] transition-all"
            />
          </div>

          {/* Trigger Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'All Triggers' },
              { id: 'keyword', label: 'Keyword DM' },
              { id: 'comment', label: 'Comments' },
              { id: 'story_mention', label: 'Story Mention' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTriggerFilter(f.id)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  triggerFilter === f.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-[#121218]/80 animate-pulse border border-slate-200 dark:border-white/10 backdrop-blur-md" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-white dark:bg-[#121218]/80 border border-rose-500/30 rounded-2xl text-center space-y-4 max-w-lg mx-auto my-8 shadow-xl backdrop-blur-md">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Error Loading Rules</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400">{error}</p>
          <button
            onClick={fetchRules}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer shadow-md"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-[#121218]/80 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Zap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Automation Rules Found</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-sm mx-auto">
              {searchQuery || triggerFilter !== 'all'
                ? 'No rules match your active filters. Try clearing your search.'
                : 'Get started by creating your first Instagram automation rule.'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRule(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-xl shadow-[0_8px_20px_-4px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_24px_-4px_rgba(124,58,237,0.5)] transition-all cursor-pointer"
          >
            Create Rule
          </button>
        </div>
      ) : (
        /* Rules 3D Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredRules.map((rule) => {
            const triggers = rule.analytics?.triggers ?? (rule.dm_count || 0);
            const dmsSent = rule.analytics?.dms_sent ?? (rule.dm_count || 0);
            const followsUnlocked = rule.analytics?.follows_unlocked ?? 0;
            const emailsCaptured = rule.analytics?.emails_captured ?? 0;
            const conversionRate = rule.analytics?.conversion_rate !== undefined
              ? rule.analytics.conversion_rate
              : (triggers > 0 ? Math.round(((emailsCaptured || followsUnlocked || dmsSent) / triggers) * 100) : 0);

            return (
              <Card3D key={rule.id} intensity={4} glowColor="rgba(99, 102, 241, 0.15)">
                <div className="h-full bg-[#121218]/80 border border-white/10 hover:border-indigo-500/50 backdrop-blur-md rounded-2xl p-6 lg:p-7 shadow-xl hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:-translate-y-1 flex flex-col justify-between space-y-4 transition-all duration-300">
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          {getTriggerIcon(rule.trigger_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[160px]">
                              {rule.name}
                            </h3>
                            {rule.is_active ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-zinc-400 border border-white/10">
                                Paused
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-indigo-400 capitalize font-semibold">
                            {rule.trigger_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggle(rule.id)}
                        disabled={actionLoadingId === rule.id}
                        className="min-h-[36px] min-w-[48px] flex items-center justify-center cursor-pointer"
                        title={rule.is_active ? 'Pause Rule' : 'Activate Rule'}
                      >
                        <div
                          className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all ${
                            rule.is_active
                              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 justify-end shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                              : 'bg-zinc-800 border border-white/10 justify-start'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                        </div>
                      </button>
                    </div>

                    {/* Keywords List */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Trigger Keywords:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(rule.keywords || []).map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] font-semibold"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Response Template Preview */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-zinc-300 line-clamp-2 leading-relaxed font-mono">
                      {rule.response_template || 'No response template specified.'}
                    </div>

                    {/* Active Mechanisms */}
                    {(Boolean(rule.dm_buttons?.length) || Boolean(rule.capture_email_enabled) || Boolean(rule.reply_delay_seconds) || Boolean(rule.public_comment_reply_templates && rule.public_comment_reply_templates.length > 1)) && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {rule.dm_buttons && rule.dm_buttons.length > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold flex items-center gap-1">
                            <span>🔘</span> {rule.dm_buttons.length} {rule.dm_buttons.length === 1 ? 'Button' : 'Buttons'}
                          </span>
                        )}
                        {rule.capture_email_enabled && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                            <span>📩</span> Lead Capture
                          </span>
                        )}
                        {Boolean(rule.reply_delay_seconds) && (
                          <span className="px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 text-[10px] font-semibold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {rule.reply_delay_seconds}s Delay
                          </span>
                        )}
                        {rule.public_comment_reply_templates && rule.public_comment_reply_templates.length > 1 && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold flex items-center gap-1">
                            <span>🔄</span> {rule.public_comment_reply_templates.length} Variations
                          </span>
                        )}
                      </div>
                    )}

                    {/* 4-Stage Conversion Funnel: Triggers -> DMs Sent -> Follows Unlocked -> Emails Captured -> Conversion Rate (%) */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="flex items-center gap-1.5 text-indigo-400 uppercase tracking-wider text-[9px]">
                          <TrendingUp className="w-3 h-3 text-indigo-400" />
                          <span>Conversion Funnel</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                          {conversionRate}% Conv.
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        {/* Triggers */}
                        <div className="flex-1 bg-[#181822] border border-white/10 rounded-xl p-1.5 text-center min-w-0">
                          <div className="text-[9px] text-zinc-400 font-medium truncate">Triggers</div>
                          <div className="text-xs font-mono font-bold text-indigo-400 mt-0.5">{triggers}</div>
                        </div>

                        <ArrowRight className="w-2.5 h-2.5 text-zinc-500 shrink-0" />

                        {/* DMs Sent */}
                        <div className="flex-1 bg-[#181822] border border-white/10 rounded-xl p-1.5 text-center min-w-0">
                          <div className="text-[9px] text-zinc-400 font-medium truncate">DMs Sent</div>
                          <div className="text-xs font-mono font-bold text-violet-400 mt-0.5">{dmsSent}</div>
                        </div>

                        <ArrowRight className="w-2.5 h-2.5 text-zinc-500 shrink-0" />

                        {/* Follows */}
                        <div className="flex-1 bg-[#181822] border border-white/10 rounded-xl p-1.5 text-center min-w-0">
                          <div className="text-[9px] text-zinc-400 font-medium truncate">Follows</div>
                          <div className="text-xs font-mono font-bold text-pink-400 mt-0.5">{followsUnlocked}</div>
                        </div>

                        <ArrowRight className="w-2.5 h-2.5 text-zinc-500 shrink-0" />

                        {/* Emails */}
                        <div className="flex-1 bg-[#181822] border border-white/10 rounded-xl p-1.5 text-center min-w-0">
                          <div className="text-[9px] text-zinc-400 font-medium truncate">Emails</div>
                          <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{emailsCaptured}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Metrics & Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-mono">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{dmsSent} DMs</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(rule)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit Rule"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id, rule.name)}
                        disabled={actionLoadingId === rule.id}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>
      )}

      {/* Create & Edit Modal */}
      <RuleBuilderModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        onCreated={(newRule) => {
          setRules((prev) => [newRule, ...prev]);
          showToast(`Rule "${newRule.name}" created successfully!`);
        }}
        onUpdated={(updatedRule) => {
          setRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)));
          showToast(`Rule "${updatedRule.name}" updated successfully.`);
        }}
        initialRule={editingRule}
      />
    </div>
  );
};

export default RulesPage;
