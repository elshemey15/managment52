
"use client";

import React from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Wallet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense, canEdit, isAdmin } = useWarehouse();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addExpense({
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
    });
    e.currentTarget.reset();
  };

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-end flex-row-reverse">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">المصاريف العامة</h1>
          <p className="text-muted-foreground font-medium">متابعة تكاليف التشغيل (إيجار، كهرباء، لوجستيات)</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-left">
          <p className="text-xs text-red-600 font-black uppercase tracking-wider mb-1">إجمالي مصاريف الشهر</p>
          <h2 className="text-3xl font-black text-red-700">{totalExpenses.toLocaleString()} $</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-right">تسجيل مصروف جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4 text-right">
              <div className="space-y-2">
                <Label>الوصف / البيان</Label>
                <Input name="description" required placeholder="مثال: إيجار المستودع لشهر فبراير" className="text-right" />
              </div>
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="text-right" />
              </div>
              <div className="space-y-2">
                <Label>تصنيف المصروف</Label>
                <Input name="category" required placeholder="مثال: مرافق، شحن، رواتب" className="text-right" />
              </div>
              <Button type="submit" className="w-full bg-[#336699] font-bold" disabled={!canEdit()}>
                <Plus className="h-4 w-4 ml-2" /> تسجيل المصروف
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">البيان</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-left">القيمة</TableHead>
                  {isAdmin() && <TableHead className="text-left">حذف</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin() ? 5 : 4} className="text-center py-12 text-muted-foreground italic font-medium">لا توجد مصاريف مسجلة</TableCell>
                  </TableRow>
                ) : (
                  expenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-xs text-right font-bold">{new Date(exp.timestamp).toLocaleDateString('ar-EG')}</TableCell>
                      <TableCell className="font-bold text-right">{exp.description}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold">{exp.category}</span>
                      </TableCell>
                      <TableCell className="text-left font-mono font-black text-red-600">
                        - {exp.amount.toLocaleString()} $
                      </TableCell>
                      {isAdmin() && (
                        <TableCell className="text-left">
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteExpense(exp.id)}>
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
