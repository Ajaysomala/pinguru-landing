import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, LifeBuoy, ArrowRight, ShieldCheck, Clock3,
  ChevronDown, MessageSquare, BookOpen, Zap, CreditCard,
  CheckCircle,
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/support.css';

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

const contactCards = [
  {
    icon: <Mail size={18}/>,
    tone: 'violet',
    title: 'Email Support',
    desc: 'Best for account, billing, and policy questions.',
    action: (
      <a href={`mailto:${SUPPORT_EMAIL}`} className="support-card-link">
        {SUPPORT_EMAIL} <ArrowRight size={13}/>
      </a>
    ),
  },
  {
    icon: <Clock3 size={18}/>,
    tone: 'green',
    title: 'Response Time',
    desc: 'Usually within 24 hours on weekdays.',
    action: (
      <div className="support-response-note">
        <div><CheckCircle size={13}/> Priority for login &amp; billing</div>
        <span>Normal queue within 24h</span>
      </div>
    ),
  },
  {
    icon: <ShieldCheck size={18}/>,
    tone: 'amber',
    title: 'Policy & Compliance',
    desc: 'Meta-compliant automation guidance.',
    action: (
      <div className="support-link-stack">
        <Link to="/privacy">Privacy Policy <ArrowRight size={12}/></Link>
        <Link to="/refund-policy">Refund Policy <ArrowRight size={12}/></Link>
      </div>
    ),
  },
];

const quickLinks = [
  { label:'Create automation rule', href:'/rules', icon:<Zap size={14}/>, tone:'violet' },
  { label:'Connect Instagram', href:'/connect', icon:<MessageSquare size={14}/>, tone:'pink' },
  { label:'View billing & plans', href:'/billing', icon:<CreditCard size={14}/>, tone:'orange' },
  { label:'Read the blog', href:'/blog', icon:<BookOpen size={14}/>, tone:'cyan' },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`support-faq-item ${open ? 'open' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="support-faq-trigger"
      >
        <span>{q}</span>
        <ChevronDown
          size={18}
          className="support-faq-chevron"
        />
      </button>
      {open && (
        <div className="support-faq-answer">
          {a}
        </div>
      )}
    </div>
  );
};

const SupportPage: React.FC = () => {
  return (
    <div className="page-wrapper support-page">
      <section className="pg-surface-hero support-hero">
        <p className="pg-surface-kicker"><LifeBuoy size={13}/> Support Center</p>
        <h1 className="pg-surface-title">Get help quickly</h1>
        <p className="pg-surface-subtitle">Find answers, contact support, and resolve account or automation issues without delay.</p>
      </section>

      <section className="support-contact-grid">
        {contactCards.map((card) => (
          <article key={card.title} className="support-contact-card">
            <div className={`support-card-icon ${card.tone}`}>{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            {card.action}
          </article>
        ))}
      </section>

      <section className="support-section">
        <h2>Quick access</h2>
        <div className="support-quick-grid">
          {quickLinks.map(item=>(
            <Link key={item.href} to={item.href} className={`support-quick-link ${item.tone}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="support-section">
        <h2>Frequently asked questions</h2>
        <div className="support-faq-list">
          {faqs.map(item=><FaqItem key={item.q} {...item}/>)}
        </div>
      </section>

      <section className="support-cta">
        <h2>Still stuck? We've got you.</h2>
        <p>Send us your account email and issue details — we'll unblock you fast.</p>
        <div className="support-cta-actions">
          <a href={`mailto:${SUPPORT_EMAIL}?subject=PinGuru%20Support%20Request`} className="support-cta-primary">
            <Mail size={15}/> Contact Support
          </a>
          <Link to="/settings" className="support-cta-secondary">
            Account Settings
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;
