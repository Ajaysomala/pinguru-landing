import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, CircleHelp, Search, Camera, Zap, CreditCard, Settings, User, LogOut, ChevronDown, Sparkles, Share2 } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { useAuth } from '../../App';
import { logout } from '../../lib/api';
import { ThemeToggle } from '../ui/ThemeToggle';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

const QUICK_LINKS = [
  { label: 'Connect Instagram', href: '/connect', icon: Camera, keywords: 'instagram connect oauth' },
  { label: 'Automation Rules', href: '/rules', icon: Zap, keywords: 'rules automation dm' },
  { label: 'Billing & Plans', href: '/billing', icon: CreditCard, keywords: 'billing plans upgrade razorpay' },
  { label: 'Settings', href: '/settings', icon: Settings, keywords: 'profile account privacy delete' },
  { label: 'Support', href: '/support', icon: CircleHelp, keywords: 'help support faq' },
];

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return user?.avatar_url || localStorage.getItem('pinguru_user_avatar') || null;
  });
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatarUrl(user?.avatar_url || localStorage.getItem('pinguru_user_avatar') || null);
    };
    window.addEventListener('pinguru_avatar_updated', handleAvatarUpdate);
    window.addEventListener('storage', handleAvatarUpdate);
    return () => {
      window.removeEventListener('pinguru_avatar_updated', handleAvatarUpdate);
      window.removeEventListener('storage', handleAvatarUpdate);
    };
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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

  const displayName = user?.display_name || user?.first_name || (user?.email ? user.email.split('@')[0] : 'Creator');
  const initials = (displayName.slice(0, 2) || 'PG').toUpperCase();
  const planLabel = user?.plan ? `${user.plan.toUpperCase()} Tier` : 'Pro Tier';

  return (
    <header className="pg-topbar bg-[#09090B]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      <div className="pg-topbar-left flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="pg-topbar-icon-btn pg-topbar-menu-btn text-zinc-400 hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <BrandLogo to="/dashboard" size="sm" className="pg-topbar-brand-sm" />
        <BrandLogo to="/dashboard" size="md" className="pg-topbar-brand-md" />
        {title && <span className="pg-topbar-page-title text-slate-900 dark:text-white font-bold text-sm tracking-tight">{title}</span>}
      </div>

      <div className="pg-topbar-search-wrap flex-1 max-w-md mx-2">
        <label className="pg-topbar-search relative block" htmlFor="pg-global-search">
          <Search size={16} className="pg-topbar-search-icon text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
            placeholder="Search pages..."
            aria-label="Search pages"
            autoComplete="off"
            className="w-full bg-white dark:bg-[#121218] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500/60"
          />
        </label>
        {open && (
          <div className="pg-topbar-search-results absolute mt-1 w-full max-w-md bg-white dark:bg-[#121218]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-1 z-50" role="listbox">
            {results.length === 0 ? (
              <p className="pg-topbar-search-empty p-3 text-xs text-slate-500 dark:text-zinc-500">No matches</p>
            ) : (
              results.map(({ label, href, icon: Icon }) => (
                <button
                  key={href}
                  type="button"
                  className="pg-topbar-search-item w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-left cursor-pointer"
                  onMouseDown={() => go(href)}
                >
                  <Icon size={16} className="text-cyan-500 dark:text-cyan-400" />
                  <span>{label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="pg-topbar-right flex items-center gap-3">
        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />

        <Link to="/support" className="pg-topbar-icon-btn text-zinc-400 hover:text-white" aria-label="Open support">
          <CircleHelp size={19} />
        </Link>

        {/* User Profile Photo Avatar Dropdown Button */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User account menu"
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full border border-indigo-500/30 hover:border-indigo-500 transition-all cursor-pointer overflow-hidden flex items-center justify-center bg-[#121218] shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold uppercase tracking-tight">
                  {initials}
                </div>
              )}
            </div>
            <ChevronDown size={14} className="text-zinc-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#121218]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-2 z-50 space-y-1">
              <div className="px-3.5 py-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    {planLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{user?.email}</div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings/profile');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2.5 cursor-pointer"
              >
                <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Profile Settings</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/connect');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>API Connections</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/billing');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Plan Status ({planLabel})</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2.5 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <span>Settings & Security</span>
              </button>

              <div className="pt-1 border-t border-white/5">
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
