import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Search, BookOpen, Zap, TrendingUp, ShieldCheck, Tag, ChevronRight } from 'lucide-react';
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
    date: 'Jan 25, 2025',
    readTime: '4 min read',
    featured: false,
  },
];

const BlogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const featuredPost = POSTS.find(p => p.featured);
  const filteredPosts = POSTS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.tag === activeCategory;
    return matchesSearch && matchesCategory && !p.featured;
  });

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
