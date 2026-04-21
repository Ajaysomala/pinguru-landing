import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AlertCircle, ArrowLeft, Check, X, RefreshCw, Lock,
  Smartphone, Zap, MessageSquare, ArrowRight, Eye, EyeOff,
} from 'lucide-react';
import { createRule, getInstagramMedia } from '../../lib/api';
import type { InstagramMediaItem, Rule, RuleCreatePayload, TriggerType } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../App';

interface RuleBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (rule: Rule) => void;
}

const TRIGGER_OPTIONS: { value: TriggerType; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'keyword',       label: 'Keyword Match',   desc: 'Trigger when a DM contains specific keywords', icon: <MessageSquare size={16}/> },
  { value: 'story_mention', label: 'Story Mention',   desc: 'Trigger when someone mentions you in a story', icon: <Zap size={16}/> },
  { value: 'comment',       label: 'Comment Reply',   desc: 'Trigger when someone comments on your post',   icon: <MessageSquare size={16}/> },
  { value: 'new_dm',        label: 'New DM Received', desc: 'Trigger on every new incoming DM',             icon: <MessageSquare size={16}/> },
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

const TEMPLATE_VARS = ['{{name}}', '{{username}}', '{{keyword}}'];

const PREVIEW_VALUES: Record<string, string> = {
  '{{name}}': 'Rahul',
  '{{username}}': 'rahul_dev',
  '{{keyword}}': 'price',
};

function normalizeTemplateVariables(input: string): string {
  const sentinels: Record<string, string> = {
    '{{name}}': '__PG_NAME__',
    '{{username}}': '__PG_USERNAME__',
    '{{keyword}}': '__PG_KEYWORD__',
  };
  let normalized = input;
  Object.entries(sentinels).forEach(([token, sentinel]) => {
    normalized = normalized.split(token).join(sentinel);
  });
  normalized = normalized
    .split('{name}').join('{{name}}')
    .split('{username}').join('{{username}}')
    .split('{keyword}').join('{{keyword}}');
  Object.entries(sentinels).forEach(([token, sentinel]) => {
    normalized = normalized.split(sentinel).join(token);
  });
  return normalized;
}

function renderTemplate(template: string): string {
  let result = normalizeTemplateVariables(template);
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

// ── Phone Preview ────────────────────────────────────────────────
const PhonePreview: React.FC<{
  triggerType: TriggerType | null;
  template: string;
  keywords: string[];
}> = ({ triggerType, template, keywords }) => {
  const preview = renderTemplate(template);
  const inboundMsg = triggerType === 'keyword'
    ? (keywords[0] ? `Hey! ${keywords[0]}` : 'Hey! price')
    : triggerType === 'comment' ? 'Commented on your post'
    : triggerType === 'story_mention' ? 'Mentioned you in their story'
    : 'Sent you a message';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ display:'flex',alignItems:'center',gap:6,padding:'5px 12px',background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(219,39,119,0.05))',border:'1px solid rgba(124,58,237,0.2)',borderRadius:999,fontSize:'0.7rem',fontWeight:700,color:'var(--color-primary)',letterSpacing:'0.05em' }}>
        <Smartphone size={11}/> LIVE PREVIEW
      </div>
      <div style={{ width:240,background:'#1A1A2E',borderRadius:32,padding:'14px 10px',boxShadow:'0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px rgba(0,0,0,0.45), 0 0 40px rgba(124,58,237,0.15)' }}>
        <div style={{ width:56,height:5,background:'rgba(255,255,255,0.12)',borderRadius:3,margin:'0 auto 10px' }}/>
        <div style={{ background:'#F0F2F5',borderRadius:20,overflow:'hidden' }}>
          <div style={{ background:'white',padding:'9px 12px',display:'flex',alignItems:'center',gap:8,borderBottom:'1px solid #e4e6ea' }}>
            <div style={{ width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#DB2777)',flexShrink:0 }}/>
            <div>
              <div style={{ fontSize:'0.68rem',fontWeight:700,color:'#1c1e21' }}>@yourbrand</div>
              <div style={{ fontSize:'0.58rem',color:'#10B981',fontWeight:600 }}>● PinGuru Automated</div>
            </div>
          </div>
          <div style={{ padding:'12px 10px',display:'flex',flexDirection:'column',gap:8,minHeight:220 }}>
            <div style={{ background:'white',borderRadius:'12px 12px 12px 3px',padding:'8px 10px',fontSize:'0.68rem',color:'#1c1e21',boxShadow:'0 1px 3px rgba(0,0,0,0.08)',maxWidth:'80%',lineHeight:1.4 }}>
              {inboundMsg}
              <div style={{ fontSize:'0.55rem',color:'#65676B',marginTop:2 }}>{new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            {triggerType && (
              <div style={{ display:'flex',alignItems:'center',gap:4,background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.15)',borderRadius:7,padding:'3px 8px',fontSize:'0.6rem',fontWeight:600,color:'#7C3AED',alignSelf:'center' }}>
                <Zap size={8}/> Rule triggered: {TRIGGER_OPTIONS.find(t=>t.value===triggerType)?.label}
              </div>
            )}
            {template ? (
              <div style={{ background:'linear-gradient(135deg,#7C3AED,#DB2777)',borderRadius:'12px 12px 3px 12px',padding:'8px 10px',fontSize:'0.68rem',color:'white',maxWidth:'88%',marginLeft:'auto',lineHeight:1.4,whiteSpace:'pre-wrap',wordBreak:'break-word' }}>
                {preview}
                <div style={{ fontSize:'0.55rem',color:'rgba(255,255,255,0.6)',marginTop:2,textAlign:'right' }}>{new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})} ✓✓</div>
              </div>
            ) : (
              <div style={{ background:'rgba(0,0,0,0.04)',borderRadius:'12px 12px 3px 12px',padding:'8px 10px',fontSize:'0.67rem',color:'#94A3B8',maxWidth:'88%',marginLeft:'auto',lineHeight:1.4,fontStyle:'italic',border:'1.5px dashed #CBD5E1' }}>
                Your reply will appear here as you type...
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ width:240,background:'white',border:'1px solid var(--color-border)',borderRadius:12,padding:'12px 14px' }}>
        <div style={{ fontSize:'0.65rem',fontWeight:700,color:'var(--color-muted)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em' }}>Variables preview as</div>
        {Object.entries(PREVIEW_VALUES).map(([key,val])=>(
          <div key={key} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5,fontSize:'0.72rem' }}>
            <code style={{ background:'rgba(124,58,237,0.08)',color:'var(--color-primary)',padding:'2px 6px',borderRadius:5,fontFamily:'var(--font-mono)',fontWeight:600,fontSize:'0.7rem' }}>{key}</code>
            <span style={{ color:'var(--color-text-secondary)',fontWeight:500 }}>→ "{val}"</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────
export const RuleBuilderModal: React.FC<RuleBuilderModalProps> = ({ open, onClose, onCreated }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'choose'|'details'>('choose');
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType|null>(null);
  const [commentTarget, setCommentTarget] = useState<(typeof COMMENT_TARGET_OPTIONS)[number]['value']>('specific');
  const [commentFilter, setCommentFilter] = useState<(typeof COMMENT_MEDIA_FILTERS)[number]['value']>('all');
  const [selectedMediaId, setSelectedMediaId] = useState<string>('');
  const [mediaItems, setMediaItems] = useState<InstagramMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaLimit, setMediaLimit] = useState(24);
  const [anyCommentKeyword, setAnyCommentKeyword] = useState(true);
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
  const [showPreview, setShowPreview] = useState(false);

  const plan = user?.plan ?? 'free';
  const isStarterOrPro = plan==='starter'||plan==='pro';
  const isPro = plan==='pro';
  const kwInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{ if(open){ setStep('choose'); setShowPreview(false); } },[open]);
  useEffect(()=>{
    if(!isStarterOrPro&&askFollowBeforeDm) setAskFollowBeforeDm(false);
    if(!isPro&&publicCommentReplyEnabled) setPublicCommentReplyEnabled(false);
    if(!isPro&&sendFollowUpMessage) setSendFollowUpMessage(false);
    if(!isPro&&dmAttachmentUrl) setDmAttachmentUrl('');
    if(!isPro&&showAttachmentInput) setShowAttachmentInput(false);
  },[askFollowBeforeDm,dmAttachmentUrl,isPro,isStarterOrPro,publicCommentReplyEnabled,sendFollowUpMessage,showAttachmentInput]);

  const reset=()=>{
    setStep('choose');setName('');setTriggerType(null);setCommentTarget('specific');
    setCommentFilter('all');setSelectedMediaId('');setMediaItems([]);setMediaLimit(24);
    setAnyCommentKeyword(true);setPublicCommentReplyEnabled(false);
    setPublicCommentReplyTemplate('Thanks for your comment! Check your DM for details.');
    setAskFollowBeforeDm(false);setSendFollowUpMessage(false);
    setDmAttachmentUrl('');setShowAttachmentInput(false);
    setKeywords([]);setKwInput('');setTemplate('');setError('');setShowPreview(false);
  };

  useEffect(()=>{
    const shouldLoad=open&&step==='details'&&triggerType==='comment'&&commentTarget==='specific';
    if(!shouldLoad) return;
    let alive=true;
    const load=async()=>{
      setMediaLoading(true);
      try {
        const items=await getInstagramMedia(commentFilter,mediaLimit);
        if(!alive) return;
        setMediaItems(items);
        if(!selectedMediaId&&items.length>0) setSelectedMediaId(items[0].id);
      } catch { if(!alive) return; setMediaItems([]); }
      finally { if(alive) setMediaLoading(false); }
    };
    load();
    return()=>{ alive=false; };
  },[open,step,triggerType,commentTarget,commentFilter,mediaLimit,selectedMediaId]);

  const addKeyword=useCallback(()=>{
    const kw=kwInput.trim().toLowerCase();
    if(kw&&!keywords.includes(kw)) setKeywords(p=>[...p,kw]);
    setKwInput('');
  },[kwInput,keywords]);

  const removeKeyword=(kw:string)=>setKeywords(p=>p.filter(k=>k!==kw));

  const handleKwKeyDown=(e:React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key==='Enter'||e.key===','){e.preventDefault();addKeyword();}
    if(e.key==='Backspace'&&!kwInput&&keywords.length>0) setKeywords(p=>p.slice(0,-1));
  };

  const insertVar=(v:string)=>{
    if(!textareaRef.current) return;
    const{selectionStart:s,selectionEnd:e}=textareaRef.current;
    setTemplate(template.substring(0,s)+v+template.substring(e));
    requestAnimationFrame(()=>{ textareaRef.current?.setSelectionRange(s+v.length,s+v.length); textareaRef.current?.focus(); });
  };

  const lockBadge=(unlocked:boolean,tier:string)=>{
    if(unlocked) return null;
    return <span style={{ display:'inline-flex',alignItems:'center',gap:3,padding:'2px 7px',borderRadius:999,background:'#F1F5F9',color:'#64748B',fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.04em' }}><Lock size={9}/>{tier}</span>;
  };

  const canSubmit=():boolean=>{
    if(!triggerType||!template.trim()) return false;
    if(triggerType==='keyword'&&keywords.length===0) return false;
    if(triggerType==='comment'&&commentTarget==='specific'&&!selectedMediaId) return false;
    return true;
  };

  const handleSubmit=async()=>{
    if(!triggerType||!canSubmit()) return;
    setLoading(true); setError('');
    const payload:RuleCreatePayload={
      name:name.trim()||`${TRIGGER_OPTIONS.find(t=>t.value===triggerType)?.label} Rule`,
      trigger_type:triggerType,
      keywords:triggerType==='keyword'||(triggerType==='comment'&&!anyCommentKeyword)?keywords:[],
      response_template:normalizeTemplateVariables(template.trim()),
      ...(triggerType==='comment'&&{
        comment_target_type:commentTarget,
        comment_media_id:commentTarget==='specific'?selectedMediaId:undefined,
        any_comment_keyword:anyCommentKeyword,
        public_comment_reply_enabled:publicCommentReplyEnabled,
        public_comment_reply_template:publicCommentReplyEnabled?normalizeTemplateVariables(publicCommentReplyTemplate):undefined,
      }),
      ask_follow_before_dm:askFollowBeforeDm,
      send_follow_up_message:sendFollowUpMessage,
      dm_attachment_url:dmAttachmentUrl.trim()||undefined,
    };
    try {
      const rule=await createRule(payload);
      onCreated(rule); onClose(); reset();
    } catch(err) { setError(getErrorText(err)); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={()=>{onClose();reset();}} title={step==='choose'?'Create Automation Rule':'Configure Rule'} maxWidth={step==='details' ? 'max-w-5xl' : 'max-w-2xl'}>

      {/* STEP 1 */}
      {step==='choose'&&(
        <div style={{ padding:'4px 0' }}>
          <p style={{ fontSize:'0.875rem',color:'var(--color-muted)',marginBottom:16 }}>Choose what event should trigger your automated DM:</p>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {TRIGGER_OPTIONS.map(opt=>(
              <button key={opt.value} type="button" onClick={()=>{setTriggerType(opt.value);setStep('details');}}
                style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:'white',border:'1.5px solid var(--color-border)',borderRadius:14,cursor:'pointer',textAlign:'left',transition:'all 180ms',width:'100%' }}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(124,58,237,0.4)';el.style.background='linear-gradient(135deg,rgba(124,58,237,0.05),rgba(219,39,119,0.02))';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--color-border)';el.style.background='white';}}>
                <div style={{ width:40,height:40,borderRadius:11,background:'linear-gradient(135deg,#EDE9FE,#DDD6FE)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-primary)',flexShrink:0 }}>{opt.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:'0.9rem',color:'var(--color-text)',marginBottom:2 }}>{opt.label}</div>
                  <div style={{ fontSize:'0.8rem',color:'var(--color-muted)' }}>{opt.desc}</div>
                </div>
                <ArrowRight size={15} style={{ color:'var(--color-muted)',flexShrink:0 }}/>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step==='details'&&(
        <div>
          {/* Mobile preview toggle */}
          <div className="rb-preview-toggle-wrap">
            <button type="button" className="rb-preview-toggle-btn" onClick={()=>setShowPreview(p=>!p)}>
              {showPreview?<EyeOff size={14}/>:<Eye size={14}/>}
              {showPreview?'Hide Preview':'Show Live Preview'}
            </button>
          </div>

          {/* Mobile preview panel */}
          {showPreview&&(
            <div className="rb-preview-mobile">
              <PhonePreview triggerType={triggerType} template={template} keywords={keywords}/>
            </div>
          )}

          <div className="rb-layout">
            {/* Form */}
            <div className="rb-form-col">
              <button type="button" onClick={()=>setStep('choose')}
                style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:'0.875rem',fontWeight:600,color:'var(--color-muted)',background:'none',border:'none',cursor:'pointer',padding:'0 0 16px 0',transition:'color 150ms' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='var(--color-primary)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='var(--color-muted)'}>
                <ArrowLeft size={15}/> Change trigger type
              </button>

              <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'6px 14px',background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(219,39,119,0.05))',border:'1px solid rgba(124,58,237,0.2)',borderRadius:999,fontSize:'0.8rem',fontWeight:700,color:'var(--color-primary)',marginBottom:20 }}>
                <Zap size={13}/>{TRIGGER_OPTIONS.find(t=>t.value===triggerType)?.label}
              </div>

              {/* Rule Name */}
              <div style={{ marginBottom:18 }}>
                <label className="form-label">Rule Name</label>
                <input type="text" className="form-input" placeholder="e.g. Reply to pricing inquiries" value={name} onChange={e=>setName(e.target.value)}/>
              </div>

              {/* Keywords */}
              {triggerType==='keyword'&&(
                <div style={{ marginBottom:18 }}>
                  <label className="form-label">Keywords <span style={{ fontWeight:400,color:'var(--color-muted)',marginLeft:8,fontSize:'0.75rem' }}>Press Enter or comma to add</span></label>
                  <div className="keywords-container" onClick={()=>kwInputRef.current?.focus()}>
                    {keywords.map(kw=>(
                      <span key={kw} className="keyword-tag">{kw}<button type="button" className="keyword-tag-remove" onClick={()=>removeKeyword(kw)}><X size={10}/></button></span>
                    ))}
                    <input ref={kwInputRef} type="text" className="keywords-input" placeholder={keywords.length===0?'price, buy, order...':''} value={kwInput} onChange={e=>setKwInput(e.target.value)} onKeyDown={handleKwKeyDown}/>
                  </div>
                </div>
              )}

              {/* Comment config */}
              {triggerType==='comment'&&(
                <div style={{ marginBottom:18 }}>
                  <label className="form-label">Post Target</label>
                  <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:12 }}>
                    {COMMENT_TARGET_OPTIONS.map(opt=>(
                      <button key={opt.value} type="button" onClick={()=>setCommentTarget(opt.value)} className={`wizard-option ${commentTarget===opt.value?'active':''}`}>
                        <span className="wizard-option-radio"><span/></span>
                        <div><p className="wizard-option-title">{opt.label}</p><p className="wizard-option-desc">{opt.desc}</p></div>
                      </button>
                    ))}
                  </div>
                  {commentTarget==='specific'&&(
                    <div style={{ marginBottom:12 }}>
                      <div className="wizard-filter-row" style={{ marginBottom:10 }}>
                        {COMMENT_MEDIA_FILTERS.map(f=>(<button key={f.value} type="button" className={`wizard-filter-pill ${commentFilter===f.value?'active':''}`} onClick={()=>setCommentFilter(f.value)}>{f.label}</button>))}
                      </div>
                      {mediaLoading?(<div className="wizard-media-loading"><RefreshCw size={14} className="animate-spin"/> Loading...</div>):(
                        <div className="wizard-media-grid">
                          {(mediaItems.length>0?mediaItems:COMMENT_MEDIA_PREVIEW).filter(item=>commentFilter==='all'||item.media_type===commentFilter).map(item=>(
                            <button key={item.id} type="button" onClick={()=>setSelectedMediaId(item.id)} className={`wizard-media-card ${selectedMediaId===item.id?'active':''}`}>
                              <span className={`wizard-media-thumb ${item.media_type}`}>{item.media_type==='post'?'▣':'▶'}</span>
                              <span className="wizard-media-label">{item.media_type}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="wizard-toggle-row compact">
                    <span>Any keyword</span>
                    <button type="button" onClick={()=>setAnyCommentKeyword(p=>!p)} className={`wizard-switch ${anyCommentKeyword?'on':''}`}><span/></button>
                  </div>
                  {!anyCommentKeyword&&(
                    <div className="keywords-container" style={{ marginTop:10 }} onClick={()=>kwInputRef.current?.focus()}>
                      {keywords.map(kw=>(<span key={kw} className="keyword-tag">{kw}<button type="button" className="keyword-tag-remove" onClick={()=>removeKeyword(kw)}><X size={10}/></button></span>))}
                      <input ref={kwInputRef} type="text" className="keywords-input" placeholder={keywords.length===0?'Type keyword and press Enter':''} value={kwInput} onChange={e=>setKwInput(e.target.value)} onKeyDown={handleKwKeyDown}/>
                    </div>
                  )}
                </div>
              )}

              {/* Response Template */}
              <div style={{ marginBottom:16 }}>
                <label className="form-label">Response Template</label>
                <div className="rb-var-chips">
                  <span style={{ fontSize:'0.75rem',color:'var(--color-muted)',flexShrink:0 }}>Insert:</span>
                  {TEMPLATE_VARS.map(v=>(
                    <button key={v} type="button" onClick={()=>insertVar(v)} className="rb-var-chip">{v}</button>
                  ))}
                </div>
                <textarea ref={textareaRef} className="template-textarea" placeholder="Hi {{name}}! Thanks for reaching out. Here's what you need to know..." value={template} onChange={e=>setTemplate(e.target.value)} rows={4}/>
                <p style={{ fontSize:'0.75rem',color:'var(--color-muted)',textAlign:'right',marginTop:4 }}>{template.length} / 1000</p>
              </div>

              {/* Comment advanced */}
              {triggerType==='comment'&&(
                <div style={{ marginBottom:14 }}>
                  <div className="wizard-toggle-row compact">
                    <span className="wizard-toggle-label">Publicly reply to comments {lockBadge(isPro,'pro')}</span>
                    <button type="button" onClick={()=>isPro&&setPublicCommentReplyEnabled(p=>!p)} className={`wizard-switch ${publicCommentReplyEnabled?'on':''}`} disabled={!isPro}><span/></button>
                  </div>
                  {publicCommentReplyEnabled&&(<textarea className="template-textarea" style={{ marginTop:8 }} rows={2} value={publicCommentReplyTemplate} onChange={e=>setPublicCommentReplyTemplate(e.target.value)}/>)}
                </div>
              )}

              {/* Toggles */}
              <div style={{ display:'flex',flexDirection:'column',gap:2,marginBottom:20 }}>
                <div className="wizard-toggle-row compact">
                  <span className="wizard-toggle-label">Ask to follow before DM {lockBadge(isStarterOrPro,'starter')}</span>
                  <button type="button" onClick={()=>isStarterOrPro&&setAskFollowBeforeDm(p=>!p)} className={`wizard-switch ${askFollowBeforeDm?'on':''}`} disabled={!isStarterOrPro}><span/></button>
                </div>
                <div className="wizard-toggle-row compact">
                  <span className="wizard-toggle-label">Send follow-up message {lockBadge(isPro,'pro')}</span>
                  <button type="button" onClick={()=>isPro&&setSendFollowUpMessage(p=>!p)} className={`wizard-switch ${sendFollowUpMessage?'on':''}`} disabled={!isPro}><span/></button>
                </div>
              </div>

              {error&&(
                <div style={{ display:'flex',alignItems:'flex-start',gap:10,padding:'12px 16px',background:'var(--color-danger-light)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:12,marginBottom:16 }}>
                  <AlertCircle size={15} style={{ color:'var(--color-danger)',flexShrink:0,marginTop:1 }}/>
                  <p style={{ fontSize:'0.875rem',color:'#9F1239' }}>{error}</p>
                </div>
              )}

              <button type="button" onClick={handleSubmit} disabled={loading||!canSubmit()}
                style={{ width:'100%',padding:'13px',background:canSubmit()?'linear-gradient(135deg,#7C3AED,#DB2777)':'#E2E8F0',color:canSubmit()?'white':'#94A3B8',border:'none',borderRadius:12,fontFamily:'var(--font-display)',fontWeight:700,fontSize:'0.9375rem',cursor:canSubmit()?'pointer':'not-allowed',transition:'all 200ms',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:canSubmit()?'0 8px 24px rgba(124,58,237,0.3)':'none' }}>
                {loading?<><RefreshCw size={16} className="animate-spin"/> Creating rule...</>:<><Check size={16}/> Create Rule</>}
              </button>
            </div>

            {/* Desktop preview */}
            <div className="rb-preview-col">
              <PhonePreview triggerType={triggerType} template={template} keywords={keywords}/>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
