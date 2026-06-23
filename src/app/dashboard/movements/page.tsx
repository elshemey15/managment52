
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Clock, User, Trash2, Calendar as CalendarIcon, X, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MovementsPage() {
  const { items, movements, users, isAdmin, deleteMovement } = useWarehouse();
  const [historySearch, setHistorySearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredMovements = movements.filter(m => {
    const item = items.find(i => i.id === m.itemId);
    const movementDate = m.timestamp?.toDate ? m.timestamp.toDate().toISOString().split('T')[0] : '';
    
    const matchesSearch = 
      item?.name.toLowerCase().includes(historySearch.toLowerCase()) || 
      item?.code.toLowerCase().includes(historySearch.toLowerCase()) ||
      m.note?.toLowerCase().includes(historySearch.toLowerCase());
      
    const matchesDate = !dateFilter || movementDate === dateFilter;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center flex-row-reverse">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">سجل حركات المخزن</h1>
          <p className="text-muted-foreground font-medium">مراقبة دقيقة لكل عمليات الدخول والخروج والوارد</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#336699]/10 rounded-lg text-[#336699]">
          <History className="h-5 w-5" />
          <span className="font-bold">إجمالي الحركات: {movements.length}</span>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row-reverse items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-2 justify-end w-full">
            <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="ابحث بالاسم، الكود، أو الملاحظة..." 
                className="pr-9 h-10 text-right font-medium" 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-48">
              <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input 
                type="date"
                className="pr-9 h-10 text-right block w-full"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter('')}
                  className="absolute left-2 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-right">الوقت والتاريخ</TableHead>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المادة</TableHead>
                <TableHead className="text-center">الكمية</TableHead>
                <TableHead className="text-right">تفاصيل الحركة / ملاحظات</TableHead>
                {isAdmin() && <TableHead className="text-left">حذف</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin() ? 7 : 6} className="text-center py-20 text-muted-foreground italic font-medium">
                    لا توجد سجلات حركات مطابقة للبحث حالياً
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((move) => {
                  const item = items.find(i => i.id === move.itemId);
                  const user = users.find(u => u.id === move.userId);
                  const dateObj = move.timestamp?.toDate ? move.timestamp.toDate() : new Date();
                  
                  return (
                    <TableRow key={move.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">
                            {dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 justify-end">
                            {dateObj.toLocaleDateString('ar-EG')}
                            <Clock className="h-3 w-3" />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                            {user?.username || 'نظام آلي'}
                          </span>
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {move.type === 'IN' ? (
                          <div className="flex items-center gap-1 justify-end text-emerald-600 font-black text-xs">
                            وارد (توريد)
                            <ArrowDownLeft className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 justify-end text-amber-600 font-black text-xs">
                            صرف (صادر)
                            <ArrowUpRight className="h-3 w-3" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-sm text-[#336699]">{item?.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono uppercase">{item?.code}</div>
                      </TableCell>
                      <TableCell className="text-center font-black text-lg text-slate-800">
                        {move.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right max-w-[200px] truncate text-xs text-muted-foreground italic font-medium">
                        {move.note || '-'}
                      </TableCell>
                      {isAdmin() && (
                        <TableCell className="text-left">
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50" onClick={() => deleteMovement(move.id)}>
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
    </div>
  );
}
