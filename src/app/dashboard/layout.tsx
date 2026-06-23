
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
      <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-auto">
          <header className="h-16 border-b bg-card flex items-center px-8 shrink-0 justify-between">
            <div className="flex flex-col items-start">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">نظام إدارة المستودعات</h2>
              <p className="text-[10px] text-emerald-600 font-bold">تم التطوير بواسطة: Abdallah Elshemey | 01102346158</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-accent/20 text-accent font-black px-3 py-1 rounded-full uppercase italic">محدث الاصدار دائما</span>
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
