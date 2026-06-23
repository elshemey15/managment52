
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FileText, Calendar, Wallet, ShoppingBag } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TotalInvoicesPage() {
  const { generalInvoices, addGeneralInvoice, deleteGeneralInvoice, canEdit, isAdmin } = useWarehouse();
  
  const daysOfWeek = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  
  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateVal = formData.get('date') as string;
    const dateObj = new Date(dateVal);
    const dayName = daysOfWeek[dateObj.getDay()];

    addGeneralInvoice({
      date: dateVal,
      day: dayName,
      salePrice: parseFloat(formData.get('salePrice') as string) || 0,
      expenses: parseFloat(formData.get('expenses') as string) || 0,
      note: formData.get('note') as string,
    });
    e.currentTarget.reset();
  };

  const totalSales = generalInvoices.reduce((acc, inv) => acc + (inv.salePrice || 0), 0);
  const totalInvoicesExpenses = generalInvoices.reduce((acc, inv) => acc + (inv.expenses || 0), 0);

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-end flex-row-reverse">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">إجمالي الفواتير العامة</h1>
          <p className="text-muted-foreground font-medium">سجل المبيعات والمصروفات اليومية العام</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-left">
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mb-1">إجمالي المبيعات</p>
            <h2 className="text-2xl font-black text-emerald-700">{totalSales.toLocaleString()} $</h2>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-left">
            <p className="text-[10px] text-red-600 font-black uppercase tracking-wider mb-1">إجمالي المصروفات</p>
            <h2 className="text-2xl font-black text-red-700">{totalInvoicesExpenses.toLocaleString()} $</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-right flex items-center justify-end gap-2">
              تسجيل فاتورة جديدة
              <FileText className="h-5 w-5 text-[#336699]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4 text-right">
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="text-right" />
              </div>
              <div className="space-y-2">
                <Label>إجمالي سعر البيع (اختياري)</Label>
                <div className="relative">
                  <ShoppingBag className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="salePrice" type="number" step="0.01" placeholder="0.00" className="text-right pr-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>إجمالي المصروفات (اختياري)</Label>
                <div className="relative">
                  <Wallet className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="expenses" type="number" step="0.01" placeholder="0.00" className="text-right pr-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ملاحظات إضافية</Label>
                <Input name="note" placeholder="تفاصيل الفاتورة..." className="text-right" />
              </div>
              <Button type="submit" className="w-full bg-[#336699] font-bold h-12" disabled={!canEdit()}>
                <Plus className="h-4 w-4 ml-2" /> حفظ الفاتورة بالسجل
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right">اليوم والتاريخ</TableHead>
                  <TableHead className="text-right">سعر البيع</TableHead>
                  <TableHead className="text-right">المصروفات</TableHead>
                  <TableHead className="text-right">الصافي</TableHead>
                  <TableHead className="text-right">ملاحظات</TableHead>
                  {isAdmin() && <TableHead className="text-left">حذف</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {generalInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin() ? 6 : 5} className="text-center py-20 text-muted-foreground italic font-medium">
                      لم يتم تسجيل فواتير عامة بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  generalInvoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span className="font-black text-[#336699]">{inv.day}</span>
                          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 justify-end">
                            {new Date(inv.date).toLocaleDateString('ar-EG')}
                            <Calendar className="h-3 w-3" />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-black text-emerald-600">
                        {inv.salePrice?.toLocaleString() || 0} $
                      </TableCell>
                      <TableCell className="text-right font-mono font-black text-red-600">
                        {inv.expenses?.toLocaleString() || 0} $
                      </TableCell>
                      <TableCell className="text-right font-mono font-black">
                        {((inv.salePrice || 0) - (inv.expenses || 0)).toLocaleString()} $
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground italic">
                        {inv.note || '-'}
                      </TableCell>
                      {isAdmin() && (
                        <TableCell className="text-left">
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteGeneralInvoice(inv.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
