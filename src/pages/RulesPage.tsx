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
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Clock
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

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
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <span>Automations Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Trigger custom auto-responses, lead magnets, and story mention rewards on Instagram.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRule(null);
            setIsModalOpen(true);
          }}
          className="min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Automation</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-white/[0.08] rounded-3xl p-3 sm:p-4 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, keyword, or response..."
              className="w-full bg-slate-950 border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 min-h-[40px]"
            />
          </div>

          {/* Trigger Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'All Triggers' },
              { id: 'keyword', label: 'Keyword DM' },
              { id: 'comment', label: 'Comments' },
              { id: 'story_mention', label: 'Story Mention' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTriggerFilter(f.id)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  triggerFilter === f.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-white/[0.05]'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-3xl bg-slate-900/60 animate-pulse border border-white/[0.05]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-slate-900/80 border border-rose-500/20 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-8">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Error Loading Rules</h2>
          <p className="text-xs text-slate-400">{error}</p>
          <button
            onClick={fetchRules}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-slate-900/40 border border-white/[0.06] rounded-3xl p-8">
          <div className="w-14 h-14 rounded-3xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto">
            <Zap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Automation Rules Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            Create Rule
          </button>
        </div>
      ) : (
        /* Rules 3D Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRules.map((rule) => (
            <Card3D key={rule.id} intensity={6} glowColor="rgba(168, 85, 247, 0.2)">
              <div className="h-full bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] hover:border-purple-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all">
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-950 border border-white/[0.08]">
                        {getTriggerIcon(rule.trigger_type)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white truncate max-w-[160px] sm:max-w-[180px]">
                          {rule.name}
                        </h3>
                        <span className="text-[10px] font-mono text-purple-300 capitalize">
                          {rule.trigger_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(rule.id)}
                      disabled={actionLoadingId === rule.id}
                      className="min-h-[36px] min-w-[48px] flex items-center justify-center cursor-pointer"
                    >
                      <div
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all ${
                          rule.is_active
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 justify-end'
                            : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </button>
                  </div>

                  {/* Keywords List */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Trigger Keywords:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(rule.keywords || []).map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-lg bg-slate-950 border border-white/[0.06] text-purple-300 font-mono text-[10px] font-semibold"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Response Template Preview */}
                  <div className="p-3 bg-slate-950/70 border border-white/[0.06] rounded-2xl text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                    {rule.response_template || 'No response template specified.'}
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span>{rule.dm_count || 0} DMs</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(rule)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                      title="Edit Rule"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id, rule.name)}
                      disabled={actionLoadingId === rule.id}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
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
