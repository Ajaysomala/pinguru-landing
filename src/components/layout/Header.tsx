import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Plus, 
  User, 
  LogOut, 
  ChevronDown, 
  Zap,
  Share2,
  Settings
} from 'lucide-react';
import { useAuth } from '../../App';
import { logout } from '../../lib/api';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  onOpenNewRuleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewRuleModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/rules') || pathname.startsWith('/automations')) return 'Automations Studio';
    if (pathname.startsWith('/connect')) return 'Instagram Connect';
    if (pathname.startsWith('/analytics')) return 'Analytics & Insights';
    if (pathname.startsWith('/settings')) return 'Settings & Security';
    if (pathname.startsWith('/billing')) return 'Plan & Billing';
    if (pathname.startsWith('/contacts')) return 'Contacts & Leads';
    return 'Dashboard';
  };

  const displayName = user?.display_name || user?.first_name || (user?.email ? user.email.split('@')[0] : 'Creator');
  const initials = (displayName.slice(0, 2) || 'PG').toUpperCase();
  const planLabel = user?.plan ? `${user.plan.toUpperCase()} Tier` : 'Pro Tier';

  return (
    <header className="h-16 px-4 sm:px-8 lg:px-12 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-3 shadow-xs">
      {/* Zone 1: Brand & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div 
          onClick={() => navigate('/dashboard')}
          className="md:hidden flex items-center gap-2 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white sm:inline-block hidden">
            PinGuru
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm min-w-0">
          <span className="text-slate-500 dark:text-zinc-500 font-medium">Workspace</span>
          <span className="text-slate-400 dark:text-zinc-600">/</span>
          <span className="font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {getPageTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* Zone 2: Search & Live Status */}
      <div className="flex-1 max-w-md mx-2 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, rules, campaigns..."
            className="w-full bg-slate-50 dark:bg-[#121218]/90 border border-slate-200 dark:border-white/10 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-xl pl-10 pr-4 py-2 text-xs min-h-[38px] transition-all outline-none"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Connection status tag */}
        <div 
          onClick={() => navigate('/connect')}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#121218]/80 border border-slate-200 dark:border-white/10 text-[11px] text-slate-700 dark:text-zinc-300 font-medium cursor-pointer hover:border-indigo-500/40 shadow-xs transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${user?.instagram_connected ? 'bg-cyan-400 shadow-[0_0_8px_#06B6D4] animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-mono text-slate-900 dark:text-zinc-200 font-semibold">
            {user?.instagram_connected ? `@${user.instagram_username || 'connected'}` : 'Connect IG'}
          </span>
        </div>

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />

        {/* Create Rule CTA */}
        <button
          onClick={onOpenNewRuleModal}
          className="min-h-[40px] px-3.5 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Automation</span>
        </button>

        {/* User Profile Photo Avatar Dropdown Button */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User account menu"
            aria-expanded={showUserMenu}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer min-h-[42px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <div className="w-10 h-10 rounded-full border border-indigo-500/30 hover:border-indigo-500 transition-all cursor-pointer overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-[#121218] relative group shrink-0">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold uppercase tracking-tight">
                  {initials}
                </div>
              )}
            </div>

            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{displayName}</div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-medium">{planLabel}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 hidden xl:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#121218]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
              <div className="px-3.5 py-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
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
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Profile Settings</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/connect');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <Share2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>API Connections</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/billing');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Plan Status ({planLabel})</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <span>Settings & Security</span>
              </button>

              <div className="pt-1 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer transition-colors"
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
