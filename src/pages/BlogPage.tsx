import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock, Search, BookOpen, Tag, ChevronRight } from 'lucide-react';
import '../styles/landing.css';

const CATEGORIES = ['All', 'Tutorial', 'Strategy', 'Compliance', 'Case Study', 'Product'];

const POSTS = [
  {
    slug: 'first-automation',
    tag: 'Tutorial',
    tagColor: '#7C3AED',
    tagBg: '#EDE9FE',
    emoji: '📱',
    bg: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
    title: 'How to set up your first Instagram DM automation in 5 minutes',
    excerpt: 'A step-by-step walkthrough for creators who want instant DM responses without any coding. We cover trigger types, template variables, and going live.',
    body: [
      'Your first automation should be simple enough to launch confidently and useful enough to prove the channel. Start with one clear intent, such as sending a product link when someone comments a keyword or replying with a lead magnet when a follower DMs "guide". This keeps testing focused and makes it easy to understand what happened after the rule goes live.',
      'Inside PinGuru, create a new rule, choose the trigger that matches the behavior you want, and write a response that sounds like your brand. The best first templates are short, friendly, and direct: greet the person, acknowledge the trigger, then deliver the promised next step. If you are using template variables, preview the message before activating so names, links, and fallback text read naturally.',
      'Before turning the rule on, test the exact keyword or comment path with a secondary Instagram account. Confirm that the Instagram connection is healthy, the rule is active, and the message respects Meta messaging windows. A few minutes of testing prevents duplicate rules, confusing replies, or missed leads once your audience starts interacting.',
      'After launch, watch the dashboard for message volume and early replies. You do not need a complicated funnel on day one. Once the first rule reliably delivers value, duplicate the pattern for your next offer and improve based on the questions people actually ask in DMs.',
    ],
    date: 'Apr 10, 2025',
    readTime: '4 min read',
    featured: true,
  },
  {
    slug: 'dm-funnel-strategy',
    tag: 'Strategy',
    tagColor: '#0891B2',
    tagBg: '#CFFAFE',
    emoji: '📊',
    bg: 'linear-gradient(135deg, #CFFAFE, #A5F3FC)',
    title: 'The Instagram DM funnel: how top creators convert followers into customers',
    excerpt: 'Real case studies from creators earning 6 figures using automated DM sequences — from first touch to sale.',
    body: [
      'A strong Instagram DM funnel starts before the automation fires. Top creators make a specific promise in a reel, story, or caption, then invite followers to reply with a precise keyword. That public prompt sets context, so the first automated message feels expected instead of random.',
      'The first DM should deliver the promised value immediately. From there, the funnel can ask one lightweight qualifying question, send a relevant link, or route the person to a human follow-up. The key is sequencing: every message should make the next step easier, not add friction.',
      'Creators who convert consistently also segment intent. Someone asking for a free checklist should not receive the same follow-up as someone asking for pricing. Use separate keywords or rules for each campaign so your reporting and message tone stay aligned with the user journey.',
      'Measure the funnel by outcomes, not just message count. Track which triggers generate replies, which templates earn clicks, and where people stop responding. Those signals help you refine the public call to action and the private DM path together.',
    ],
    date: 'Mar 28, 2025',
    readTime: '7 min read',
    featured: false,
  },
  {
    slug: 'meta-policy-guide',
    tag: 'Compliance',
    tagColor: '#D97706',
    tagBg: '#FEF3C7',
    emoji: '🛡️',
    bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    title: "Meta's Instagram Messaging Policy: what every creator needs to know",
    excerpt: "A plain-English breakdown of the 24-hour window rule, broadcast restrictions, and how PinGuru keeps you 100% compliant.",
    body: [
      'Meta messaging rules are designed to keep Instagram DMs conversational and user-initiated. For automation, the most important idea is that messages should respond to a real action from the user, such as a DM, comment, or story mention, instead of behaving like unsolicited broadcasts.',
      'The 24-hour messaging window matters because it defines when follow-up messages are appropriate. If someone interacts with your account, you can reply within the allowed window with relevant information. Outside of that context, avoid promotional sequences that the user did not request.',
      'PinGuru is built around compliant triggers, rate limits, and account controls so creators can automate useful replies without turning DMs into spam. You should still write messages that match the original user intent and avoid misleading keywords, surprise promotions, or excessive follow-ups.',
      'Compliance is also a trust strategy. When followers receive the link, answer, or resource they asked for, they are more likely to reply, buy, and keep engaging. Treat policy rules as guardrails for a better customer experience, not just a technical requirement.',
    ],
    date: 'Mar 14, 2025',
    readTime: '5 min read',
    featured: false,
  },
  {
    slug: 'keyword-triggers-deep-dive',
    tag: 'Tutorial',
    tagColor: '#7C3AED',
    tagBg: '#EDE9FE',
    emoji: '🔑',
    bg: 'linear-gradient(135deg, #F3E8FF, #E9D5FF)',
    title: 'Keyword triggers deep dive: build flows that actually convert',
    excerpt: 'Learn how to pick the right keywords, use negative keywords, and structure responses that guide users toward purchase.',
    body: [
      'Keyword triggers work best when the keyword is memorable, campaign-specific, and unlikely to appear by accident. Words like "price", "guide", or "demo" are easy for followers to type, but you should connect each one to a clear public prompt so the automation has context.',
      'Avoid using too many keywords in one rule. A broad rule may catch more messages, but it can also send generic replies to people with different intentions. Separate your lead magnet, product, and support keywords so every automated response feels tailored.',
      'Your response should mirror the promise that created the trigger. If the caption says "comment GUIDE for the checklist", the first DM should send or link to that checklist before introducing anything else. Conversion improves when the user receives value before the ask.',
      'Review keyword performance after each campaign. If a keyword brings in volume but few replies, update the public call to action or simplify the DM. If a lower-volume keyword produces better buyers, build more content around that intent.',
    ],
    date: 'Feb 20, 2025',
    readTime: '6 min read',
    featured: false,
  },
  {
    slug: 'story-mention-automation',
    tag: 'Strategy',
    tagColor: '#0891B2',
    tagBg: '#CFFAFE',
    emoji: '✨',
    bg: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
    title: 'Story mention automation: the fastest way to grow your DM list',
    excerpt: 'When someone tags you in their story, it\'s a high-intent signal. Here\'s how to automate a follow-up DM that drives real results.',
    body: [
      'A story mention is one of the warmest signals on Instagram because the follower is publicly associating with your brand. Responding quickly helps you turn that moment into a conversation while the interaction is still fresh.',
      'The best automated story mention reply sounds personal even when it is structured. Thank the person for the tag, acknowledge the context, and offer a natural next step such as a discount link, a resource, or a question that invites a human reply.',
      'Use story mention automations for community flywheels. For launches, ask customers to tag you when they share results. For creator campaigns, reward mentions with a helpful follow-up. The automation makes sure no warm interaction disappears in the inbox.',
      'Keep the message concise and avoid over-selling. A story mention already signals interest; your job is to make the person feel seen and guide them toward the next useful action.',
    ],
    date: 'Feb 8, 2025',
    readTime: '5 min read',
    featured: false,
  },
  {
    slug: 'analytics-guide',
    tag: 'Product',
    tagColor: '#DB2777',
    tagBg: '#FCE7F3',
    emoji: '📈',
    bg: 'linear-gradient(135deg, #FCE7F3, #FBCFE8)',
    title: 'Understanding your PinGuru analytics: a complete guide',
    excerpt: 'Success rate, peak hours, DM volume trends — here\'s how to read your analytics dashboard and actually improve your automations.',
    body: [
      'Analytics are most useful when they answer a specific operating question. Instead of checking charts passively, look for patterns: which campaigns create spikes, which days produce replies, and whether your active rules are driving the behavior you expected.',
      'DM volume shows demand, but success rate helps you understand quality. If messages are being sent but replies or completions are low, revisit the trigger promise and response template. The automation may be working technically while the offer needs clearer positioning.',
      'Peak-hour and best-day insights help you schedule content around when followers are most likely to engage. Pair those signals with campaign notes so you can distinguish normal audience behavior from one-off launches, collaborations, or viral posts.',
      'Use analytics as a weekly feedback loop. Keep the rules that create qualified conversations, pause the ones that no longer serve a campaign, and test one improvement at a time so you know what actually changed performance.',
    ],
    date: 'Jan 25, 2025',
    readTime: '4 min read',
    featured: false,
  },
];

const BlogPage: React.FC = () => {
  const { slug } = useParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const featuredPost = POSTS.find(p => p.featured);
  const articlePost = slug ? POSTS.find(p => p.slug === slug) : undefined;
  const filteredPosts = POSTS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.tag === activeCategory;
    return matchesSearch && matchesCategory && !p.featured;
  });

  if (slug) {
    if (!articlePost) {
      return (
        <div className="landing-page blog-detail-page">
          <section className="blog-detail-hero">
            <div className="blog-detail-hero-inner">
              <span className="blog-detail-kicker"><BookOpen size={12} /> Article not found</span>
              <h1>We could not find that guide.</h1>
              <p>The article may have moved. Return to the blog to browse the latest Instagram automation resources.</p>
              <Link to="/blog" className="blog-detail-back">Back to blog <ArrowRight size={15} /></Link>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="landing-page blog-detail-page">
        <section className="blog-detail-hero">
          <div className="blog-detail-hero-inner">
            <Link to="/blog" className="blog-detail-back muted"><ChevronRight size={14} /> Blog</Link>
            <span className="blog-detail-kicker" style={{ background: articlePost.tagBg, color: articlePost.tagColor }}>
              <Tag size={12} /> {articlePost.tag}
            </span>
            <h1>{articlePost.title}</h1>
            <p>{articlePost.excerpt}</p>
            <div className="blog-detail-meta">
              <Clock size={14} /> {articlePost.readTime}
              <span>·</span>
              {articlePost.date}
            </div>
          </div>
        </section>

        <main className="blog-detail-shell">
          <div className="blog-detail-cover" style={{ background: articlePost.bg }}>
            <span>{articlePost.emoji}</span>
          </div>
          <article className="blog-detail-article">
            {articlePost.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
          <div className="blog-detail-cta">
            <div>
              <h2>Ready to turn this into a live workflow?</h2>
              <p>Start with a free PinGuru account and launch your first compliant Instagram DM automation.</p>
            </div>
            <Link to="/register" className="btn-primary">Get started free <ArrowRight size={16} /></Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* ── Blog Hero ───────────────────────────── */}
      <div style={{
        background: 'linear-gradient(145deg, #0D0B1E 0%, #1A1040 50%, #220D3A 100%)',
        padding: '80px 24px 64px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 60%, rgba(124,58,237,0.3), transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999,
            background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.4)',
            color: '#A78BFA', fontSize: '0.8rem', fontWeight: 600, marginBottom: 20,
          }}>
            <BookOpen size={12} /> PinGuru Blog
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800, color: 'white', letterSpacing: '-0.04em', marginBottom: 16,
          }}>
            Tips, guides &amp; strategies
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.0625rem', maxWidth: 500, margin: '0 auto' }}>
            Learn how to grow your Instagram business with smart DM automation.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

        {/* ── Search + Filters ─────────────────── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              style={{
                width: '100%',
                padding: '11px 14px 11px 42px',
                background: 'white',
                border: '1.5px solid var(--color-border)',
                borderRadius: 12,
                fontSize: '0.9rem',
                color: 'var(--color-text)',
                outline: 'none',
                transition: 'border-color 150ms',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: activeCategory === cat ? 'none' : '1.5px solid var(--color-border)',
                  background: activeCategory === cat ? 'var(--gradient-brand)' : 'white',
                  color: activeCategory === cat ? 'white' : 'var(--color-text-secondary)',
                  fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Featured Post ─────────────────────── */}
        {featuredPost && activeCategory === 'All' && !search && (
          <Link
            to={`/blog/${featuredPost.slug}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              background: 'white',
              borderRadius: 20,
              border: '1.5px solid var(--color-border)',
              overflow: 'hidden',
              textDecoration: 'none',
              marginBottom: 40,
              transition: 'all 250ms',
              boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(124,58,237,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(124,58,237,0.08)'; }}
          >
            <div style={{
              background: featuredPost.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '5rem', minHeight: 280,
            }}>
              {featuredPost.emoji}
            </div>
            <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 999,
                  background: featuredPost.tagBg, color: featuredPost.tagColor,
                  fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {featuredPost.tag}
                </span>
                <span style={{
                  padding: '4px 12px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)',
                  color: '#7C3AED', fontSize: '0.75rem', fontWeight: 700,
                }}>
                  ✨ Featured
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.4rem',
                fontWeight: 800, color: 'var(--color-text)',
                lineHeight: 1.3, marginBottom: 14,
              }}>
                {featuredPost.title}
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: 20 }}>
                {featuredPost.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                <Clock size={12} /> {featuredPost.readTime} &nbsp;·&nbsp; {featuredPost.date}
              </div>
            </div>
          </Link>
        )}

        {/* ── Posts grid ───────────────────────── */}
        {filteredPosts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {filteredPosts.map(post => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="blog-card"
              >
                <div className="blog-card-thumb" style={{ background: post.bg }}>
                  {post.emoji}
                </div>
                <div className="blog-card-body">
                  <span
                    className="blog-card-tag"
                    style={{ background: post.tagBg, color: post.tagColor }}
                  >
                    {post.tag}
                  </span>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-meta">
                    <Clock size={11} /> {post.readTime}
                    <span style={{ margin: '0 4px' }}>·</span>
                    {post.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-muted)' }}>
            <BookOpen size={32} style={{ margin: '0 auto 16px', color: 'var(--color-border)' }} />
            <p style={{ fontSize: '0.9375rem' }}>No articles found. Try a different search.</p>
          </div>
        )}

        {/* ── CTA strip ─────────────────────────── */}
        <div style={{
          marginTop: 64,
          background: 'var(--gradient-hero)',
          borderRadius: 20,
          padding: '40px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 8 }}>
              Ready to automate your DMs?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem' }}>
              Join PinGuru free — no credit card required.
            </p>
          </div>
          <Link to="/register" className="btn-primary" style={{ flexShrink: 0 }}>
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
