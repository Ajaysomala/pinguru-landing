import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap, Circle, Activity, PauseCircle, Sparkles, ShieldCheck, Clock, ArrowRight, CheckCircle, Link2, RefreshCw } from 'lucide-react';
import { getRules, toggleRule, deleteRule, getInstagramStatus } from '../lib/api';
import type { Rule, InstagramStatus } from '../lib/types';
import { TRIGGER_LABELS } from '../lib/types';
import { RuleCard } from '../components/rules/RuleCard';
import { RuleBuilderModal } from '../components/rules/RuleBuilderModal';
import { formatExpiryRelative } from '../lib/utils';
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
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

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
    setEditingRule(null);
    setShowModal(true);
  };

  const openEditor = (rule: Rule) => {
    setEditingRule(rule);
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

  const handleUpdated = (updatedRule: Rule) => {
    setRules(prev => prev.map(rule => (rule.id === updatedRule.id ? updatedRule : rule)));
  };

  const activeCount = rules.filter(r => r.is_active).length;
  const pausedCount = Math.max(0, rules.length - activeCount);
  const latestRule = rules[0];
  const connectionLabel = igStatus?.connected ? 'Connected' : 'Not connected';
  const tokenLabel = igStatus?.token_expires_at ? formatExpiryRelative(igStatus.token_expires_at) : 'Unknown';
  const healthLabel = igStatus?.connected ? (igStatus?.token_expires_at ? `Token ${tokenLabel}` : 'Token unknown') : 'Connect Instagram to activate rules';

  return (
    <div className="page-wrapper automation-v5-page">
      <section className="automation-v5-hero">
        <div className="automation-v5-orb automation-v5-orb-a" />
        <div className="automation-v5-orb automation-v5-orb-b" />

        <div className="automation-v5-hero-copy">
          <p className="automation-v5-kicker"><Sparkles size={12} /> Automation Control Hub</p>
          <h1 className="automation-v5-title">Automation Rules</h1>
          <p className="automation-v5-subtitle">
            {loading
              ? 'Loading your automation workspace...'
              : `${rules.length} rule${rules.length !== 1 ? 's' : ''} configured · ${activeCount} active flow${activeCount !== 1 ? 's' : ''}`}
          </p>

          <div className="automation-v5-hero-actions">
            <button
              type="button"
              className={`automation-v5-live-pill ${igStatus?.connected ? 'connected' : 'disconnected'}`}
              onClick={() => getInstagramStatus().then(s => setIgStatus(s))}
              title="Refresh Instagram connection status"
            >
              <Circle size={10} className="ig-live-dot" />
              {igStatus?.connected ? 'Instagram Connected' : 'Instagram Not Connected'}
            </button>
            <button
              onClick={openBuilder}
              className="automation-v5-btn primary"
            >
              <Plus size={16}/> New Rule
            </button>
          </div>
        </div>

        <div className="automation-v5-hero-stats">
          <div className="automation-v5-stat-card">
            <span>Total Rules</span>
            <strong>{rules.length}</strong>
            <em><Zap size={12} /> Automation inventory</em>
          </div>
          <div className="automation-v5-stat-card">
            <span>Active Flows</span>
            <strong>{activeCount}</strong>
            <em><Activity size={12} /> Running now</em>
          </div>
          <div className="automation-v5-stat-card">
            <span>Paused</span>
            <strong>{pausedCount}</strong>
            <em><PauseCircle size={12} /> Not currently firing</em>
          </div>
        </div>
      </section>

      {connectHint && (
        <div className="automation-v5-alert warn">
          <Link2 size={15} />
          <span>{connectHint}</span>
        </div>
      )}

      <div className="automation-v5-body-grid">
        <section className="automation-v5-main-col">
          <div className="automation-v5-connection-note">
            <div>
              <p className="automation-v5-note-title"><ShieldCheck size={13} /> Instagram Status: {connectionLabel}</p>
              <p className="automation-v5-note-desc">{healthLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => getInstagramStatus().then(s => setIgStatus(s))}
              className="automation-v5-btn ghost"
            >
              <RefreshCw size={14}/> Refresh Status
            </button>
          </div>

          {loading && (
            <div className="automation-v5-loading">
              <svg className="animate-spin h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          )}

          {!loading && rules.length === 0 && (
            <div className="automation-v5-empty-card">
              <div className="automation-v5-empty-icon"><Zap size={28} /></div>
              <h2>No automation rules yet</h2>
              <p>Create your first rule to auto-reply faster and keep lead conversations consistent.</p>
              <button
                onClick={openBuilder}
                className="automation-v5-btn primary"
              >
                <Plus size={15}/> Create First Rule
              </button>
            </div>
          )}

          {!loading && rules.length > 0 && (
            <div className="automation-v5-rules-shell">
              <div className="automation-v5-rules-head">
                <div>
                  <p className="automation-v5-rules-eyebrow">Rule List</p>
                  <h3>Live automations</h3>
                </div>
                {latestRule && (
                  <div className="automation-v5-latest-chip">
                    Last added: <strong>{latestRule.name}</strong>
                  </div>
                )}
              </div>
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
                    onEdit={openEditor}
                    onRequestDelete={setConfirmDelete}
                    onCancelDelete={() => setConfirmDelete(null)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="automation-v5-side-col">
          <section className="automation-v5-side-card">
            <div className="automation-v5-side-head">
              <p className="automation-v5-side-eyebrow">
              <Clock size={12} /> How It Works
              </p>
              <h3>Execution Blueprint</h3>
            </div>
            <div className="automation-v5-guide-list">
              <div className="automation-v5-guide-item"><CheckCircle size={14} /> Pick a trigger for incoming activity.</div>
              <div className="automation-v5-guide-item"><CheckCircle size={14} /> Define your response template and variables.</div>
              <div className="automation-v5-guide-item"><CheckCircle size={14} /> Activate the rule and monitor DM outcomes.</div>
              <div className="automation-v5-guide-item"><CheckCircle size={14} /> Iterate based on conversion performance.</div>
            </div>
          </section>

          <section className="automation-v5-side-card">
            <div className="automation-v5-side-head">
              <p className="automation-v5-side-eyebrow"><Sparkles size={12} /> Active Trigger Focus</p>
              <h3>Latest Rule Context</h3>
            </div>
            <div className="automation-v5-focus-card">
              <p className="automation-v5-focus-name">{latestRule ? latestRule.name : 'No rule selected'}</p>
              <p className="automation-v5-focus-meta">
                {latestRule ? TRIGGER_LABELS[latestRule.trigger_type] : 'Create a new rule to see trigger context'}
              </p>
              {latestRule && (
                <div className="automation-v5-focus-chip">
                  <ArrowRight size={12} /> {latestRule.is_active ? 'Currently active' : 'Currently paused'}
                </div>
              )}
              <button onClick={openBuilder} className="automation-v5-btn secondary">
                <Plus size={14}/> Create Another Rule
              </button>
              <button onClick={() => navigate('/connect')} className="automation-v5-btn ghost">
                <Link2 size={14}/> Open Instagram Connect
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* Rule Builder Modal */}
      <RuleBuilderModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRule(null);
        }}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        initialRule={editingRule}
      />
    </div>
  );
};

export default RulesPage;
