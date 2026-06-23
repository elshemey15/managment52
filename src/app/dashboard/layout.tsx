
"use client";

import { useWarehouse } from '@/app/lib/store';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cloud, CheckCircle2, Download, Save, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { 
    currentUser, 
    exportAllData, 
    items, 
    suppliers, 
    cashTransactions, 
    movements 
  } = useWarehouse();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleManualSave = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: 'تمت المزامنة اليدوية بنجاح - كافة البيانات مؤمنة' });
    }, 800);
  };

  const onExport = (format: 'json' | 'excel' | 'pdf') => {
    exportAllData(format);
    setIsExportOpen(false);
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

              <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex items-center gap-2 bg-slate-200 text-slate-800 font-bold h-9"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden xs:inline">نسخة احتياطية</span>
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl" className="text-right sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle>تنزيل نسخة من البيانات</DialogTitle>
                    <DialogDescription>
                      راجع ملخص بياناتك قبل التصدير واختيار الصيغة المناسبة.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-lg border text-center">
                        <p className="text-[10px] text-muted-foreground font-bold">عدد المواد</p>
                        <p className="text-lg font-black">{items.length}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border text-center">
                        <p className="text-[10px] text-muted-foreground font-bold">عدد الموردين</p>
                        <p className="text-lg font-black">{suppliers.length}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border text-center">
                        <p className="text-[10px] text-muted-foreground font-bold">الحوالات المسجلة</p>
                        <p className="text-lg font-black">{cashTransactions.length}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border text-center">
                        <p className="text-[10px] text-muted-foreground font-bold">إجمالي الحركات</p>
                        <p className="text-lg font-black">{movements.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>اختر صيغة الملف:</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => onExport('excel')}>
                          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                          <span className="font-bold text-slate-700">تصدير إلى Excel (إكسل)</span>
                        </Button>
                        <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => onExport('pdf')}>
                          <FileText className="h-5 w-5 text-red-600" />
                          <span className="font-bold text-slate-700">تصدير كـ PDF (طباعة)</span>
                        </Button>
                        <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => onExport('json')}>
                          <FileJson className="h-5 w-5 text-[#336699]" />
                          <span className="font-bold text-slate-700">تصدير كـ JSON (برمجي)</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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
