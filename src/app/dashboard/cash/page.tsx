
"use client";

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Banknote, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  User, 
  Phone,
  Calendar,
  Calculator,
  UserCheck
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function CashTransactionsPage() {
  const { cashTransactions, addCashTransaction, deleteCashTransaction, canEdit, isAdmin } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addCashTransaction({
      type: formData.get('type') as 'SEND' | 'RECEIVE',
      personName: formData.get('personName') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      amount: parseFloat(formData.get('amount') as string) || 0,
      date: formData.get('date') as string,
      note: formData.get('note') as string,
    });
    e.currentTarget.reset();
  };

  const filteredTransactions = useMemo(() => {
    return cashTransactions.filter(t => 
      t.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phoneNumber.includes(searchTerm) ||
      (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [cashTransactions, searchTerm]);

  // حسابات الشخص المحدد في البحث
  const personStats = useMemo(() => {
    if (!searchTerm) return null;
    const sent = filteredTransactions.filter(t => t.type === 'SEND').reduce((acc, t) => acc + t.amount, 0);
    const received = filteredTransactions.filter(t => t.type === 'RECEIVE').reduce((acc, t) => acc + t.amount, 0);
    return { sent, received, count: filteredTransactions.length };
  }, [filteredTransactions, searchTerm]);

  const totalSent = cashTransactions.filter(t => t.type === 'SEND').reduce((acc, t) => acc + t.amount, 0);
  const totalReceived = cashTransactions.filter(t => t.type === 'RECEIVE').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-end flex-row-reverse">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">إدارة الحوالات والكاش</h1>
          <p className="text-muted-foreground font-medium">توثيق المبالغ المرسلة والمستلمة وإدارة حسابات الأشخاص</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-left">
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mb-1">إجمالي المستلم (+)</p>
            <h2 className="text-2xl font-black text-emerald-700">{totalReceived.toLocaleString()} $</h2>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-left">
            <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider mb-1">إجمالي المرسل (-)</p>
            <h2 className="text-2xl font-black text-amber-700">{totalSent.toLocaleString()} $</h2>
          </div>
        </div>
      </div>

      {/* قسم تلخيص البحث عن شخص */}
      {searchTerm && personStats && (
        <Card className="border-none shadow-md bg-[#336699] text-white overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-row-reverse">
                <div className="bg-white/20 p-3 rounded-full">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm font-bold">ملخص الحساب لـ:</p>
                  <h2 className="text-2xl font-black italic">"{searchTerm}"</h2>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto">
                <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
                  <p className="text-xs font-bold text-white/70 mb-1">إجمالي ما استلمه</p>
                  <p className="text-xl font-black text-emerald-300">+{personStats.received.toLocaleString()} $</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
                  <p className="text-xs font-bold text-white/70 mb-1">إجمالي ما أرسله</p>
                  <p className="text-xl font-black text-amber-300">-{personStats.sent.toLocaleString()} $</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10 hidden md:block">
                  <p className="text-xs font-bold text-white/70 mb-1">صافي الحساب</p>
                  <p className={`text-xl font-black ${personStats.received - personStats.sent >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {(personStats.received - personStats.sent).toLocaleString()} $
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-right flex items-center justify-end gap-2">
              تسجيل معاملة جديدة
              <Banknote className="h-5 w-5 text-[#336699]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4 text-right">
              <div className="space-y-2">
                <Label>نوع المعاملة</Label>
                <Select name="type" defaultValue="RECEIVE">
                  <SelectTrigger className="text-right h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="RECEIVE">استلام مبلع (مستلم +)</SelectItem>
                    <SelectItem value="SEND">إرسال مبلغ (مرسل -)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>اسم الشخص (المرسل/المستلم)</Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="personName" required placeholder="الاسم الكامل" className="text-right pr-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="phoneNumber" required placeholder="01xxxxxxxxx" className="text-right pr-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="text-right h-11 font-black" />
              </div>

              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="text-right" />
              </div>

              <div className="space-y-2">
                <Label>ملاحظات المعاملة</Label>
                <Input name="note" placeholder="تفاصيل إضافية..." className="text-right" />
              </div>

              <Button type="submit" className="w-full bg-[#336699] font-bold h-12" disabled={!canEdit()}>
                <Plus className="h-4 w-4 ml-2" /> حفظ المعاملة السحابية
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-[#336699]" />
            <Input 
              placeholder="ابحث باسم الشخص لحساب إجمالي تعاملاته (مرسل/مستلم)..." 
              className="pr-10 text-right h-14 bg-white shadow-sm border-2 border-[#336699]/10 focus:border-[#336699] transition-all text-lg font-bold" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الاسم / الهاتف</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                    {isAdmin() && <TableHead className="text-left">حذف</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin() ? 6 : 5} className="text-center py-20 text-muted-foreground italic font-medium">
                        {searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد معاملات مسجلة حالياً'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((trans) => (
                      <TableRow key={trans.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-right">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">
                              {new Date(trans.date).toLocaleDateString('ar-EG')}
                            </span>
                            <span className="text-[9px] text-muted-foreground flex items-center gap-1 justify-end">
                              <Calendar className="h-3 w-3" />
                              {new Date(trans.date).toLocaleDateString('ar-EG', { weekday: 'long' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {trans.type === 'RECEIVE' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold gap-1">
                              <ArrowDownLeft className="h-3 w-3" /> مستلم (+)
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold gap-1">
                              <ArrowUpRight className="h-3 w-3" /> مرسل (-)
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-black text-[#336699]">{trans.personName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{trans.phoneNumber}</div>
                        </TableCell>
                        <TableCell className={`text-left font-mono font-black text-lg ${trans.type === 'RECEIVE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {trans.type === 'RECEIVE' ? '+' : '-'} {trans.amount.toLocaleString()} $
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground italic max-w-[150px] truncate">
                          {trans.note || '-'}
                        </TableCell>
                        {isAdmin() && (
                          <TableCell className="text-left">
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCashTransaction(trans.id)}>
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
    </div>
  );
}
