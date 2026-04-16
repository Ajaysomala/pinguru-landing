import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap } from 'lucide-react';
import { getRules, toggleRule, deleteRule, requireAuth, getInstagramStatus } from '../lib/api';
import type { Rule } from '../lib/types';
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
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [connectHint, setConnectHint] = useState('');

  useEffect(() => {
    requireAuth().then(ok => { if (!ok) navigate('/login'); });
    getRules().then(r => setRules(r?.rules ?? [])).finally(() => setLoading(false));
    getInstagramStatus().then(s => setInstagramConnected(Boolean(s?.connected)));
  }, [navigate]);

  const openBuilder = () => {
    if (!instagramConnected) {
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
        <button
          onClick={openBuilder}
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-200"
        >
          <Plus size={16}/> New Rule
        </button>
      </div>

      {connectHint && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {connectHint}
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
