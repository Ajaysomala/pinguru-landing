import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { TopBar } from './TopBar';
import type { User } from '../../lib/types';

interface AppShellProps {
  children: React.ReactNode;
  user: User | null;
}

export const AppShell: React.FC<AppShellProps> = ({ children, user }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!drawerOpen) return;

    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocusedRef.current?.focus();
    };
  }, [drawerOpen]);

  return (
    <div className="pg-app-shell">
      <div className="pg-sidebar-desktop">
        <Sidebar user={user} />
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />

      <main className="pg-app-main">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />
        <div className="pg-app-content animate-[fadeIn_0.2s_ease-out]">
          {children}
        </div>
      </main>
    </div>
  );
};
