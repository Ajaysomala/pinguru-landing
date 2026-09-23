import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  Share2, 
  BarChart3, 
  Settings, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Instagram,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Users
} from 'lucide-react';
import { useAuth } from '../../App';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false, 
  onToggleCollapse = () => {} 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Automations Studio', path: '/rules', icon: Zap },
    { label: 'Instagram Connect', path: '/connect', icon: Share2 },
    { label: 'Analytics & Insights', path: '/analytics', icon: BarChart3 },
    { label: 'Contacts & Leads', path: '/contacts', icon: Users },
    { label: 'Plan & Billing', path: '/billing', icon: CreditCard },
    { label: 'Settings & Security', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`hidden md:flex ${
        collapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 ease-in-out border-r border-white/[0.08] bg-slate-950 flex-col shrink-0 select-none z-40 relative h-full`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-white/[0.08] flex items-center justify-between">
        {!collapsed ? (
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent flex items-center gap-1.5">
                PinGuru
                <span className="text-[9px] font-mono tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                  SUITE
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/rules' && location.pathname.startsWith('/rules'));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0' : 'justify-between px-3.5'
              } py-2.5 rounded-2xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/25 via-purple-600/20 to-pink-600/15 text-white border border-purple-500/40 shadow-sm shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Account Status Panel */}
      <div className="p-3 border-t border-white/[0.08] space-y-3">
        {!collapsed ? (
          <>
            {/* Instagram Link Mini Card */}
            <div 
              onClick={() => navigate('/connect')}
              className="p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/[0.08] space-y-2 cursor-pointer hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span className="font-mono text-slate-200 font-bold truncate max-w-[120px]">
                    {user?.instagram_connected ? `@${user.instagram_username || 'connected'}` : 'Not connected'}
                  </span>
                </div>
                {user?.instagram_connected ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                ) : (
                  <span className="text-[10px] text-amber-400 font-semibold">Connect</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {user?.instagram_connected ? 'Meta Graph API v20.0 Active' : 'Click to connect Instagram account'}
              </p>
            </div>

            {/* Plan Info */}
            <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="capitalize">{user?.plan || 'Free'} Plan</span>
              <button 
                onClick={() => navigate('/billing')} 
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Upgrade
              </button>
            </div>
          </>
        ) : (
          <div 
            onClick={() => navigate('/connect')}
            className="w-10 h-10 mx-auto rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-center cursor-pointer hover:border-purple-500/40"
            title={user?.instagram_connected ? `@${user.instagram_username || 'connected'}` : 'Connect Instagram'}
          >
            <Instagram className="w-4 h-4 text-pink-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
