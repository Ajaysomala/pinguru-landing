import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Plus, 
  User, 
  LogOut, 
  ChevronDown, 
  ExternalLink,
  Zap,
  Radio,
  Share2
} from 'lucide-react';
import { useAuth } from '../../App';
import { logout } from '../../lib/api';

interface HeaderProps {
  onOpenNewRuleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewRuleModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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

  return (
    <header className="h-14 sm:h-16 px-3.5 sm:px-6 border-b border-white/[0.07] bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between gap-3">
      {/* Zone 1: Brand & Page Title */}
      <div className="flex items-center gap-2 min-w-0">
        <div 
          onClick={() => navigate('/dashboard')}
          className="md:hidden flex items-center gap-2 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent sm:inline-block hidden">
            PinGuru
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm min-w-0">
          <span className="text-slate-400 font-medium">Workspace</span>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-white tracking-tight truncate">
            {getPageTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* Zone 2: Search & Live Status */}
      <div className="flex-1 max-w-md mx-2 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, rules, campaigns..."
            className="w-full bg-slate-900/90 border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 min-h-[38px] transition-all"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Connection status tag */}
        <div 
          onClick={() => navigate('/connect')}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-white/[0.08] text-[11px] text-slate-300 font-medium cursor-pointer hover:border-purple-500/30 transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${user?.instagram_connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-mono text-slate-200">
            {user?.instagram_connected ? `@${user.instagram_username || 'connected'}` : 'Connect IG'}
          </span>
        </div>

        {/* Create Rule CTA */}
        <button
          onClick={onOpenNewRuleModal}
          className="min-h-[40px] px-3.5 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Automation</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.08] cursor-pointer min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] shadow-sm">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-white text-xs font-bold uppercase">
                {displayName.slice(0, 2)}
              </div>
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-bold text-white truncate max-w-[120px]">{displayName}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.plan || 'Free'} Plan</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/[0.1] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <div className="text-xs font-bold text-white">{displayName}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/billing');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Manage Subscription</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/connect');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram Connection</span>
              </button>

              <div className="pt-1 border-t border-white/[0.06]">
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
