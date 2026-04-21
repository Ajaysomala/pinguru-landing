import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, BarChart2, MessageSquare,
  Check, ArrowRight, Instagram, ChevronDown,
  Menu, X, Star, TrendingUp, Globe, Users,
  BookOpen, Mail, Twitter, Linkedin, Github,
  Sparkles, Clock, Target, Bell, Lock,
} from 'lucide-react';
import '../styles/landing.css';

// ── Navbar ─────────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="landing-nav-inner">
        <Link to="/" className="landing-nav-logo">
          <div className="landing-nav-logo-mark">PG</div>
          <span className="landing-nav-logo-text">PinGuru</span>
        </Link>

        {/* Desktop links */}
        <div className="landing-nav-links">
          <a href="#features"     className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#pricing"      className="landing-nav-link">Pricing</a>
          <Link to="/blog"        className="landing-nav-link">Blog</Link>
          <Link to="/support"     className="landing-nav-link">Support</Link>
        </div>

        <div className="landing-nav-ctas">
          <Link to="/login" className="landing-nav-link">Log in</Link>
          <Link to="/register" className="btn-primary btn-sm">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="landing-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`landing-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <a href="#features"     className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#how-it-works" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
        <a href="#pricing"      className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Pricing</a>
        <Link to="/blog"        className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Blog</Link>
        <Link to="/support"     className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Support</Link>
        <div className="mobile-nav-divider" />
        <Link to="/login"    className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Log in</Link>
        <Link
          to="/register"
          className="btn-primary"
          style={{ justifyContent: 'center', marginTop: 4 }}
          onClick={() => setMenuOpen(false)}
        >
          Get Started Free
        </Link>
      </div>
    </nav>
  );
};

// ── Hero ────────────────────────────────────────────────────────────────────
const Hero: React.FC = () => {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: React.MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
    const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
    setParallax({ x: x * 18, y: y * 14 });
  };

  return (
  <section className="hero" onMouseMove={handlePointerMove} onMouseLeave={() => setParallax({ x: 0, y: 0 })}>
    {/* Animated background orbs */}
    <div className="hero-orb hero-orb-1" />
    <div className="hero-orb hero-orb-2" />
    <div className="hero-orb hero-orb-3" />

    <div
      className="hero-inner"
      style={{ transform: `translate3d(${parallax.x * 0.34}px, ${parallax.y * 0.34}px, 0)` }}
    >
      <div className="hero-badge">
        <Instagram size={13} /> Built for Instagram Business
      </div>

      <h1 className="hero-title">
        Turn every DM into<br />
        <span className="hero-title-accent">a revenue opportunity</span>
      </h1>

      <p className="hero-desc">
        PinGuru automates your Instagram DMs with smart, compliance-first rules.
        Set up once — respond to every lead instantly, 24/7, without lifting a finger.
      </p>

      <div className="hero-actions">
        <Link to="/register" className="btn-primary">
          Start for free <ArrowRight size={16} />
        </Link>
        <a href="#how-it-works" className="btn-ghost">
          See how it works <ChevronDown size={15} />
        </a>
      </div>

      <p className="hero-trust">
        <ShieldCheck size={13} style={{ color: '#10B981' }} />
        Meta Policy compliant &nbsp;·&nbsp; No credit card required &nbsp;·&nbsp; Live in 5 minutes
      </p>

      {/* Phone mockup */}
      <div
        className="hero-parallax-layer"
        style={{ transform: `translate3d(${parallax.x * -0.9}px, ${parallax.y * -1.1}px, 0)` }}
      >
      <div className="hero-phone-wrap">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Floating badges */}
          <div className="hero-floating-badge hero-floating-badge-1">
            <div className="dot" />
            DM sent instantly
          </div>
          <div className="hero-floating-badge hero-floating-badge-2">
            <Zap size={12} style={{ color: '#7C3AED' }} />
            Rule triggered
          </div>

          {/* Phone */}
          <div className="hero-phone-container">
            <div className="hero-phone">
              <div className="hero-phone-notch" />
              <div className="hero-phone-screen">
                <div className="hero-phone-header">
                  <div className="hero-phone-avatar" />
                  <div>
                    <div className="hero-phone-name">@yourbrand</div>
                    <div className="hero-phone-status">Active now</div>
                  </div>
                </div>

                <div style={{ padding: '10px 10px 14px' }}>
                  <div className="hero-dm-in">Hey! What's the price? 👀</div>
                  <div className="hero-dm-typing">
                    <span /><span /><span />
                  </div>
                  <div className="hero-dm-out">
                    Hi Sarah! Thanks for asking 🙌<br />
                    Check this link for full pricing: pinguru.me/pricing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </section>
  );
};

// ── Stats Bar ───────────────────────────────────────────────────────────────
const STATS = [
  { value: '2M+',  label: 'DMs automated'   },
  { value: '98%',  label: 'delivery rate'    },
  { value: '< 1s', label: 'avg response'     },
  { value: '100%', label: 'Meta compliant'   },
];

// ── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Zap size={20} />,
    color: 'indigo',
    title: 'Event-Driven Rules',
    desc: 'Trigger automations on keywords, story mentions, comments, or any new DM — with zero delay.',
  },
  {
    icon: <ShieldCheck size={20} />,
    color: 'teal',
    title: 'Compliance-First',
    desc: "Built to Meta's platform policy. 24-hour messaging windows, rate limits, and data deletion handled automatically.",
  },
  {
    icon: <BarChart2 size={20} />,
    color: 'amber',
    title: 'Actionable Analytics',
    desc: 'Track DM volume, success rates, and rule performance over 7 or 30 days — not just raw numbers.',
  },
  {
    icon: <MessageSquare size={20} />,
    color: 'pink',
    title: 'Smart Templates',
    desc: 'Personalize every response with {name}, {username}, and {keyword} variables. Never send a generic DM again.',
  },
];

// ── Testimonials ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    text: "PinGuru completely changed how I handle DMs. I used to spend 2 hours a day manually responding — now it's fully automated and my conversion rate actually went up.",
    name: 'Priya Sharma',
    handle: '@priyastylist',
    avatar: 'PS',
    color: 'linear-gradient(135deg, #7C3AED, #DB2777)',
  },
  {
    text: "The keyword trigger is insane. I ran a giveaway, posted 'comment LINK for details' and PinGuru sent DMs to 300+ people in minutes. Manually? Impossible.",
    name: 'Arjun Mehta',
    handle: '@arjun_creator',
    avatar: 'AM',
    color: 'linear-gradient(135deg, #0891B2, #7C3AED)',
  },
  {
    text: "Setup took literally 4 minutes. Connected Instagram, built a rule, done. The Meta compliance stuff is baked in so I don't have to worry about getting banned.",
    name: 'Riya Kapoor',
    handle: '@riyabeauty',
    avatar: 'RK',
    color: 'linear-gradient(135deg, #DB2777, #F97316)',
  },
];

// ── Blog posts ──────────────────────────────────────────────────────────────
const BLOG_POSTS = [
  {
    emoji: '📱',
    bg: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
    tag: 'Tutorial',
    title: 'How to set up your first Instagram DM automation in 5 minutes',
    excerpt: 'A step-by-step walkthrough for creators who want instant DM responses without any coding.',
    date: 'Apr 10, 2025',
    readTime: '4 min read',
    slug: 'first-automation',
  },
  {
    emoji: '📊',
    bg: 'linear-gradient(135deg, #CFFAFE, #A5F3FC)',
    tag: 'Strategy',
    title: 'The Instagram DM funnel: how top creators convert followers into customers',
    excerpt: 'Real case studies from creators earning 6 figures using automated DM sequences.',
    date: 'Mar 28, 2025',
    readTime: '7 min read',
    slug: 'dm-funnel-strategy',
  },
  {
    emoji: '🛡️',
    bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    tag: 'Compliance',
    title: "Meta's Instagram Messaging Policy: what every creator needs to know",
    excerpt: 'A plain-English breakdown of the rules and how PinGuru keeps you 100% compliant.',
    date: 'Mar 14, 2025',
    readTime: '5 min read',
    slug: 'meta-policy-guide',
  },
];

// ── Pricing ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    desc: 'Perfect for testing',
    features: ['5 automation rules', 'Unlimited DMs', '500 contacts / month', 'Basic analytics', 'Email support', 'DM footer: © PinGuru'],
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
    features: ['15 automation rules', 'Unlimited DMs', 'Unlimited contacts', 'Premium analytics', 'Ask-to-follow before DM', 'No DM footer branding', 'Priority email support'],
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
    features: ['Unlimited automation rules', 'Unlimited DMs', 'Unlimited contacts', 'Premium analytics', 'Ask-to-follow + follow-up DMs', 'No DM footer branding', '24/7 priority support'],
    cta: 'Start Pro',
    ctaTo: '/register',
    popular: false,
  },
];

// ── LandingPage ─────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const reveal = (i: number) => (el: HTMLElement | null) => { revealRefs.current[i] = el; };

  return (
    <div className="landing-page">
      <Navbar />
      <Hero />

      {/* ── Stats bar ──────────────────────────────────────── */}
      <div className="stats-bar" ref={reveal(0)}>
        <div className="stats-bar-inner reveal-item" ref={reveal(0)}>
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="stat-ticker">
                <span className="stat-ticker-value">{s.value}</span>
                <span className="stat-ticker-label">{s.label}</span>
              </div>
              {i < STATS.length - 1 && <div className="stat-ticker-divider" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="features" id="features">
        <div className="features-inner">
          <div className="section-heading reveal-item" ref={reveal(1) as any}>
            <p className="section-eyebrow"><Sparkles size={12} /> Why PinGuru</p>
            <h2 className="section-title">Everything you need to automate DMs</h2>
            <p className="section-desc">
              No code. No integrations. Just connect Instagram and your rules go live instantly.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card reveal-item"
                ref={reveal(2 + i) as any}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="how-it-works" id="how-it-works">
        <div className="how-inner">
          <div className="section-heading reveal-item" ref={reveal(6) as any}>
            <p className="section-eyebrow"><Clock size={12} /> Simple setup</p>
            <h2 className="section-title">Live in under 5 minutes</h2>
            <p className="section-desc">No developer needed. No Zapier. No API keys to manage.</p>
          </div>
          <div className="how-steps">
            {[
              { n: '01', title: 'Create your account',   desc: 'Sign up free — no credit card required.' },
              { n: '02', title: 'Connect Instagram',      desc: 'Authorize PinGuru with one click via Meta OAuth.' },
              { n: '03', title: 'Build automation rules', desc: 'Choose triggers, set keywords, write your reply template.' },
              { n: '04', title: 'Watch DMs get answered', desc: 'Every matching DM gets a personalized, instant reply.' },
            ].map((step, i) => (
              <div
                key={step.n}
                className="how-step reveal-item"
                ref={reveal(7 + i) as any}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="how-step-number">{step.n}</div>
                <h4 className="how-step-title">{step.title}</h4>
                <p className="how-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Automation Demo Section ─────────────────────────── */}
      <section className="demo-section">
        <div className="demo-inner">
          <div className="demo-text reveal-item" ref={reveal(11) as any}>
            <p className="section-eyebrow"><Target size={12} /> See it in action</p>
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              One rule. Hundreds of<br />personalized replies.
            </h2>
            <p className="section-desc" style={{ textAlign: 'left' }}>
              Set a keyword trigger, write your template with {'{name}'} and {'{keyword}'} variables,
              and PinGuru handles the rest — every time, instantly.
            </p>
            <div className="demo-bullets">
              {[
                { text: <><strong>Comment trigger</strong> — someone comments "LINK" → they get a DM automatically</> },
                { text: <><strong>Keyword DM</strong> — someone DMs "price" → instant reply with your pricing</> },
                { text: <><strong>Story mention</strong> — fan mentions your story → automated thank-you DM</> },
              ].map((b, i) => (
                <div key={i} className="demo-bullet">
                  <div className="demo-bullet-icon"><Check size={12} /></div>
                  <p className="demo-bullet-text">{b.text}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <Link to="/register" className="btn-primary">
                Try it free <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Phone preview */}
          <div className="demo-phone-wrap reveal-item" ref={reveal(12) as any}>
            <div className="demo-phone">
              <div className="demo-phone-notch" />
              <div className="demo-phone-screen">
                <div className="demo-phone-topbar">
                  <div className="demo-phone-avatar" />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1c1e21' }}>@yourbrand</div>
                    <div style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>● Automated</div>
                  </div>
                </div>
                <div className="demo-phone-chat">
                  <div className="dm-bubble-in">
                    Hey! I saw your post — what's the price? 💰
                    <div className="dm-time-in">2:41 PM</div>
                  </div>
                  <div className="dm-bubble-out">
                    <div className="dm-name">Hey Rahul! 👋</div>
                    Thanks for reaching out! Our pricing starts at ₹199/mo for the Starter plan.
                    <br /><br />
                    🔗 Full details: pinguru.me/pricing
                    <div className="dm-time">2:41 PM ✓✓</div>
                  </div>
                  <div className="dm-bubble-in" style={{ marginTop: 4 }}>
                    Wow that was fast!! 😮
                    <div className="dm-time-in">2:42 PM</div>
                  </div>
                  <div style={{
                    background: 'rgba(124,58,237,0.08)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: '0.65rem',
                    color: '#7C3AED',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginTop: 4,
                  }}>
                    <Zap size={10} /> Rule: "price" keyword triggered
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="testimonials">
        <div className="testimonials-inner">
          <div className="section-heading reveal-item" ref={reveal(13) as any}>
            <p className="section-eyebrow"><Star size={12} /> Loved by creators</p>
            <h2 className="section-title">Real results from real users</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.handle}
                className="testimonial-card reveal-item"
                ref={reveal(14 + i) as any}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-handle">{t.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog Preview ────────────────────────────────────── */}
      <section className="blog-preview">
        <div className="blog-preview-inner">
          <div className="blog-preview-header">
            <div>
              <p className="section-eyebrow"><BookOpen size={12} /> From the blog</p>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Tips, guides & strategies
              </h2>
            </div>
            <Link
              to="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              View all posts <ArrowRight size={14} />
            </Link>
          </div>
          <div className="blog-grid">
            {BLOG_POSTS.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="blog-card reveal-item"
                ref={reveal(17 + i) as any}
                style={{ transitionDelay: `${i * 95}ms` }}
              >
                <div className="blog-card-thumb" style={{ background: post.bg }}>
                  {post.emoji}
                </div>
                <div className="blog-card-body">
                  <span className="blog-card-tag">{post.tag}</span>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-meta">
                    <Clock size={11} /> {post.readTime}
                    <span style={{ margin: '0 4px', color: 'var(--color-border)' }}>·</span>
                    {post.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section className="pricing" id="pricing">
        <div className="pricing-inner">
          <div className="section-heading reveal-item" ref={reveal(20) as any}>
            <p className="section-eyebrow">Simple pricing</p>
            <h2 className="section-title">Start free, scale when you need to</h2>
            <p className="section-desc">All prices in Indian Rupees. Cancel anytime, no lock-in.</p>
          </div>
          <div className="pricing-grid">
            {PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className={`landing-plan-card reveal-item ${plan.popular ? 'popular' : ''}`}
                ref={reveal(21 + i) as any}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                {plan.popular && <div className="landing-plan-badge">⚡ Most Popular</div>}
                <div className="landing-plan-name">{plan.name}</div>
                <div className="landing-plan-desc">{plan.desc}</div>
                <div className="landing-plan-price">
                  {plan.price === 0 ? (
                    <>
                      <span className="landing-plan-amount">₹0</span>
                      <span className="landing-plan-period">&nbsp;forever</span>
                    </>
                  ) : (
                    <>
                      <span className="landing-plan-currency">₹</span>
                      <span className="landing-plan-amount">{plan.price}</span>
                      <span className="landing-plan-period">/mo</span>
                    </>
                  )}
                </div>
                <ul className="landing-plan-features">
                  {plan.features.map(f => (
                    <li key={f} className="landing-plan-feature">
                      <span className="plan-check"><Check size={10} /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.ctaTo}
                  className={`landing-plan-cta ${plan.popular ? 'cta-white' : 'cta-primary'}`}
                >
                  {plan.cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="cta-banner reveal-item" ref={reveal(24) as any}>
        <div className="cta-banner-inner">
          <h2 className="cta-title">Ready to automate your DMs?</h2>
          <p className="cta-desc">
            Join thousands of creators and businesses already using PinGuru to convert every DM into an opportunity.
          </p>
          <Link
            to="/register"
            className="btn-primary"
            style={{ background: 'white', color: 'var(--color-primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
          >
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-top">
            {/* Brand column */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="footer-logo-mark">PG</div>
                <span className="footer-logo-text">PinGuru</span>
              </Link>
              <p className="footer-tagline">
                Automate your Instagram DMs with smart, compliance-first rules. Built for creators and businesses.
              </p>
              <div className="footer-social">
                <a href="https://twitter.com/pinguru" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Twitter">
                  <Twitter size={15} />
                </a>
                <a href="https://instagram.com/pinguru" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                  <Instagram size={15} />
                </a>
                <a href="https://linkedin.com/company/pinguru" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                  <Linkedin size={15} />
                </a>
                <a href="mailto:support@pinguru.me" className="footer-social-link" aria-label="Email">
                  <Mail size={15} />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-col-links">
                <a href="#features"     className="footer-col-link">Features</a>
                <a href="#pricing"      className="footer-col-link">Pricing</a>
                <a href="#how-it-works" className="footer-col-link">How It Works</a>
                <Link to="/register"    className="footer-col-link">Get Started</Link>
                <Link to="/login"       className="footer-col-link">Sign In</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <div className="footer-col-title">Company</div>
              <div className="footer-col-links">
                <Link to="/blog"    className="footer-col-link">Blog</Link>
                <Link to="/support" className="footer-col-link">Support Center</Link>
                <a href="mailto:hello@pinguru.me" className="footer-col-link">Contact Us</a>
                <a href="mailto:partners@pinguru.me" className="footer-col-link">Partnerships</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <div className="footer-col-title">Legal</div>
              <div className="footer-col-links">
                <Link to="/privacy" className="footer-col-link">Privacy Policy</Link>
                <Link to="/terms"   className="footer-col-link">Terms of Service</Link>
                <Link to="/refund"  className="footer-col-link">Refund Policy</Link>
              </div>

              {/* Newsletter */}
              <div className="footer-newsletter" style={{ marginTop: 28 }}>
                <div className="footer-newsletter-title">Stay in the loop</div>
                <div className="footer-newsletter-desc">Tips, product updates, and more.</div>
                <div className="footer-newsletter-form">
                  <input
                    type="email"
                    className="footer-newsletter-input"
                    placeholder="you@email.com"
                  />
                  <button className="footer-newsletter-btn">→</button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              © {new Date().getFullYear()} PinGuru. All rights reserved. Made with ❤️ in India.
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacy" className="footer-bottom-link">Privacy</Link>
              <Link to="/terms"   className="footer-bottom-link">Terms</Link>
              <a href="mailto:support@pinguru.me" className="footer-bottom-link">support@pinguru.me</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
