import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Zap, MessageSquare, Camera, Inbox, Sparkles,
  ToggleLeft, ToggleRight, PencilLine, Trash2, Copy, Play,
  PauseCircle, Activity, Gauge, ArrowRight, X,
} from 'lucide-react';
import { deleteRule, getInstagramStatus, getRules, toggleRule } from '../lib/api';
import type { Rule, InstagramStatus, TriggerType } from '../lib/types';
import { TRIGGER_LABELS } from '../lib/types';
import { RuleBuilderModal, type RuleSeed } from '../components/rules/RuleBuilderModal';
import { useAuth } from '../App';
import '../styles/dashboard.css';
import '../styles/rules.css';

const TEMPLATES: Array<{
  id: string;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  seed: RuleSeed;
}> = [
  {
    id: 'price',
    title: 'Price inquiry',
    blurb: 'Auto-reply when someone asks about pricing',
    icon: <Zap size={16} />,
    seed: {
      name: 'Price inquiry',
      trigger_type: 'keyword',
      keywords: ['price', 'pricing', 'cost', 'kitna'],
      response_template: 'Hi {{name}}! Thanks for asking about pricing. Our plans start at ₹199/mo — want me to share the full breakdown?',
    },
  },
  {
    id: 'link',
    title: 'Send link',
    blurb: 'DM your link when they comment LINK',
    icon: <MessageSquare size={16} />,
    seed: {
      name: 'Comment → send link',
      trigger_type: 'comment',
      keywords: ['link', 'url'],
      any_comment_keyword: false,
      comment_target_type: 'any',
      response_template: 'Hey {{username}}! Here is the link you asked for 🔗 https://pinguru.me',
    },
  },
  {
    id: 'story',
    title: 'Story thank-you',
    blurb: 'Warm follow-up after a story reply',
    icon: <Camera size={16} />,
    seed: {
      name: 'Story reply thank-you',
      trigger_type: 'story_mention',
      keywords: [],
      response_template: 'Thanks for the story love, {{name}}! Want early access to our next drop?',
    },
  },
  {
    id: 'welcome',
    title: 'Welcome DM',
    blurb: 'Instant first response on every new DM',
    icon: <Inbox size={16} />,
    seed: {
      name: 'Welcome new DMs',
      trigger_type: 'new_dm',
      keywords: [],
      response_template: 'Hey {{name}}! Thanks for messaging us. Tell us what you need — pricing, support, or a demo — and we will help right away.',
    },
  },
];

const RulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [igStatus, setIgStatus] = useState<InstagramStatus | null>(null);
  const [connectHint, setConnectHint] = useState('');
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [seed, setSeed] = useState<RuleSeed | null>(null);
  const [search, setSearch] = useState('');
  const [triggerFilter, setTriggerFilter] = useState<'all' | TriggerType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'dms' | 'name'>('newest');

  useEffect(() => {
    getRules().then((r) => setRules(r?.rules ?? [])).finally(() => setLoading(false));
    getInstagramStatus().then((s) => setIgStatus(s));
  }, []);

  const plan = (user?.plan ?? 'free').toLowerCase();
  const planLimit = plan === 'free' ? 5 : plan === 'starter' ? 15 : null;
  const activeCount = rules.filter((r) => r.is_active).length;
  const pausedCount = rules.length - activeCount;
  const totalDms = rules.reduce((sum, r) => sum + (r.dm_count ?? 0), 0);
  const usagePct = planLimit ? Math.min(100, Math.round((rules.length / planLimit) * 100)) : 0;

  const filteredRules = useMemo(() => {
    const list = rules.filter((rule) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q
        || rule.name.toLowerCase().includes(q)
        || rule.keywords.some((k) => k.toLowerCase().includes(q))
        || rule.response_template.toLowerCase().includes(q);
      const matchesTrigger = triggerFilter === 'all' || rule.trigger_type === triggerFilter;
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' ? rule.is_active : !rule.is_active);
      return matchesSearch && matchesTrigger && matchesStatus;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'dms') return (b.dm_count ?? 0) - (a.dm_count ?? 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [rules, search, triggerFilter, statusFilter, sortBy]);

  const ensureConnected = () => {
    if (!igStatus?.connected) {
      setConnectHint('Connect Instagram first to create automation rules.');
      navigate('/connect');
      return false;
    }
    setConnectHint('');
    return true;
  };

  const openBuilder = () => {
    if (!ensureConnected()) return;
    setEditingRule(null);
    setSeed(null);
    setShowModal(true);
  };

  const openTemplate = (templateSeed: RuleSeed) => {
    if (!ensureConnected()) return;
    if (planLimit && rules.length >= planLimit) {
      setConnectHint(`Plan limit reached (${planLimit} rules). Upgrade to add more.`);
      return;
    }
    setEditingRule(null);
    setSeed(templateSeed);
    setShowModal(true);
  };

  const openEditor = (rule: Rule) => {
    setSeed(null);
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleToggle = async (rule: Rule) => {
    setTogglingId(rule.id);
    try {
      const updated = await toggleRule(rule.id);
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, is_active: updated.is_active } : r)));
    } catch {
      /* silent */
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (ruleId: string) => {
    setDeletingId(ruleId);
    try {
      await deleteRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      setConfirmDeleteId(null);
    } catch {
      /* silent */
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = (rule: Rule) => {
    if (!ensureConnected()) return;
    if (planLimit && rules.length >= planLimit) {
      setConnectHint(`Plan limit reached (${planLimit} rules). Upgrade to duplicate.`);
      return;
    }
    setEditingRule(null);
    setSeed({
      name: `${rule.name} (copy)`,
      trigger_type: rule.trigger_type,
      keywords: [...rule.keywords],
      response_template: rule.response_template,
      comment_target_type: rule.comment_target_type,
      comment_media_filter: rule.comment_media_filter,
      comment_media_id: rule.comment_media_id,
      any_comment_keyword: rule.any_comment_keyword,
      public_comment_reply_enabled: rule.public_comment_reply_enabled,
      public_comment_reply_template: rule.public_comment_reply_template,
      ask_follow_before_dm: rule.ask_follow_before_dm,
      dm_attachment_url: rule.dm_attachment_url,
    });
    setShowModal(true);
  };

  const triggerIcon = (trigger: Rule['trigger_type']) => {
    if (trigger === 'comment') return <MessageSquare size={18} />;
    if (trigger === 'story_mention') return <Camera size={18} />;
    if (trigger === 'new_dm') return <Inbox size={18} />;
    return <Zap size={18} />;
  };

  return (
    <div className="page-wrapper rules-studio-page">
      <section className="pg-surface-hero rules-studio-hero">
        <div className="rules-studio-hero-copy">
          <p className="pg-surface-kicker"><Sparkles size={12} /> Automation Studio</p>
          <h1 className="pg-surface-title">Design flows that convert every DM</h1>
          <p className="pg-surface-subtitle">
            Build trigger → condition → reply automations with live templates, health stats, and mobile-first controls.
          </p>
          <div className="rules-studio-hero-actions">
            <button type="button" onClick={openBuilder} className="rules-studio-primary-btn">
              <Plus size={15} /> New rule
            </button>
            <Link to="/connect" className="rules-studio-ghost-btn">
              {igStatus?.connected ? 'Instagram connected' : 'Connect Instagram'}
            </Link>
          </div>
        </div>

        <div className="rules-studio-capacity">
          <div className="rules-studio-capacity-ring" style={{ ['--pct' as string]: `${planLimit ? usagePct : 100}` }}>
            <div className="rules-studio-capacity-inner">
              <strong>{rules.length}</strong>
              <span>{planLimit ? `/ ${planLimit}` : 'unlimited'}</span>
            </div>
          </div>
          <div>
            <p className="rules-studio-capacity-label">Plan capacity</p>
            <p className="rules-studio-capacity-plan">{plan} plan</p>
            <p className="rules-studio-capacity-meta">{activeCount} live · {pausedCount} paused</p>
          </div>
        </div>
      </section>

      <section className="rules-studio-stats">
        <article>
          <span><Play size={14} /> Active</span>
          <strong>{activeCount}</strong>
        </article>
        <article>
          <span><PauseCircle size={14} /> Paused</span>
          <strong>{pausedCount}</strong>
        </article>
        <article>
          <span><Activity size={14} /> DMs sent</span>
          <strong>{totalDms}</strong>
        </article>
        <article>
          <span><Gauge size={14} /> Usage</span>
          <strong>{planLimit ? `${usagePct}%` : '∞'}</strong>
        </article>
      </section>

      {connectHint && (
        <div className="rules-studio-alert">
          <Camera size={15} />
          <span>{connectHint}</span>
          <button type="button" onClick={() => setConnectHint('')} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      <section className="rules-studio-templates">
        <div className="rules-studio-section-head">
          <h2>Quick start templates</h2>
          <p>One tap to prefill a proven flow — edit and launch.</p>
        </div>
        <div className="rules-studio-template-grid">
          {TEMPLATES.map((tpl) => (
            <button key={tpl.id} type="button" className="rules-studio-template" onClick={() => openTemplate(tpl.seed)}>
              <span className="rules-studio-template-icon">{tpl.icon}</span>
              <span className="rules-studio-template-copy">
                <strong>{tpl.title}</strong>
                <small>{tpl.blurb}</small>
              </span>
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      </section>

      <section className="rules-studio-toolbar">
        <div className="rules-studio-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, keyword, or reply..."
            aria-label="Search rules"
          />
        </div>

        <div className="rules-studio-chips" role="tablist" aria-label="Trigger filter">
          {([
            ['all', 'All'],
            ['keyword', 'Keyword'],
            ['comment', 'Comment'],
            ['story_mention', 'Story'],
            ['new_dm', 'New DM'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={triggerFilter === value ? 'active' : ''}
              onClick={() => setTriggerFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rules-studio-toolbar-end">
          <div className="rules-studio-segment">
            <button type="button" className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>All</button>
            <button type="button" className={statusFilter === 'active' ? 'active' : ''} onClick={() => setStatusFilter('active')}>Live</button>
            <button type="button" className={statusFilter === 'paused' ? 'active' : ''} onClick={() => setStatusFilter('paused')}>Paused</button>
          </div>
          <select
            className="rules-studio-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort rules"
          >
            <option value="newest">Newest</option>
            <option value="dms">Most DMs</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </section>

      <section className="rules-studio-list">
        {loading ? (
          <div className="rules-studio-empty">Loading your automation studio...</div>
        ) : filteredRules.length === 0 ? (
          <div className="rules-studio-empty-card">
            <div className="rules-studio-empty-mark"><Zap size={22} /></div>
            <h3>{rules.length === 0 ? 'No rules yet' : 'No matches'}</h3>
            <p>
              {rules.length === 0
                ? 'Start with a template or build a custom trigger → reply flow in under a minute.'
                : 'Try another search or clear filters to see more rules.'}
            </p>
            <button type="button" onClick={openBuilder} className="rules-studio-primary-btn">
              <Plus size={15} /> Create first rule
            </button>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <article key={rule.id} className={`rules-studio-card ${rule.is_active ? 'is-live' : 'is-paused'}`}>
              <div className="rules-studio-card-top">
                <div className="rules-studio-card-icon">{triggerIcon(rule.trigger_type)}</div>
                <div className="rules-studio-card-title">
                  <h3>{rule.name}</h3>
                  <p>{TRIGGER_LABELS[rule.trigger_type]} · {rule.dm_count ?? 0} DMs sent</p>
                </div>
                <span className={`rules-studio-status ${rule.is_active ? 'live' : 'paused'}`}>
                  {rule.is_active ? 'Live' : 'Paused'}
                </span>
              </div>

              <div className="rules-studio-flow" aria-label="Rule flow">
                <div className="rules-studio-flow-step">
                  <small>Trigger</small>
                  <strong>{TRIGGER_LABELS[rule.trigger_type]}</strong>
                </div>
                <span className="rules-studio-flow-arrow"><ArrowRight size={14} /></span>
                <div className="rules-studio-flow-step">
                  <small>Condition</small>
                  <strong>
                    {rule.keywords.length
                      ? rule.keywords.slice(0, 2).map((k) => `"${k}"`).join(', ') + (rule.keywords.length > 2 ? ` +${rule.keywords.length - 2}` : '')
                      : 'Any message'}
                  </strong>
                </div>
                <span className="rules-studio-flow-arrow"><ArrowRight size={14} /></span>
                <div className="rules-studio-flow-step wide">
                  <small>Reply</small>
                  <strong>{rule.response_template || 'No template yet'}</strong>
                </div>
              </div>

              <div className="rules-studio-card-tags">
                {rule.ask_follow_before_dm && <span>Ask-to-follow</span>}
                {rule.public_comment_reply_enabled && <span>Public reply</span>}
                {rule.dm_attachment_url && <span>Attachment</span>}
                {rule.comment_target_type === 'specific' && <span>Specific media</span>}
              </div>

              <div className="rules-studio-card-actions">
                <button type="button" onClick={() => openEditor(rule)}>
                  <PencilLine size={14} /> Edit
                </button>
                <button type="button" onClick={() => handleDuplicate(rule)}>
                  <Copy size={14} /> Duplicate
                </button>
                <button
                  type="button"
                  className={rule.is_active ? 'danger-soft' : 'success-soft'}
                  disabled={togglingId === rule.id}
                  onClick={() => handleToggle(rule)}
                >
                  {rule.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {rule.is_active ? 'Pause' : 'Activate'}
                </button>
                {confirmDeleteId === rule.id ? (
                  <div className="rules-studio-delete-confirm">
                    <button
                      type="button"
                      className="danger"
                      disabled={deletingId === rule.id}
                      onClick={() => handleDelete(rule.id)}
                    >
                      {deletingId === rule.id ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </div>
                ) : (
                  <button type="button" className="danger-ghost" onClick={() => setConfirmDeleteId(rule.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>

      {plan !== 'pro' && (
        <section className="rules-studio-upgrade">
          <div>
            <h3>
              {planLimit
                ? `You've used ${rules.length} of ${planLimit} rules`
                : 'Need more automation power?'}
            </h3>
            <p>Upgrade for more flows, premium analytics, and ask-to-follow gates.</p>
          </div>
          <Link to="/billing" className="rules-studio-upgrade-btn">Upgrade plan</Link>
        </section>
      )}

      <button type="button" className="rules-studio-fab" onClick={openBuilder} aria-label="Create new rule">
        <Plus size={22} />
      </button>

      <RuleBuilderModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRule(null);
          setSeed(null);
        }}
        onCreated={(rule) => setRules((prev) => [rule, ...prev])}
        onUpdated={(updatedRule) => setRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)))}
        initialRule={editingRule}
        seed={seed}
      />
    </div>
  );
};

export default RulesPage;
