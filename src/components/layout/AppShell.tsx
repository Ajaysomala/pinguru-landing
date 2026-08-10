import React, { useState } from 'react';
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

  return (
    <div className="pg-app-shell">
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />

      <main className="pg-app-main">
        <div className="lg:hidden">
          <TopBar onMenuClick={() => setDrawerOpen(true)} />
        </div>
        <div className="hidden lg:block">
          <TopBar onMenuClick={() => setDrawerOpen(true)} desktop />
        </div>

        <div className="pg-app-content animate-[fadeIn_0.2s_ease-out]">
          {children}
        </div>
      </main>
    </div>
  );
};
