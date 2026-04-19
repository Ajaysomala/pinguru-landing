import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, BarChart2, MessageSquare,
  Check, ArrowRight, Instagram, ChevronDown,
} from 'lucide-react';
import '../styles/landing.css';

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar: React.FC = () => (
  <nav className="landing-nav">
    <Link to="/" className="landing-nav-logo">
      <div className="landing-nav-logo-mark">PG</div>
      <span className="landing-nav-logo-text">PinGuru</span>
    </Link>
    <div className="landing-nav-links">
      <a href="#features" className="landing-nav-link">Features</a>
      <a href="#pricing"  className="landing-nav-link">Pricing</a>
      <Link to="/support" className="landing-nav-link">Support</Link>
      <Link to="/login"    className="landing-nav-link">Log in</Link>
      <Link
        to="/register"
        className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all"
      >
        Get Started <ArrowRight size={14}/>
      </Link>
    </div>
  </nav>
);

// ── Features data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Zap size={20}/>,
    color: 'indigo',
    title: 'Event-Driven Rules',
    desc: 'Trigger automations on keywords, story mentions, comments, or any new DM — with zero delay.',
  },
  {
    icon: <ShieldCheck size={20}/>,
    color: 'teal',
    title: 'Compliance-First',
    desc: 'Built to Meta\'s platform policy. 24-hour messaging windows, rate limits, and data deletion — handled automatically.',
  },
  {
    icon: <BarChart2 size={20}/>,
    color: 'amber',
    title: 'Actionable Analytics',
    desc: 'Track DM volume, success rates, and rule performance over 7 or 30 days — not just raw numbers.',
  },
  {
    icon: <MessageSquare size={20}/>,
    color: 'rose',
    title: 'Smart Templates',
    desc: 'Personalize every response with {name}, {username}, and {keyword} variables. Never send a generic DM again.',
  },
];

// ── Pricing data ──────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    desc: 'Perfect for testing',
    features: ['5 automation flows', 'Unlimited DMs', '500 contacts / month', 'Basic analytics', 'Email support', 'DM footer: © PinGuru'],
    cta: 'Start Free',
    ctaTo: '/register',
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 199,
    period: '/month',
    desc: 'For growing creators',
    features: ['15 automation flows', 'Unlimited DMs', 'Unlimited contacts', 'Premium analytics', 'Ask-to-follow before DM delivery', 'No DM footer branding', 'Priority email support'],
    cta: 'Start Starter',
    ctaTo: '/register',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    period: '/month',
    desc: 'Scale without limits',
    features: ['Unlimited automation flows', 'Unlimited DMs', 'Unlimited contacts', 'Premium analytics', 'Ask-to-follow before DM delivery', 'No DM footer branding', '24/7 faster support'],
    cta: 'Start Pro',
    ctaTo: '/register',
    popular: false,
  },
];

// ── Stat ticker ───────────────────────────────────────────────────────────────
const STATS = [
  { value: '2M+',  label: 'DMs automated'    },
  { value: '98%',  label: 'delivery rate'     },
  { value: '< 1s', label: 'average response'  },
  { value: '100%', label: 'Meta compliant'    },
];

// ── LandingPage ───────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  // Intersection observer for scroll-reveal
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const reveal = (i: number) => (el: HTMLElement | null) => { revealRefs.current[i] = el; };

  return (
    <div className="landing-page">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge">
          <Instagram size={13}/> Built for Instagram Business
        </div>
        <h1 className="hero-title">
          Turn inbound DMs into<br/>
          <span className="hero-title-accent">structured sales workflows</span>
        </h1>
        <p className="hero-desc">
          PinGuru automates your Instagram DMs with smart, compliance-first rules.
          Set up once, respond to every lead instantly — 24/7.
        </p>
        <div className="hero-actions">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-7 py-3.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 text-[0.9375rem]"
          >
            Start for free <ArrowRight size={16}/>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-slate-600 font-semibold px-5 py-3.5 rounded-xl hover:bg-slate-100 transition-colors text-[0.9375rem]"
          >
            See how it works <ChevronDown size={15}/>
          </a>
        </div>

        {/* IG branding note */}
        <p className="text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald-500"/>
          Meta Platform Policy compliant · No credit card required
        </p>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <div className="stats-bar" ref={reveal(0)}>
        <div className="stats-bar-inner">
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="stat-ticker">
                <span className="stat-ticker-value">{s.value}</span>
                <span className="stat-ticker-label">{s.label}</span>
              </div>
              {i < STATS.length - 1 && <div className="stat-ticker-divider"/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="features" id="features">
        <div className="features-inner">
          <div className="section-heading" ref={reveal(1) as any}>
            <p className="section-eyebrow">Why PinGuru</p>
            <h2 className="section-title">Everything you need to automate DMs</h2>
            <p className="section-desc">
              No code. No integrations. Just connect Instagram and your rules go live instantly.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feature-card reveal-item" ref={reveal(2 + i) as any}>
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="how-it-works">
        <div className="how-inner">
          <div className="section-heading" ref={reveal(6) as any}>
            <p className="section-eyebrow">Simple setup</p>
            <h2 className="section-title">Live in under 5 minutes</h2>
          </div>
          <div className="how-steps">
            {[
              { n: '01', title: 'Create your account',    desc: 'Sign up free — no credit card required.' },
              { n: '02', title: 'Connect Instagram',       desc: 'Authorize PinGuru with one click via Instagram OAuth.' },
              { n: '03', title: 'Build automation rules',  desc: 'Choose triggers, set keywords, write your response template.' },
              { n: '04', title: 'Watch DMs get answered',  desc: 'Every matching DM gets a personalized, instant reply.' },
            ].map((step, i) => (
              <div key={step.n} className="how-step" ref={reveal(7 + i) as any}>
                <div className="how-step-number">{step.n}</div>
                <div className="how-step-connector" aria-hidden="true"/>
                <h4 className="how-step-title">{step.title}</h4>
                <p className="how-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section className="pricing" id="pricing">
        <div className="pricing-inner">
          <div className="section-heading" ref={reveal(11) as any}>
            <p className="section-eyebrow">Simple pricing</p>
            <h2 className="section-title">Start free, scale when you need to</h2>
            <p className="section-desc">All prices in Indian Rupees. Cancel anytime, no lock-in.</p>
          </div>
          <div className="pricing-grid">
            {PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className={`landing-plan-card ${plan.popular ? 'popular' : ''}`}
                ref={reveal(12 + i) as any}
              >
                {plan.popular && <div className="landing-plan-badge">Most Popular</div>}
                <div className="landing-plan-name">{plan.name}</div>
                <div className="landing-plan-desc">{plan.desc}</div>
                <div className="landing-plan-price">
                  {plan.price === 0 ? (
                    <><span className="landing-plan-amount">₹0</span><span className="landing-plan-period">forever</span></>
                  ) : (
                    <><span className="landing-plan-currency">₹</span><span className="landing-plan-amount">{plan.price}</span><span className="landing-plan-period">/mo</span></>
                  )}
                </div>
                <ul className="landing-plan-features">
                  {plan.features.map(f => (
                    <li key={f} className="landing-plan-feature">
                      <Check size={12} className={plan.popular ? 'text-white/80' : 'text-emerald-500'}/>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.ctaTo}
                  className={`landing-plan-cta ${plan.popular ? 'cta-white' : 'cta-primary'}`}
                >
                  {plan.cta} <ArrowRight size={14}/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="cta-banner" ref={reveal(15) as any}>
        <div className="cta-banner-inner">
          <h2 className="cta-title">Ready to automate your DMs?</h2>
          <p className="cta-desc">Join creators and businesses already using PinGuru to convert every DM into an opportunity.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-3.5 rounded-xl hover:bg-indigo-50 active:scale-[0.98] transition-all text-[0.9375rem]"
          >
            Get started free <ArrowRight size={16}/>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="landing-footer">
        <p className="landing-footer-text">© {new Date().getFullYear()} PinGuru. All rights reserved.</p>
        <div className="landing-footer-links">
          <Link to="/support" className="landing-footer-link">Support Center</Link>
          <Link to="/privacy" className="landing-footer-link">Privacy Policy</Link>
          <Link to="/terms"   className="landing-footer-link">Terms of Service</Link>
          <a href="mailto:support@pinguru.me" className="landing-footer-link">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
