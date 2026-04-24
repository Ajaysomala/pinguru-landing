import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Zap, MessageSquare, Camera, ToggleLeft, ToggleRight } from 'lucide-react';
import { getRules, toggleRule, getInstagramStatus } from '../lib/api';
import type { Rule, InstagramStatus } from '../lib/types';
import { TRIGGER_LABELS } from '../lib/types';
import { RuleBuilderModal } from '../components/rules/RuleBuilderModal';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/rules.css';

// ── RulesPage ─────────────────────────────────────────────────────────────────
const RulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rules, setRules]           = useState<Rule[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [igStatus, setIgStatus] = useState<InstagramStatus | null>(null);
  const [connectHint, setConnectHint] = useState('');
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [search, setSearch] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

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

  const handleCreated = (rule: Rule) => {
    setRules(prev => [rule, ...prev]);
  };

  const handleUpdated = (updatedRule: Rule) => {
    setRules(prev => prev.map(rule => (rule.id === updatedRule.id ? updatedRule : rule)));
  };

  const plan = (user?.plan ?? 'free').toLowerCase();
  const planLimit = plan === 'free' ? 5 : plan === 'starter' ? 15 : null;

  const filteredRules = rules.filter((rule) => {
    const matchesSearch = !search || rule.name.toLowerCase().includes(search.toLowerCase()) || rule.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()));
    const matchesTrigger = triggerFilter === 'all' || rule.trigger_type === triggerFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? rule.is_active : !rule.is_active);
    return matchesSearch && matchesTrigger && matchesStatus;
  });

  const usageLabel = planLimit ? `${rules.length} / ${planLimit} rules used (${plan})` : `${rules.length} rules used (${plan})`;

  const triggerIcon = (trigger: Rule['trigger_type']) => {
    if (trigger === 'comment') return <MessageSquare size={18} />;
    if (trigger === 'story_mention') return <Camera size={18} />;
    return <Zap size={18} />;
  };

  return (
    <div className="page-wrapper rules-v6-page">
      <div className="rules-v6-topbar-row">
        <h1 className="page-title">Automation Rules</h1>
        <div className="rules-v6-topbar-actions">
          <span className="rules-v6-usage-chip">{usageLabel}</span>
          <button onClick={openBuilder} className="rules-v6-primary-btn"><Plus size={15} /> New Rule</button>
        </div>
      </div>

      {connectHint && (
        <div className="rules-v6-alert">
          <Camera size={15} />
          <span>{connectHint}</span>
        </div>
      )}

      <section className="rules-v6-filter-row">
        <div className="rules-v6-search">
          <Search size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rules..." />
        </div>

        <select className="rules-v6-select" value={triggerFilter} onChange={(e) => setTriggerFilter(e.target.value)}>
          <option value="all">All triggers</option>
          <option value="keyword">Keyword</option>
          <option value="comment">Comment</option>
          <option value="story_mention">Story reply</option>
          <option value="new_dm">New DM</option>
        </select>

        <div className="rules-v6-segment">
          <button className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>All</button>
          <button className={statusFilter === 'active' ? 'active' : ''} onClick={() => setStatusFilter('active')}>Active</button>
          <button className={statusFilter === 'paused' ? 'active' : ''} onClick={() => setStatusFilter('paused')}>Paused</button>
        </div>
      </section>

      <section className="rules-v6-list">
        {loading ? (
          <div className="rules-v6-empty">Loading rules...</div>
        ) : filteredRules.length === 0 ? (
          <div className="rules-v6-empty">No rules found.</div>
        ) : (
          filteredRules.map((rule) => (
            <article key={rule.id} className={`rules-v6-item ${!rule.is_active ? 'is-paused' : ''}`}>
              <div className="rules-v6-item-icon">{triggerIcon(rule.trigger_type)}</div>
              <div className="rules-v6-item-copy">
                <h3>{rule.name}</h3>
                <p>
                  Trigger: {TRIGGER_LABELS[rule.trigger_type]} · Keywords: {rule.keywords.length ? rule.keywords.map(k => `"${k}"`).join(', ') : 'Any'} · {rule.dm_count ?? 0} DMs sent
                </p>
                <div className="rules-v6-tags">
                  <span className="tag purple">{rule.trigger_type}</span>
                  <span className={`tag ${rule.is_active ? 'green' : 'gray'}`}>{rule.is_active ? 'active' : 'paused'}</span>
                  {rule.any_comment_keyword && <span className="tag amber">follow-gate</span>}
                </div>
              </div>
              <div className="rules-v6-item-actions">
                <button onClick={() => openEditor(rule)} className="rules-v6-edit-btn">Edit</button>
                <button
                  onClick={() => handleToggle(rule)}
                  disabled={togglingId === rule.id}
                  className={`rules-v6-toggle ${rule.is_active ? 'on' : 'off'}`}
                  title={rule.is_active ? 'Disable rule' : 'Enable rule'}
                >
                  {rule.is_active ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="rules-v6-upgrade-strip">
        <div>
          <h3>You've used {rules.length} of {planLimit ?? '∞'} {plan === 'free' ? 'free ' : ''}rules</h3>
          <p>Upgrade to Pro for unlimited automation rules</p>
        </div>
        <Link to="/billing" className="rules-v6-upgrade-btn">Upgrade → Pro</Link>
      </section>

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
