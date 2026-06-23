
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Receipt, Phone, MapPin, Trash2, Wallet, History } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SuppliersPage() {
  const { suppliers, addSupplier, deleteSupplier, payments, addPayment, isAdmin, canEdit } = useWarehouse();
  const [isSupDialogOpen, setIsSupDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);

  const handleCreateSupplier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addSupplier({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    });
    setIsSupDialogOpen(false);
  };

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addPayment({
      supplierId: formData.get('supplierId') as string,
      amount: parseFloat(formData.get('amount') as string),
      method: formData.get('method') as any,
      note: formData.get('note') as string,
    });
    setIsPayDialogOpen(false);
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center flex-row-reverse">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">وحدة الموردين والديون</h1>
          <p className="text-muted-foreground font-medium">إدارة الحسابات المالية، المديونيات، وعمليات السداد</p>
        </div>
        <div className="flex gap-2">
          {canEdit() && (
            <>
              <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-[#336699] text-[#336699] font-bold">
                    <Receipt className="ml-2 h-4 w-4" /> سداد دين
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader><DialogTitle className="text-right">تسجيل سداد لمورد</DialogTitle></DialogHeader>
                  <form onSubmit={handlePayment} className="space-y-4 py-4 text-right">
                    <div className="space-y-2">
                      <Label>المورد</Label>
                      <Select name="supplierId" required>
                        <SelectTrigger className="text-right"><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                        <SelectContent dir="rtl">
                          {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name} (الدين: {s.balance} $)</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>مبلغ السداد</Label>
                      <Input name="amount" type="number" step="0.01" required className="text-right" />
                    </div>
                    <div className="space-y-2">
                      <Label>طريقة الدفع</Label>
                      <Select name="method" defaultValue="CASH">
                        <SelectTrigger className="text-right"><SelectValue /></SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value="CASH">نقدي</SelectItem>
                          <SelectItem value="TRANSFER">تحويل بنكي</SelectItem>
                          <SelectItem value="CHECK">شيك</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ملاحظات</Label>
                      <Input name="note" className="text-right" />
                    </div>
                    <DialogFooter><Button type="submit" className="w-full bg-[#336699]">تأكيد السداد</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isSupDialogOpen} onOpenChange={setIsSupDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#336699] font-bold"><Plus className="ml-2 h-4 w-4" /> مورد جديد</Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader><DialogTitle className="text-right">إضافة مورد جديد</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateSupplier} className="space-y-4 py-4 text-right">
                    <div className="space-y-2"><Label>اسم المورد</Label><Input name="name" required className="text-right" /></div>
                    <div className="space-y-2"><Label>رقم الهاتف</Label><Input name="phone" className="text-right" /></div>
                    <div className="space-y-2"><Label>العنوان</Label><Input name="address" className="text-right" /></div>
                    <DialogFooter><Button type="submit" className="w-full bg-[#336699]">حفظ المورد</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="bg-white/50 border mb-4 w-full justify-start h-12">
          <TabsTrigger value="list" className="flex-1 font-bold">قائمة الموردين</TabsTrigger>
          <TabsTrigger value="payments" className="flex-1 font-bold">سجل السدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right">المورد</TableHead>
                    <TableHead className="text-right">الاتصال</TableHead>
                    <TableHead className="text-right">إجمالي المشتريات</TableHead>
                    <TableHead className="text-right">إجمالي المدفوعات</TableHead>
                    <TableHead className="text-left text-red-600">المديونية المتبقية</TableHead>
                    {isAdmin() && <TableHead className="text-center">إجراء</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-bold text-right">{s.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 justify-end text-xs"><Phone className="h-3 w-3" /> {s.phone || '-'}</span>
                          <span className="flex items-center gap-1 justify-end text-[10px] text-muted-foreground"><MapPin className="h-3 w-3" /> {s.address || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">{s.totalPurchases.toLocaleString()} $</TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">{s.totalPayments.toLocaleString()} $</TableCell>
                      <TableCell className="text-left font-mono text-lg font-black text-red-600">{s.balance.toLocaleString()} $</TableCell>
                      {isAdmin() && (
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteSupplier(s.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المورد</TableHead>
                    <TableHead className="text-right">طريقة الدفع</TableHead>
                    <TableHead className="text-left">المبلغ المسدد</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(p => {
                    const s = suppliers.find(x => x.id === p.supplierId);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs text-right font-bold">{new Date(p.date).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell className="font-bold text-right">{s?.name}</TableCell>
                        <TableCell className="text-right"><span className="text-xs bg-slate-100 px-2 py-1 rounded-full font-bold">{p.method}</span></TableCell>
                        <TableCell className="text-left font-mono font-black text-emerald-600">{p.amount.toLocaleString()} $</TableCell>
                        <TableCell className="text-right text-xs italic text-muted-foreground">{p.note || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
