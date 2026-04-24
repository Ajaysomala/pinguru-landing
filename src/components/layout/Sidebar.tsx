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
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/dashboard" className="sidebar-logo">
        <div className="sidebar-logo-mark">
          PG
        </div>
        <span className="sidebar-logo-text">PinGuru</span>
      </NavLink>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Main</p>
        {navItems.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <p className="sidebar-section-label">Account</p>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <NavLink
          to="/support"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <LifeBuoy size={18} />
          Support
        </NavLink>
      </nav>

      {/* Footer user area */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {initial}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{displayName}</p>
            <p className="sidebar-user-plan">{plan}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-nav-item"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};
