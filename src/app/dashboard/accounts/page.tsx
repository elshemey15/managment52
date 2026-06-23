
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Receipt, TrendingUp, TrendingDown, Phone, Trash2 } from 'lucide-react';
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

export default function AccountsPage() {
  const { debtAccounts, addDebtAccount, deleteDebtAccount, addRepayment, deleteRepayment, repayments, canEdit, isAdmin } = useWarehouse();
  const [isAccDialogOpen, setIsAccDialogOpen] = useState(false);
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false);

  const handleCreateAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addDebtAccount({
      name: formData.get('name') as string,
      type: formData.get('type') as 'SUPPLIER' | 'CUSTOMER',
      phone: formData.get('phone') as string,
    });
    setIsAccDialogOpen(false);
  };

  const handleRepayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const accountId = formData.get('accountId') as string;
    const account = debtAccounts.find(a => a.id === accountId);

    addRepayment({
      debtAccountId: accountId,
      amount,
      type: account?.type === 'SUPPLIER' ? 'PAYMENT' : 'RECEIPT',
      note: formData.get('note') as string,
    });
    setIsRepayDialogOpen(false);
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center flex-row-reverse">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">حسابات الموردين والعملاء</h1>
          <p className="text-muted-foreground font-medium">إدارة الديون، السلف، والمستحقات المالية</p>
        </div>
        <div className="flex gap-2">
          {canEdit() && (
            <>
              <Dialog open={isRepayDialogOpen} onOpenChange={setIsRepayDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-[#336699] text-[#336699] hover:bg-[#336699] hover:text-white font-bold">
                    <Receipt className="h-4 w-4 ml-2" /> تسجيل سداد / دفعة
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">تسوية دين / استلام مبلغ</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRepayment} className="space-y-4 py-4 text-right">
                    <div className="space-y-2">
                      <Label>اختر الحساب</Label>
                      <Select name="accountId" required>
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر الحساب المستهدف" />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          {debtAccounts.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.type === 'SUPPLIER' ? 'مورد' : 'عميل'})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>المبلغ المدفوع / المستلم</Label>
                      <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="text-right" />
                    </div>
                    <div className="space-y-2">
                      <Label>ملاحظات / رقم الإيصال</Label>
                      <Input name="note" placeholder="ملاحظة اختيارية" className="text-right" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full bg-[#336699] font-bold">حفظ المعاملة المالية</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isAccDialogOpen} onOpenChange={setIsAccDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#336699] hover:bg-[#2a5580] font-bold">
                    <Plus className="h-4 w-4 ml-2" /> حساب جديد
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة حساب مالي جديد</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAccount} className="space-y-4 py-4 text-right">
                    <div className="space-y-2">
                      <Label>اسم الحساب</Label>
                      <Input name="name" required placeholder="اسم الشركة أو الشخص" className="text-right" />
                    </div>
                    <div className="space-y-2">
                      <Label>نوع الحساب</Label>
                      <Select name="type" defaultValue="SUPPLIER">
                        <SelectTrigger className="text-right">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value="SUPPLIER">مورد (نحن ندفع له)</SelectItem>
                          <SelectItem value="CUSTOMER">عميل (هو يدفع لنا)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>رقم الهاتف</Label>
                      <Input name="phone" placeholder="بيانات الاتصال" className="text-right" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full bg-[#336699] font-bold">إنشاء الحساب</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="bg-white/50 border mb-4 w-full justify-start p-1 h-12">
          <TabsTrigger value="suppliers" className="flex-1 font-bold">الموردين</TabsTrigger>
          <TabsTrigger value="customers" className="flex-1 font-bold">العملاء</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 font-bold">سجل السدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right">اسم المورد</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-left">إجمالي الدين لنا عليه</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    {isAdmin() && <TableHead className="text-center">خيارات</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debtAccounts.filter(a => a.type === 'SUPPLIER').map(acc => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-bold text-right">{acc.name}</TableCell>
                      <TableCell className="text-right flex items-center gap-2 justify-end">
                        {acc.phone || '-'}
                        <Phone className="h-3 w-3 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="text-left font-mono text-lg font-black text-red-600">
                        {acc.balance.toLocaleString()} $
                      </TableCell>
                      <TableCell className="text-center">
                        {acc.balance > 0 ? (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">مستحق الدفع</span>
                        ) : (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">مسدد بالكامل</span>
                        )}
                      </TableCell>
                      {isAdmin() && (
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteDebtAccount(acc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-left">رصيد المستحقات</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    {isAdmin() && <TableHead className="text-center">خيارات</TableHead>}
                  </TableHeader>
                </TableHeader>
                <TableBody>
                  {debtAccounts.filter(a => a.type === 'CUSTOMER').map(acc => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-bold text-right">{acc.name}</TableCell>
                      <TableCell className="text-right flex items-center gap-2 justify-end">
                        {acc.phone || '-'}
                        <Phone className="h-3 w-3 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="text-left font-mono text-lg font-black text-blue-600">
                        {Math.abs(acc.balance).toLocaleString()} $
                      </TableCell>
                      <TableCell className="text-center">
                        {acc.balance < 0 ? (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">ذمة نشطة</span>
                        ) : (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">خالص</span>
                        )}
                      </TableCell>
                      {isAdmin() && (
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteDebtAccount(acc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الحساب</TableHead>
                    <TableHead className="text-right">نوع العملية</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                    {isAdmin() && <TableHead className="text-left">حذف</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin() ? 6 : 5} className="text-center py-12 text-muted-foreground italic">لا يوجد سجل مدفوعات حتى الآن</TableCell>
                    </TableRow>
                  ) : (
                    repayments.map(rep => {
                      const acc = debtAccounts.find(a => a.id === rep.debtAccountId);
                      return (
                        <TableRow key={rep.id}>
                          <TableCell className="text-xs text-right font-bold">{new Date(rep.timestamp).toLocaleDateString('ar-EG')}</TableCell>
                          <TableCell className="font-bold text-right">{acc?.name}</TableCell>
                          <TableCell className="text-right">
                            {rep.type === 'PAYMENT' ? (
                              <span className="text-red-600 flex items-center gap-1 text-xs font-black uppercase justify-end">سداد خارج <TrendingDown className="h-3 w-3"/></span>
                            ) : (
                              <span className="text-emerald-600 flex items-center gap-1 text-xs font-black uppercase justify-end">استلام داخل <TrendingUp className="h-3 w-3"/></span>
                            )}
                          </TableCell>
                          <TableCell className="text-left font-mono font-black text-[#336699]">{rep.amount.toLocaleString()} $</TableCell>
                          <TableCell className="text-xs italic text-muted-foreground text-right">{rep.note || '-'}</TableCell>
                          {isAdmin() && (
                            <TableCell className="text-left">
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRepayment(rep.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
