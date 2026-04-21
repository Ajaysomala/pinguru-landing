import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AlertCircle, ArrowLeft, Check, Plus, X, Link2, Upload,
  RefreshCw, Lock, Unlock, Smartphone, Zap, MessageSquare,
  User, Clock, ArrowRight,
} from 'lucide-react';
import { createRule, getInstagramMedia, getInstagramStatus } from '../../lib/api';
import type { InstagramMediaItem, Rule, RuleCreatePayload, TriggerType } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../App';

interface RuleBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (rule: Rule) => void;
}

const TRIGGER_OPTIONS: { value: TriggerType; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'keyword',       label: 'Keyword Match',    desc: 'Trigger when a DM contains specific keywords', icon: <MessageSquare size={16}/> },
  { value: 'story_mention', label: 'Story Mention',    desc: 'Trigger when someone mentions you in a story', icon: <Zap size={16}/> },
  { value: 'comment',       label: 'Comment Reply',    desc: 'Trigger when someone comments on your post',   icon: <MessageSquare size={16}/> },
  { value: 'new_dm',        label: 'New DM Received',  desc: 'Trigger on every new incoming DM',             icon: <MessageSquare size={16}/> },
];

const COMMENT_TARGET_OPTIONS = [
  { value: 'specific', label: 'Specific Post', desc: 'Select from existing posts and reels' },
  { value: 'any',      label: 'Any Post',      desc: 'Works on all posts and reels' },
] as const;

const COMMENT_MEDIA_FILTERS = [
  { value: 'all',  label: 'All' },
  { value: 'post', label: 'Posts' },
  { value: 'reel', label: 'Reels' },
] as const;

const COMMENT_MEDIA_PREVIEW: InstagramMediaItem[] = [
  { id: 'preview-1', media_type: 'post', caption: 'Post' },
  { id: 'preview-2', media_type: 'reel', caption: 'Reel' },
  { id: 'preview-3', media_type: 'post', caption: 'Post' },
  { id: 'preview-4', media_type: 'reel', caption: 'Reel' },
];

const TEMPLATE_VARS = ['{name}', '{username}', '{keyword}'];

// Sample values for live phone preview
const PREVIEW_VALUES: Record<string, string> = {
  '{name}': 'Rahul',
  '{username}': 'rahul_dev',
  '{keyword}': 'price',
};

function renderTemplate(template: string): string {
  let result = template;
  Object.entries(PREVIEW_VALUES).forEach(([key, val]) => {
    result = result.split(key).join(val);
  });
  return result;
}

function getErrorText(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string') return err;
  try { return JSON.stringify(err); } catch { return 'Failed to create rule'; }
}

// ── Phone Preview ──────────────────────────────────────────────────────────
const PhonePreview: React.FC<{
  triggerType: TriggerType | null;
  template: string;
  keywords: string[];
  ruleName: string;
}> = ({ triggerType, template, keywords, ruleName }) => {
  const preview = renderTemplate(template);
  const inboundMsg = triggerType === 'keyword'
    ? (keywords[0] ? `Hey! ${keywords[0]}` : 'Hey! price')
    : triggerType === 'comment'
    ? 'Commented on your post'
    : triggerType === 'story_mention'
    ? 'Mentioned you in their story'
    : 'Sent you a message';

  return (
    <div style={{
      position: 'sticky',
      top: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}>
      {/* Preview label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 14px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(219,39,119,0.05))',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
        color: 'var(--color-primary)', letterSpacing: '0.04em',
      }}>
        <Smartphone size={12} /> LIVE PREVIEW
      </div>

      {/* Phone frame */}
      <div style={{
        width: 260,
        background: '#1A1A2E',
        borderRadius: 36,
        padding: '16px 12px',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,0.5), 0 0 50px rgba(124,58,237,0.15)',
        position: 'relative',
      }}>
        {/* Phone notch */}
        <div style={{
          width: 64, height: 6,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 3, margin: '0 auto 10px',
        }} />

        {/* Screen */}
        <div style={{ background: '#F0F2F5', borderRadius: 22, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            background: 'white', padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            borderBottom: '1px solid #e4e6ea',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
              flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1c1e21' }}>@yourbrand</div>
              <div style={{ fontSize: '0.6rem', color: '#10B981', fontWeight: 600 }}>● PinGuru Automated</div>
            </div>
          </div>

          {/* Chat */}
          <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 280 }}>
            {/* Inbound message */}
            <div style={{
              background: 'white', borderRadius: '14px 14px 14px 4px',
              padding: '9px 12px', fontSize: '0.7rem', color: '#1c1e21',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '80%', lineHeight: 1.5,
            }}>
              {inboundMsg}
              <div style={{ fontSize: '0.55rem', color: '#65676B', marginTop: 3 }}>
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Trigger indicator */}
            {triggerType && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: 8, padding: '4px 8px',
                fontSize: '0.6rem', fontWeight: 600, color: '#7C3AED',
                alignSelf: 'center', maxWidth: '90%', textAlign: 'center',
              }}>
                <Zap size={9} />
                Rule triggered: {TRIGGER_OPTIONS.find(t => t.value === triggerType)?.label}
              </div>
            )}

            {/* Outbound auto-reply */}
            {template ? (
              <div style={{
                background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
                borderRadius: '14px 14px 4px 14px',
                padding: '9px 12px', fontSize: '0.7rem', color: 'white',
                maxWidth: '88%', marginLeft: 'auto', lineHeight: 1.5,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
              }}>
                {preview}
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)', marginTop: 3, textAlign: 'right' }}>
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ✓✓
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(0,0,0,0.05)',
                borderRadius: '14px 14px 4px 14px',
                padding: '9px 12px', fontSize: '0.68rem', color: '#94A3B8',
                maxWidth: '88%', marginLeft: 'auto', lineHeight: 1.5,
                fontStyle: 'italic', border: '1.5px dashed #CBD5E1',
              }}>
                Your reply will appear here as you type...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variable legend */}
      <div style={{
        width: 260, background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: 14, padding: '14px 16px',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Variables preview as
        </div>
        {Object.entries(PREVIEW_VALUES).map(([key, val]) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 6, fontSize: '0.75rem',
          }}>
            <code style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(219,39,119,0.05))',
              color: 'var(--color-primary)', padding: '2px 7px',
              borderRadius: 6, fontFamily: 'var(--font-mono)', fontWeight: 600,
            }}>{key}</code>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>→ "{val}"</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Modal ─────────────────────────────────────────────────────────────
export const RuleBuilderModal: React.FC<RuleBuilderModalProps> = ({ open, onClose, onCreated }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'choose' | 'details'>('choose');
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType | null>(null);
  const [commentTarget, setCommentTarget] = useState<(typeof COMMENT_TARGET_OPTIONS)[number]['value']>('specific');
  const [commentFilter, setCommentFilter] = useState<(typeof COMMENT_MEDIA_FILTERS)[number]['value']>('all');
  const [selectedMediaId, setSelectedMediaId] = useState<string>('');
  const [mediaItems, setMediaItems] = useState<InstagramMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaLimit, setMediaLimit] = useState(24);
  const [mediaSource, setMediaSource] = useState<'instagram' | 'fallback'>('fallback');
  const [anyCommentKeyword, setAnyCommentKeyword] = useState(true);
  const [openingMessage, setOpeningMessage] = useState(false);
  const [publicCommentReplyEnabled, setPublicCommentReplyEnabled] = useState(false);
  const [publicCommentReplyTemplate, setPublicCommentReplyTemplate] = useState('Thanks for your comment! Check your DM for details.');
  const [askFollowBeforeDm, setAskFollowBeforeDm] = useState(false);
  const [sendFollowUpMessage, setSendFollowUpMessage] = useState(false);
  const [dmAttachmentUrl, setDmAttachmentUrl] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = user?.plan ?? 'free';
  const isStarterOrPro = plan === 'starter' || plan === 'pro';
  const isPro = plan === 'pro';

  const kwInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (open) { setStep('choose'); } }, [open]);

  useEffect(() => {
    if (!isStarterOrPro && askFollowBeforeDm)   setAskFollowBeforeDm(false);
    if (!isPro && publicCommentReplyEnabled)     setPublicCommentReplyEnabled(false);
    if (!isPro && sendFollowUpMessage)           setSendFollowUpMessage(false);
    if (!isPro && dmAttachmentUrl)               setDmAttachmentUrl('');
    if (!isPro && showAttachmentInput)           setShowAttachmentInput(false);
  }, [askFollowBeforeDm, dmAttachmentUrl, isPro, isStarterOrPro, publicCommentReplyEnabled, sendFollowUpMessage, showAttachmentInput]);

  const reset = () => {
    setStep('choose'); setName(''); setTriggerType(null);
    setCommentTarget('specific'); setCommentFilter('all');
    setSelectedMediaId(''); setMediaItems([]); setMediaLimit(24); setMediaSource('fallback');
    setAnyCommentKeyword(true); setOpeningMessage(false);
    setPublicCommentReplyEnabled(false);
    setPublicCommentReplyTemplate('Thanks for your comment! Check your DM for details.');
    setAskFollowBeforeDm(false); setSendFollowUpMessage(false);
    setDmAttachmentUrl(''); setShowAttachmentInput(false);
    setKeywords([]); setKwInput(''); setTemplate(''); setError('');
  };

  useEffect(() => {
    const shouldLoad = open && step === 'details' && triggerType === 'comment' && commentTarget === 'specific';
    if (!shouldLoad) return;
    let alive = true;
    const loadMedia = async () => {
      setMediaLoading(true);
      try {
        const items = await getInstagramMedia(commentFilter, mediaLimit);
        if (!alive) return;
        setMediaItems(items);
        setMediaSource(items.length > 0 ? 'instagram' : 'fallback');
        if (!selectedMediaId && items.length > 0) setSelectedMediaId(items[0].id);
      } catch {
        if (!alive) return;
        setMediaItems([]);
      } finally {
        if (alive) setMediaLoading(false);
      }
    };
    loadMedia();
    return () => { alive = false; };
  }, [open, step, triggerType, commentTarget, commentFilter, mediaLimit, selectedMediaId]);

  const addKeyword = useCallback(() => {
    const kw = kwInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) setKeywords(prev => [...prev, kw]);
    setKwInput('');
  }, [kwInput, keywords]);

  const removeKeyword = (kw: string) => setKeywords(prev => prev.filter(k => k !== kw));

  const handleKwKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addKeyword(); }
    if (e.key === 'Backspace' && !kwInput && keywords.length > 0) {
      setKeywords(prev => prev.slice(0, -1));
    }
  };

  const insertVar = (v: string) => {
    if (!textareaRef.current) return;
    const { selectionStart: s, selectionEnd: e } = textareaRef.current;
    const newVal = template.substring(0, s) + v + template.substring(e);
    setTemplate(newVal);
    requestAnimationFrame(() => {
      textareaRef.current?.setSelectionRange(s + v.length, s + v.length);
      textareaRef.current?.focus();
    });
  };

  const addLinkToMessage = () => {
    const url = prompt('Paste a link URL:');
    if (url) setTemplate(prev => prev + (prev ? ' ' : '') + url);
  };

  const lockBadge = (unlocked: boolean, tier: string) => {
    if (unlocked) return null;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '2px 7px', borderRadius: 999,
        background: '#F1F5F9', color: '#64748B',
        fontSize: '0.65rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        <Lock size={9} /> {tier}
      </span>
    );
  };

  const canSubmit = (): boolean => {
    if (!triggerType || !template.trim()) return false;
    if (triggerType === 'keyword' && keywords.length === 0) return false;
    if (triggerType === 'comment' && commentTarget === 'specific' && !selectedMediaId) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!triggerType || !canSubmit()) return;
    setLoading(true); setError('');
    const payload: RuleCreatePayload = {
      name: name.trim() || `${TRIGGER_OPTIONS.find(t => t.value === triggerType)?.label} Rule`,
      trigger_type: triggerType,
      keywords: triggerType === 'keyword' || (triggerType === 'comment' && !anyCommentKeyword) ? keywords : [],
      response_template: template.trim(),
      ...(triggerType === 'comment' && {
        comment_target_type: commentTarget,
        comment_media_id: commentTarget === 'specific' ? selectedMediaId : undefined,
        any_comment_keyword: anyCommentKeyword,
        public_comment_reply_enabled: publicCommentReplyEnabled,
        public_comment_reply_template: publicCommentReplyEnabled ? publicCommentReplyTemplate : undefined,
      }),
      ask_follow_before_dm: askFollowBeforeDm,
      send_follow_up_message: sendFollowUpMessage,
      dm_attachment_url: dmAttachmentUrl.trim() || undefined,
    };
    try {
      const rule = await createRule(payload);
      onCreated(rule);
      onClose();
      reset();
    } catch (err) {
      setError(getErrorText(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title={step === 'choose' ? 'Create Automation Rule' : 'Configure Rule'}
      maxWidth={step === 'details' ? 'max-w-5xl' : 'max-w-2xl'}
    >
      {/* ── STEP 1: Choose Trigger ────────────────────────────── */}
      {step === 'choose' && (
        <div style={{ padding: '8px 0 4px' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 20 }}>
            Choose what event should trigger your automated DM:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TRIGGER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setTriggerType(opt.value); setStep('details'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px',
                  background: triggerType === opt.value
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(219,39,119,0.04))'
                    : 'white',
                  border: `1.5px solid ${triggerType === opt.value ? 'rgba(124,58,237,0.35)' : 'var(--color-border)'}`,
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 180ms', width: '100%',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.35)';
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(219,39,119,0.03))';
                }}
                onMouseLeave={e => {
                  if (triggerType !== opt.value) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                    (e.currentTarget as HTMLElement).style.background = 'white';
                  }
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)', flexShrink: 0,
                }}>
                  {opt.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)', marginBottom: 3 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                    {opt.desc}
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Configure + Phone Preview ────────────────── */}
      {step === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }}>
          {/* Left: Form */}
          <div>
            {/* Back button */}
            <button
              type="button"
              onClick={() => setStep('choose')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--color-muted)', background: 'none',
                border: 'none', cursor: 'pointer', padding: '0 0 20px 0',
                transition: 'color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'}
            >
              <ArrowLeft size={15} />
              Change trigger type
            </button>

            {/* Current trigger badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(219,39,119,0.05))',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 999, fontSize: '0.8rem', fontWeight: 700,
              color: 'var(--color-primary)', marginBottom: 24,
            }}>
              <Zap size={13} />
              {TRIGGER_OPTIONS.find(t => t.value === triggerType)?.label}
            </div>

            {/* Rule name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
                Rule Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Reply to pricing inquiries"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* Keywords (keyword trigger) */}
            {triggerType === 'keyword' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>
                  Keywords
                  <span style={{ fontWeight: 400, color: 'var(--color-muted)', marginLeft: 8, fontSize: '0.75rem' }}>
                    Press Enter or comma to add
                  </span>
                </label>
                <div className="keywords-container" onClick={() => kwInputRef.current?.focus()}>
                  {keywords.map(kw => (
                    <span key={kw} className="keyword-tag">
                      {kw}
                      <button type="button" className="keyword-tag-remove" onClick={() => removeKeyword(kw)}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={kwInputRef}
                    type="text"
                    className="keywords-input"
                    placeholder={keywords.length === 0 ? 'price, buy, order...' : ''}
                    value={kwInput}
                    onChange={e => setKwInput(e.target.value)}
                    onKeyDown={handleKwKeyDown}
                  />
                </div>
              </div>
            )}

            {/* Comment-specific config */}
            {triggerType === 'comment' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {COMMENT_TARGET_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCommentTarget(opt.value)}
                      className={`wizard-option ${commentTarget === opt.value ? 'active' : ''}`}
                    >
                      <span className="wizard-option-radio"><span /></span>
                      <div>
                        <p className="wizard-option-title">{opt.label}</p>
                        <p className="wizard-option-desc">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {commentTarget === 'specific' && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="wizard-filter-row" style={{ marginBottom: 12 }}>
                      {COMMENT_MEDIA_FILTERS.map(f => (
                        <button key={f.value} type="button"
                          className={`wizard-filter-pill ${commentFilter === f.value ? 'active' : ''}`}
                          onClick={() => setCommentFilter(f.value)}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    {mediaLoading ? (
                      <div className="wizard-media-loading"><RefreshCw size={14} className="animate-spin" /> Loading...</div>
                    ) : (
                      <div className="wizard-media-grid">
                        {(mediaItems.length > 0 ? mediaItems : COMMENT_MEDIA_PREVIEW)
                          .filter(item => commentFilter === 'all' || item.media_type === commentFilter)
                          .map(item => (
                            <button key={item.id} type="button"
                              onClick={() => setSelectedMediaId(item.id)}
                              className={`wizard-media-card ${selectedMediaId === item.id ? 'active' : ''}`}>
                              <span className={`wizard-media-thumb ${item.media_type}`}>
                                {item.media_type === 'post' ? '▣' : '▶'}
                              </span>
                              <span className="wizard-media-label">{item.media_type}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="wizard-toggle-row compact">
                  <span>Any keyword</span>
                  <button type="button" onClick={() => setAnyCommentKeyword(p => !p)}
                    className={`wizard-switch ${anyCommentKeyword ? 'on' : ''}`}>
                    <span />
                  </button>
                </div>
                {!anyCommentKeyword && (
                  <div className="keywords-container" style={{ marginTop: 10 }} onClick={() => kwInputRef.current?.focus()}>
                    {keywords.map(kw => (
                      <span key={kw} className="keyword-tag">
                        {kw}
                        <button type="button" className="keyword-tag-remove" onClick={() => removeKeyword(kw)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <input ref={kwInputRef} type="text" className="keywords-input"
                      placeholder={keywords.length === 0 ? 'Type keyword and press Enter' : ''}
                      value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={handleKwKeyDown} />
                  </div>
                )}
              </div>
            )}

            {/* Template */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
                Response Template
              </label>

              {/* Variable chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Insert:</span>
                {TEMPLATE_VARS.map(v => (
                  <button key={v} type="button"
                    onClick={() => insertVar(v)}
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px', borderRadius: 6,
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(219,39,119,0.05))',
                      border: '1px solid rgba(124,58,237,0.2)',
                      color: 'var(--color-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(219,39,119,0.05))'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'; }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                className="template-textarea"
                placeholder={`Hi {name}! Thanks for reaching out. Here's what you need to know...`}
                value={template}
                onChange={e => setTemplate(e.target.value)}
                rows={5}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textAlign: 'right', marginTop: 4 }}>
                {template.length} / 1000
              </p>
            </div>

            {/* Advanced toggles (comment) */}
            {triggerType === 'comment' && (
              <div style={{ marginBottom: 16 }}>
                <div className="wizard-toggle-row compact">
                  <span className="wizard-toggle-label">Publicly reply to comments {lockBadge(isPro, 'pro')}</span>
                  <button type="button" onClick={() => isPro && setPublicCommentReplyEnabled(p => !p)}
                    className={`wizard-switch ${publicCommentReplyEnabled ? 'on' : ''}`} disabled={!isPro}>
                    <span />
                  </button>
                </div>
                {publicCommentReplyEnabled && (
                  <textarea className="template-textarea" rows={2}
                    value={publicCommentReplyTemplate}
                    onChange={e => setPublicCommentReplyTemplate(e.target.value)}
                    placeholder="Thanks for your comment! Check your DM." />
                )}
              </div>
            )}

            {/* Common advanced toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div className="wizard-toggle-row compact">
                <span className="wizard-toggle-label">Ask to follow before DM {lockBadge(isStarterOrPro, 'starter')}</span>
                <button type="button" onClick={() => isStarterOrPro && setAskFollowBeforeDm(p => !p)}
                  className={`wizard-switch ${askFollowBeforeDm ? 'on' : ''}`} disabled={!isStarterOrPro}>
                  <span />
                </button>
              </div>
              <div className="wizard-toggle-row compact">
                <span className="wizard-toggle-label">Send follow-up message {lockBadge(isPro, 'pro')}</span>
                <button type="button" onClick={() => isPro && setSendFollowUpMessage(p => !p)}
                  className={`wizard-switch ${sendFollowUpMessage ? 'on' : ''}`} disabled={!isPro}>
                  <span />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 16px',
                background: 'var(--color-danger-light)',
                border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: 12, marginBottom: 16,
              }}>
                <AlertCircle size={15} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: '0.875rem', color: '#9F1239' }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canSubmit()}
              style={{
                width: '100%', padding: '13px',
                background: canSubmit() ? 'linear-gradient(135deg, #7C3AED, #DB2777)' : '#E2E8F0',
                color: canSubmit() ? 'white' : '#94A3B8',
                border: 'none', borderRadius: 12,
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: '0.9375rem',
                cursor: canSubmit() ? 'pointer' : 'not-allowed',
                transition: 'all 200ms',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: canSubmit() ? '0 8px 24px rgba(124,58,237,0.3)' : 'none',
              }}
            >
              {loading ? (
                <><RefreshCw size={16} className="animate-spin" /> Creating rule...</>
              ) : (
                <><Check size={16} /> Create Rule</>
              )}
            </button>
          </div>

          {/* Right: Phone Preview */}
          <div style={{ paddingTop: 4 }}>
            <PhonePreview
              triggerType={triggerType}
              template={template}
              keywords={keywords}
              ruleName={name}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};
