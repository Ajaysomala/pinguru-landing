import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Camera, BarChart2, CreditCard, Settings, LogOut, X, LifeBuoy } from 'lucide-react';
import { logout } from '../../lib/api';
import { getInitial, getDisplayName, toTitleCase } from '../../lib/utils';
import type { User } from '../../lib/types';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const navItems = [
  { label: 'Dashboard',  href: '/dashboard', icon: LayoutDashboard },
  { label: 'Automation', href: '/rules',      icon: Zap },
  { label: 'Instagram',  href: '/connect',    icon: Camera },
  { label: 'Analytics',  href: '/analytics',  icon: BarChart2 },
  { label: 'Billing',    href: '/billing',    icon: CreditCard },
  { label: 'Settings',   href: '/settings',   icon: Settings },
  { label: 'Support',    href: '/support',    icon: LifeBuoy },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose, user }) => {
  const displayName = getDisplayName(user);
  const initial     = getInitial(displayName);
  const plan        = toTitleCase(user?.plan || 'free');

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <aside className={`fixed top-0 left-0 h-screen w-[260px] bg-sidebar flex flex-col z-50 transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-display font-bold text-xs text-white">PG</div>
            <span className="font-display font-bold text-white">PinGuru</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 no-underline transition-all duration-150 ${
                  isActive ? 'bg-indigo-900 text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 pb-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-display font-bold text-xs text-white">{initial}</div>
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-semibold text-white truncate">{displayName}</p>
              <p className="text-[0.6875rem] font-bold text-primary uppercase tracking-wide">{plan}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};
