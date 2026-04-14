'use client';

import { NavBar } from './nav-bar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto w-full">
      <main className="flex-1 pb-16 px-4 pt-4">{children}</main>
      <NavBar />
    </div>
  );
}
