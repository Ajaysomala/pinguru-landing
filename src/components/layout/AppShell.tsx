import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2 } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  user?: unknown;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { toastMessage } = useToast();

  const handleOpenNewRuleModal = () => {
    navigate('/rules?create=1');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-canvas)] text-[var(--color-text)] antialiased selection:bg-indigo-500/30 selection:text-indigo-200 relative font-sans transition-colors duration-200">
      {/* Atmospheric Ambient Orbs (GPU-accelerated background lighting layer) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        {/* Orb 1 (Top-Left): Indigo Violet */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-transparent opacity-60 rounded-full blur-[140px] transform-gpu animate-float-slow" />
        {/* Orb 2 (Top-Right): Electric Violet / Purple */}
        <div className="absolute -top-20 -right-20 w-[480px] h-[480px] bg-gradient-to-bl from-violet-600/25 via-purple-600/20 to-transparent opacity-50 rounded-full blur-[130px] transform-gpu animate-pulse-glow" />
        {/* Orb 3 (Bottom-Center): Neon Cyan Glow */}
        <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-gradient-to-t from-cyan-500/20 via-indigo-600/15 to-transparent opacity-40 rounded-full blur-[150px] transform-gpu animate-float-gentle" />
      </div>

      {/* Workspace Sidebar (Desktop) */}
      <Sidebar 
        collapsed={collapsed} 
        onToggleCollapse={() => setCollapsed(!collapsed)} 
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        {/* Top Header */}
        <Header onOpenNewRuleModal={handleOpenNewRuleModal} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-12 pb-24 md:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav />

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-[#121218]/95 backdrop-blur-xl border border-white/10 text-white text-xs px-4 py-3 rounded-2xl shadow-[0_12px_36px_-4px_rgba(0,0,0,0.8)] flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-200 font-medium">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
