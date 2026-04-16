import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { TopBar } from './TopBar';
import { getProfile } from '../../lib/api';
import type { User } from '../../lib/types';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getProfile().then(p => { if (p) setUser(p); }).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:ml-[240px] min-w-0">
        {/* Mobile top bar */}
        <TopBar onMenuClick={() => setDrawerOpen(true)} />

        {/* Page content */}
        <div className="flex-1 p-5 md:p-8 animate-[fadeIn_0.2s_ease-out]">
          {children}
        </div>
      </main>
    </div>
  );
};
