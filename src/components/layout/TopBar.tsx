import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title }) => (
  <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-[60px] px-4 bg-white border-b border-slate-200">
    <Link to="/dashboard" className="flex items-center gap-2 no-underline">
      <div className="w-[30px] h-[30px] bg-primary rounded-[7px] flex items-center justify-center font-display font-bold text-xs text-white">PG</div>
      <span className="font-display font-bold text-slate-900">{title || 'PinGuru'}</span>
    </Link>
    <button
      onClick={onMenuClick}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  </header>
);
