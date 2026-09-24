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
    <header className="h-14 sm:h-16 px-3.5 sm:px-6 border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-3 shadow-xs">
      {/* Zone 1: Brand & Page Title */}
      <div className="flex items-center gap-2 min-w-0">
        <div 
          onClick={() => navigate('/dashboard')}
          className="md:hidden flex items-center gap-2 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 sm:inline-block hidden">
            PinGuru
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm min-w-0">
          <span className="text-slate-400 font-medium">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 tracking-tight truncate">
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
            className="w-full bg-slate-100/80 border border-slate-200/60 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 text-slate-800 placeholder:text-slate-400 rounded-xl pl-10 pr-4 py-2 text-xs min-h-[38px] transition-all outline-none"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Connection status tag */}
        <div 
          onClick={() => navigate('/connect')}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-[11px] text-slate-700 font-medium cursor-pointer hover:border-violet-300 shadow-2xs transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${user?.instagram_connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-mono text-slate-800">
            {user?.instagram_connected ? `@${user.instagram_username || 'connected'}` : 'Connect IG'}
          </span>
        </div>

        {/* Create Rule CTA */}
        <button
          onClick={onOpenNewRuleModal}
          className="min-h-[42px] px-3.5 sm:px-4 py-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-semibold shadow-[0_8px_20px_-4px_rgba(124,58,237,0.35)] hover:shadow-[0_12px_24px_-4px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Automation</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200/60 cursor-pointer min-h-[42px]"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1.5px] shadow-xs">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-violet-700 text-xs font-bold uppercase">
                {displayName.slice(0, 2)}
              </div>
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-900 truncate max-w-[120px]">{displayName}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.plan || 'Free'} Plan</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{displayName}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-violet-600" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/billing');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Manage Subscription</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/connect');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-pink-500" />
                <span>Instagram Connection</span>
              </button>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
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
