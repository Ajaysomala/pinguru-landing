import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Camera, BarChart2, CreditCard, Settings, LogOut, X, LifeBuoy, Users } from 'lucide-react';
import { logout } from '../../lib/api';
import { getInitial, getDisplayName, toTitleCase } from '../../lib/utils';
import type { User } from '../../lib/types';
import { BrandLogo } from '../ui/BrandLogo';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const navItems = [
  { label: 'Dashboard',  href: '/dashboard', icon: LayoutDashboard },
  { label: 'Automation', href: '/rules',      icon: Zap },
  { label: 'Instagram',  href: '/connect',    icon: Camera },
  { label: 'Contacts',   href: '/contacts',   icon: Users },
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
          className="drawer-overlay open"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <aside className={`sidebar-mobile ${open ? 'open' : ''}`}>
        <div className="sidebar-mobile-head">
          <BrandLogo to="/dashboard" size="md" onDark onClick={onClose} />
          <button onClick={onClose} className="sidebar-mobile-close" aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              onClick={onClose}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user sidebar-user-mobile">
            <div className="sidebar-avatar">{initial}</div>
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
    </>
  );
};
