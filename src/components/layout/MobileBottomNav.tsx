import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  Share2, 
  BarChart3, 
  Settings
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Rules', path: '/rules', icon: Zap },
    { label: 'Connect', path: '/connect', icon: Share2 },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/92 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <nav className="grid grid-cols-5 items-center h-16 px-1 safe-area-inset-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || (tab.path === '/rules' && location.pathname.startsWith('/rules'));
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 transition-all active:scale-90 relative select-none cursor-pointer"
            >
              {isActive && (
                <span className="absolute -top-[1px] w-8 h-[2px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'text-purple-400 scale-110' : 'text-slate-500'
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-medium tracking-tight ${
                  isActive ? 'text-white font-bold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
