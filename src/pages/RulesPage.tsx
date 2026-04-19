import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap, Circle, Activity, PauseCircle } from 'lucide-react';
import { getRules, toggleRule, deleteRule, getInstagramStatus } from '../lib/api';
import type { Rule, InstagramStatus } from '../lib/types';
import { RuleCard } from '../components/rules/RuleCard';
import { RuleBuilderModal } from '../components/rules/RuleBuilderModal';
import '../styles/dashboard.css';
import '../styles/rules.css';

// ── RulesPage ─────────────────────────────────────────────────────────────────
const RulesPage: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules]           = useState<Rule[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [igStatus, setIgStatus] = useState<InstagramStatus | null>(null);
  const [connectHint, setConnectHint] = useState('');

  useEffect(() => {
    getRules().then(r => setRules(r?.rules ?? [])).finally(() => setLoading(false));
    getInstagramStatus().then(s => setIgStatus(s));
  }, []);

  const openBuilder = () => {
    if (!igStatus?.connected) {
      setConnectHint('Connect Instagram first to create automation rules.');
      navigate('/connect');
      return;
    }
    setConnectHint('');
    setShowModal(true);
  };

  const handleToggle = async (rule: Rule) => {
    setTogglingId(rule.id);
    try {
      const updated = await toggleRule(rule.id);
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: updated.is_active } : r));
    } catch { /* silent */ }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch { /* silent */ }
    finally { setDeletingId(null); setConfirmDelete(null); }
  };

  const handleCreated = (rule: Rule) => {
    setRules(prev => [rule, ...prev]);
  };

  const activeCount = rules.filter(r => r.is_active).length;
  const pausedCount = Math.max(0, rules.length - activeCount);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Automation Rules</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${rules.length} rule${rules.length !== 1 ? 's' : ''} · ${activeCount} active`}
          </p>
        </div>
        <div className="rules-header-actions">
          <button
            type="button"
            className={`ig-live-pill ${igStatus?.connected ? 'connected' : 'disconnected'}`}
            onClick={() => getInstagramStatus().then(s => setIgStatus(s))}
            title="Refresh Instagram connection status"
          >
            <Circle size={10} className="ig-live-dot" />
            {igStatus?.connected ? 'Instagram Connected' : 'Instagram Not Connected'}
          </button>
          <button
            onClick={openBuilder}
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-200"
          >
            <Plus size={16}/> New Rule
          </button>
        </div>
      </div>

      {connectHint && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {connectHint}
        </div>
      )}

      {!loading && (
        <div className="stats-grid mb-6">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Rules</p>
                <p className="stat-value">{rules.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Zap size={17} className="text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Active</p>
                <p className="stat-value">{activeCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Activity size={17} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Paused</p>
                <p className="stat-value">{pausedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <PauseCircle size={17} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Instagram Status</p>
                <p className="stat-value text-[1.6rem]">{igStatus?.connected ? 'Connected' : 'Not linked'}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${igStatus?.connected ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <Circle size={17} className={igStatus?.connected ? 'text-emerald-600' : 'text-rose-600'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      )}

      {/* Empty state */}
      {!loading && rules.length === 0 && (
        <div className="card text-center py-14">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Zap size={28} className="text-primary"/>
          </div>
          <h2 className="font-bold text-slate-800 text-lg mb-1">No rules yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
            Create your first automation rule to start responding to DMs automatically.
          </p>
          <button
            onClick={openBuilder}
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus size={15}/> Create First Rule
          </button>
        </div>
      )}

      {/* Rules List */}
      {!loading && rules.length > 0 && (
        <div className="rules-list">
          {rules.map((rule, i) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              style={{ animationDelay: `${i * 40}ms` }}
              isToggling={togglingId === rule.id}
              isDeleting={deletingId === rule.id}
              confirmingDelete={confirmDelete === rule.id}
              onToggle={handleToggle}
              onRequestDelete={setConfirmDelete}
              onCancelDelete={() => setConfirmDelete(null)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Rule Builder Modal */}
      <RuleBuilderModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default RulesPage;
