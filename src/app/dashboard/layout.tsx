
"use client";

import { useWarehouse } from '@/app/lib/store';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useWarehouse();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-auto">
          <header className="h-16 border-b bg-card flex items-center px-8 shrink-0">
            <div className="flex-1">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Warehouse Management System</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-accent/20 text-accent font-bold px-2 py-1 rounded">V 1.0.0</span>
            </div>
          </header>
          <main className="p-8 pb-12">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
