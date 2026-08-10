import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, CircleHelp, Search, Camera, Zap, CreditCard, Settings } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
  desktop?: boolean;
}

const QUICK_LINKS = [
  { label: 'Connect Instagram', href: '/connect', icon: Camera, keywords: 'instagram connect oauth' },
  { label: 'Automation Rules', href: '/rules', icon: Zap, keywords: 'rules automation dm' },
  { label: 'Billing & Plans', href: '/billing', icon: CreditCard, keywords: 'billing plans upgrade razorpay' },
  { label: 'Settings', href: '/settings', icon: Settings, keywords: 'profile account privacy delete' },
  { label: 'Support', href: '/support', icon: CircleHelp, keywords: 'help support faq' },
];

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title, desktop = false }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUICK_LINKS.slice(0, 4);
    return QUICK_LINKS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.keywords.includes(q),
    );
  }, [query]);

  const go = (href: string) => {
    setQuery('');
    setOpen(false);
    navigate(href);
  };

  return (
    <header className={`pg-topbar ${desktop ? 'pg-topbar-desktop' : 'pg-topbar-mobile'}`}>
      <div className="pg-topbar-left">
        {!desktop && (
          <button
            type="button"
            onClick={onMenuClick}
            className="pg-topbar-icon-btn"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
        <BrandLogo to="/dashboard" size={desktop ? 'md' : 'sm'} />
        {title && desktop && <span className="pg-topbar-page-title">{title}</span>}
      </div>

      <div className="pg-topbar-search-wrap">
        <label className="pg-topbar-search" htmlFor="pg-global-search">
          <Search size={16} className="pg-topbar-search-icon" />
          <input
            id="pg-global-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search pages, Instagram, rules..."
            autoComplete="off"
          />
        </label>
        {open && (
          <div className="pg-topbar-search-results" role="listbox">
            {results.length === 0 ? (
              <p className="pg-topbar-search-empty">No matches</p>
            ) : (
              results.map(({ label, href, icon: Icon }) => (
                <button
                  key={href}
                  type="button"
                  className="pg-topbar-search-item"
                  onMouseDown={() => go(href)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="pg-topbar-right">
        <Link to="/support" className="pg-topbar-icon-btn" aria-label="Open support">
          <CircleHelp size={19} />
        </Link>
      </div>
    </header>
  );
};
