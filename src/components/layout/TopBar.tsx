import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, CircleHelp } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title }) => (
  <header className="topbar lg:hidden">
    <Link to="/dashboard" className="topbar-logo">
      <div className="topbar-logo-mark">PG</div>
      <span className="topbar-logo-text">{title || 'PinGuru'}</span>
    </Link>
    <div className="flex items-center gap-1">
      <Link
        to="/support"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] transition-all"
        aria-label="Open support"
      >
        <CircleHelp size={19} />
      </Link>
      <button
        onClick={onMenuClick}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] transition-all"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
    </div>
  </header>
);
