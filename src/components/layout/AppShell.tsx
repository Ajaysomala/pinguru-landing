import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { TopBar } from './TopBar';
import type { User } from '../../lib/types';

interface AppShellProps {
  children: React.ReactNode;
  user: User | null;  // passed from RequireAuth via AuthContext — no fetch here
}

export const AppShell: React.FC<AppShellProps> = ({ children, user }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

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