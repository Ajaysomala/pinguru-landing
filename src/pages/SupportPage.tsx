import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, LifeBuoy, ArrowRight, ShieldCheck, Clock3,
  ChevronDown, MessageSquare, BookOpen, Zap, CreditCard,
  CheckCircle,
} from 'lucide-react';
import '../styles/dashboard.css';

const SUPPORT_EMAIL = 'support@pinguru.me';

const faqs = [
  { q: 'How fast can I get help?',
    a: 'We typically respond within 24 hours on weekdays. Billing and account access issues are prioritized and handled faster.' },
  { q: 'What should I include in a support request?',
    a: 'Share your account email, Instagram handle, a brief issue summary, and screenshots if possible. This helps us resolve issues much faster.' },
  { q: 'Can you help with DM automation setup?',
    a: 'Yes! We can guide you through rule setup, trigger mapping, and response templates while staying within Meta policy limits.' },
  { q: 'How do I request data deletion?',
    a: 'Go to Settings → Data & Privacy and submit a deletion request. You can also email support directly if you cannot access your account.' },
  { q: 'Why are my automations not triggering?',
    a: 'Check that your Instagram account is connected and your token is valid (Dashboard → Instagram card). Also verify your rule is set to Active.' },
  { q: 'Is PinGuru compliant with Meta policies?',
    a: 'Yes, PinGuru is built fully in compliance with Meta Platform Policy — including the 24-hour messaging window, rate limits, and data deletion requirements.' },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: `1.5px solid ${open ? 'rgba(124,58,237,0.25)' : 'var(--color-border)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'border-color 200ms',
        background: open ? 'linear-gradient(135deg, rgba(124,58,237,0.03), rgba(219,39,119,0.01))' : 'white',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
          padding: '16px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
          {q}
        </span>
        <ChevronDown
          size={18}
          style={{
            color: 'var(--color-muted)', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 250ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
};

const SupportPage: React.FC = () => {
  return (
    <div className="page-wrapper" style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(145deg, #0D0B1E 0%, #1A1040 50%, #220D3A 100%)',
        borderRadius: 24, padding: '44px 36px',
        marginBottom: 32, position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* orb */}
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(circle at 50% 70%, rgba(124,58,237,0.35), transparent 60%)',pointerEvents:'none' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'5px 14px',borderRadius:999,background:'rgba(124,58,237,0.25)',border:'1px solid rgba(124,58,237,0.4)',color:'#A78BFA',fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.06em',marginBottom:18 }}>
            <LifeBuoy size={13}/> Support Center
          </span>
          <h1 style={{ fontFamily:'var(--font-display)',fontSize:'clamp(1.75rem,4vw,2.5rem)',fontWeight:800,color:'white',letterSpacing:'-0.04em',marginBottom:12,lineHeight:1.15 }}>
            Get help quickly
          </h1>
          <p style={{ color:'rgba(255,255,255,0.6)',fontSize:'1rem',maxWidth:480,margin:'0 auto' }}>
            Find answers, contact support, and resolve account or automation issues without delay.
          </p>
        </div>
      </div>

      {/* ── 3 contact cards ───────────────────────────────── */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:32 }}>
        {[
          {
            icon: <Mail size={18}/>,
            iconBg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)',
            iconColor: '#7C3AED',
            title: 'Email Support',
            desc: 'Best for account, billing, and policy questions.',
            action: (
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:'0.8125rem',fontWeight:700,color:'var(--color-primary)',textDecoration:'none',marginTop:12 }}>
                {SUPPORT_EMAIL} <ArrowRight size={13}/>
              </a>
            ),
          },
          {
            icon: <Clock3 size={18}/>,
            iconBg: 'linear-gradient(135deg,#ECFDF5,#A7F3D0)',
            iconColor: '#059669',
            title: 'Response Time',
            desc: 'Usually within 24 hours on weekdays.',
            action: (
              <div style={{ marginTop:12,fontSize:'0.78rem',color:'var(--color-muted)' }}>
                <div style={{ display:'flex',alignItems:'center',gap:6,color:'var(--color-success)',fontWeight:600,fontSize:'0.8125rem',marginBottom:4 }}>
                  <CheckCircle size={13}/> Priority for login & billing
                </div>
                Normal queue within 24h
              </div>
            ),
          },
          {
            icon: <ShieldCheck size={18}/>,
            iconBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
            iconColor: '#D97706',
            title: 'Policy & Compliance',
            desc: 'Meta-compliant automation guidance.',
            action: (
              <div style={{ display:'flex',flexDirection:'column',gap:6,marginTop:12 }}>
                <Link to="/privacy" style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:'0.8125rem',fontWeight:600,color:'var(--color-primary)',textDecoration:'none' }}>Privacy Policy <ArrowRight size={12}/></Link>
                <Link to="/refund" style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:'0.8125rem',fontWeight:600,color:'var(--color-primary)',textDecoration:'none' }}>Refund Policy <ArrowRight size={12}/></Link>
              </div>
            ),
          },
        ].map((card, i) => (
          <div key={i} style={{
            background:'white', border:'1.5px solid var(--color-border)',
            borderRadius:18, padding:'22px 20px',
            transition:'all 200ms',
          }}
            onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='rgba(124,58,237,0.25)'; el.style.transform='translateY(-3px)'; el.style.boxShadow='0 12px 32px rgba(124,58,237,0.1)'; }}
            onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--color-border)'; el.style.transform='none'; el.style.boxShadow='none'; }}
          >
            <div style={{ width:40,height:40,borderRadius:12,background:card.iconBg,display:'flex',alignItems:'center',justifyContent:'center',color:card.iconColor,marginBottom:14 }}>
              {card.icon}
            </div>
            <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:'0.9375rem',color:'var(--color-text)',marginBottom:6 }}>{card.title}</div>
            <div style={{ fontSize:'0.8125rem',color:'var(--color-muted)',lineHeight:1.5 }}>{card.desc}</div>
            {card.action}
          </div>
        ))}
      </div>

      {/* ── Quick links ────────────────────────────────────── */}
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.125rem',fontWeight:800,color:'var(--color-text)',letterSpacing:'-0.02em',marginBottom:14 }}>
          Quick access
        </h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10 }}>
          {[
            { label:'Create automation rule', href:'/rules', icon:<Zap size={14}/>, color:'#7C3AED', bg:'rgba(124,58,237,0.08)' },
            { label:'Connect Instagram', href:'/connect', icon:<MessageSquare size={14}/>, color:'#DB2777', bg:'rgba(219,39,119,0.08)' },
            { label:'View billing & plans', href:'/billing', icon:<CreditCard size={14}/>, color:'#D97706', bg:'rgba(217,119,6,0.08)' },
            { label:'Read the blog', href:'/blog', icon:<BookOpen size={14}/>, color:'#0891B2', bg:'rgba(8,145,178,0.08)' },
          ].map(item=>(
            <Link key={item.href} to={item.href} style={{
              display:'flex',alignItems:'center',gap:10,
              padding:'12px 16px',
              background:'white',
              border:'1.5px solid var(--color-border)',
              borderRadius:12, textDecoration:'none',
              fontSize:'0.875rem', fontWeight:600, color:'var(--color-text)',
              transition:'all 150ms',
            }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='rgba(124,58,237,0.3)'; el.style.background=item.bg; el.style.color=item.color; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--color-border)'; el.style.background='white'; el.style.color='var(--color-text)'; }}
            >
              <span style={{ color:item.color }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.125rem',fontWeight:800,color:'var(--color-text)',letterSpacing:'-0.02em',marginBottom:16 }}>
          Frequently asked questions
        </h2>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {faqs.map(item=><FaqItem key={item.q} {...item}/>)}
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────────── */}
      <div style={{
        background:'linear-gradient(135deg,#7C3AED 0%,#DB2777 60%,#F97316 100%)',
        backgroundSize:'200% auto',
        borderRadius:20, padding:'36px 36px',
        textAlign:'center', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(circle at 30% 50%,rgba(255,255,255,0.12),transparent 50%)',pointerEvents:'none' }}/>
        <div style={{ position:'relative',zIndex:1 }}>
          <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.5rem',fontWeight:800,color:'white',marginBottom:10,letterSpacing:'-0.02em' }}>
            Still stuck? We've got you.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.7)',fontSize:'0.9375rem',marginBottom:24,maxWidth:440,margin:'0 auto 24px' }}>
            Send us your account email and issue details — we'll unblock you fast.
          </p>
          <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=PinGuru%20Support%20Request`}
              style={{ display:'inline-flex',alignItems:'center',gap:8,background:'white',color:'var(--color-primary)',padding:'12px 24px',borderRadius:12,fontWeight:700,fontSize:'0.9rem',textDecoration:'none',boxShadow:'0 8px 24px rgba(0,0,0,0.15)',transition:'all 150ms' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
              <Mail size={15}/> Contact Support
            </a>
            <Link to="/settings"
              style={{ display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',color:'white',padding:'12px 24px',borderRadius:12,fontWeight:600,fontSize:'0.9rem',textDecoration:'none',transition:'all 150ms' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.22)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.15)'}>
              Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
