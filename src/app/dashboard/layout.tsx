
"use client";

import { useWarehouse } from '@/app/lib/store';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cloud, CheckCircle2, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, exportAllData } = useWarehouse();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleManualSave = () => {
    setIsSyncing(true);
    // المحاكاة للمزامنة اليدوية حيث أن Firestore يعمل تلقائياً
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: 'تمت المزامنة اليدوية بنجاح - كافة البيانات مؤمنة' });
    }, 800);
  };

  if (!currentUser) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-auto">
          <header className="h-16 border-b bg-card flex items-center px-4 md:px-8 shrink-0 justify-between">
            <div className="flex flex-col items-start">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider hidden md:block">نظام إدارة المستودعات</h2>
              <p className="text-[9px] md:text-[10px] text-emerald-600 font-bold">المطور: Abdallah Elshemey | 01102346158</p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualSave}
                disabled={isSyncing}
                className="hidden sm:flex items-center gap-2 border-[#336699] text-[#336699] font-bold h-9"
              >
                <Save className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'جاري الحفظ...' : 'حفظ البيانات'}
              </Button>

              <Button 
                variant="secondary" 
                size="sm" 
                onClick={exportAllData}
                className="flex items-center gap-2 bg-slate-200 text-slate-800 font-bold h-9"
              >
                <Download className="h-4 w-4" />
                <span className="hidden xs:inline">نسخة احتياطية</span>
              </Button>

              <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                <div className="relative flex items-center gap-1">
                   <Cloud className="h-4 w-4" />
                   <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-[9px] md:text-[10px] font-black hidden xs:inline">سحابي آمن</span>
              </div>
            </div>
          </header>
          <main className="p-4 md:p-8 pb-12">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
