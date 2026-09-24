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
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 antialiased selection:bg-purple-500/20 selection:text-purple-700 relative font-sans">
      {/* Atmospheric Ambient Orbs (GPU-accelerated background lighting layer) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        {/* Orb 1 (Top-Left): Soft Violet */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#C084FC] opacity-25 rounded-full blur-[140px] transform-gpu animate-float-slow" />
        {/* Orb 2 (Top-Right): Rose / Sunset Pink */}
        <div className="absolute -top-20 -right-20 w-[450px] h-[450px] bg-[#F472B6] opacity-20 rounded-full blur-[130px] transform-gpu animate-pulse-glow" />
        {/* Orb 3 (Bottom-Center): Electric Sky Cyan */}
        <div className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] bg-[#38BDF8] opacity-15 rounded-full blur-[150px] transform-gpu animate-float-gentle" />
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
        <main className="flex-1 overflow-y-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav />

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-white/95 backdrop-blur-xl border border-slate-200/80 text-slate-900 text-xs px-4 py-3 rounded-2xl shadow-[0_12px_36px_-4px_rgba(124,58,237,0.18)] flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-200 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
