import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Zap, Camera, BarChart2,
  CreditCard, Settings, LogOut, Users, LifeBuoy
} from 'lucide-react';
import { logout } from '../../lib/api';
import { getInitial, getDisplayName, toTitleCase } from '../../lib/utils';
import type { User } from '../../lib/types';

interface SidebarProps {
  user: User | null;
}

const navItems = [
  { label: 'Dashboard',  href: '/dashboard', icon: LayoutDashboard },
  { label: 'Automation', href: '/rules',      icon: Zap },
  { label: 'Instagram',  href: '/connect',    icon: Camera },
  { label: 'Contacts',   href: '/contacts',   icon: Users },
  { label: 'Analytics',  href: '/analytics',  icon: BarChart2 },
  { label: 'Billing',    href: '/billing',    icon: CreditCard },
];

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const displayName = getDisplayName(user);
  const initial     = getInitial(displayName);
  const plan        = toTitleCase(user?.plan || 'free');

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <NavLink to="/dashboard" className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.06] no-underline">
        <div className="w-[34px] h-[34px] bg-primary rounded-lg flex items-center justify-center font-display font-bold text-[13px] text-white flex-shrink-0">
          PG
        </div>
        <span className="font-display font-bold text-[1.125rem] text-white tracking-tight">PinGuru</span>
      </NavLink>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <p className="text-[0.6875rem] font-semibold tracking-widest uppercase text-white/30 px-2 pt-3 pb-1">Main</p>
        {navItems.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-sm font-medium mb-0.5 no-underline transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-900 text-white'
                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        <p className="text-[0.6875rem] font-semibold tracking-widest uppercase text-white/30 px-2 pt-5 pb-1">Account</p>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-sm font-medium mb-0.5 no-underline transition-all duration-150 ${
              isActive ? 'bg-indigo-900 text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
            }`
          }
        >
          <Settings size={18} className="flex-shrink-0" />
          Settings
        </NavLink>
        <NavLink
          to="/support"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-sm font-medium mb-0.5 no-underline transition-all duration-150 ${
              isActive ? 'bg-indigo-900 text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
            }`
          }
        >
          <LifeBuoy size={18} className="flex-shrink-0" />
          Support
        </NavLink>
      </nav>

      {/* Footer user area */}
      <div className="px-2 pb-3 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-display font-bold text-[13px] text-white flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.8125rem] font-semibold text-white leading-tight truncate">{displayName}</p>
            <p className="text-[0.6875rem] font-semibold text-primary uppercase tracking-wide">{plan}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all mt-1"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};
