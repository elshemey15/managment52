
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Search, Clock, User, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function MovementsPage() {
  const { items, movements, suppliers, addPurchase, deleteMovement, users, isAdmin } = useWarehouse();
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [supplierId, setSupplierId] = useState('');
  const [paidNow, setPaidNow] = useState<number>(0);
  const [historySearch, setHistorySearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleRecordInward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return toast({ title: 'يرجى اختيار مادة', variant: 'destructive' });
    if (!supplierId || supplierId === 'none') return toast({ title: 'يرجى اختيار مورد', variant: 'destructive' });
    
    const item = items.find(i => i.id === selectedItemId);
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!item) return;

    const totalVal = item.purchasePrice * quantity;

    addPurchase({
      supplierId,
      supplierName: supplier?.name || '',
      date: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      totalValue: totalVal,
      paidAmount: paidNow,
      items: [{ itemId: selectedItemId, qty: quantity, price: item.purchasePrice }]
    }, [{ itemId: selectedItemId, qty: quantity }]);

    toast({ title: 'تم تسجيل التوريد وتحديث المخزن' });
    setQuantity(1);
    setSelectedItemId('');
    setSupplierId('');
    setPaidNow(0);
  };

  const filteredMovements = movements.filter(m => {
    const item = items.find(i => i.id === m.itemId);
    const movementDate = new Date(m.timestamp).toISOString().split('T')[0];
    
    const matchesSearch = 
      item?.name.toLowerCase().includes(historySearch.toLowerCase()) || 
      item?.code.toLowerCase().includes(historySearch.toLowerCase());
      
    const matchesDate = !dateFilter || movementDate === dateFilter;

    return matchesSearch && matchesDate;
  });

  const activeItem = items.find(i => i.id === selectedItemId);

  return (
    <div className="space-y-8 text-right">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">حركات التوريد (المشتريات)</h1>
        <p className="text-muted-foreground font-medium">تسجيل توريد بضاعة جديدة ومراجعة السجل التاريخي</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 flex-row-reverse">
              <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
              تسجيل توريد (وارد)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecordInward} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="item">اختر المادة</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger className="h-11 text-right">
                    <SelectValue placeholder="ابحث عن مادة..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {items.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.code}) - المتوفر: {item.currentStock.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="qty">الكمية الموردة</Label>
                  <span className="text-xs font-black bg-blue-50 text-blue-700 px-2 py-1 rounded">{quantity}</span>
                </div>
                
                <Slider 
                  value={[quantity]} 
                  max={1000} 
                  step={0.1}
                  className="py-2"
                  onValueChange={(vals) => setQuantity(vals[0])}
                  disabled={!selectedItemId}
                />

                <Input 
                  id="qty" 
                  type="number" 
                  step="any"
                  min="0.1" 
                  className="h-11 text-right"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">المورد</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="h-11 text-right">
                    <SelectValue placeholder="اختر المورد..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {suppliers.map(sup => (
                      <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>المبلغ المدفوع الآن</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  className="h-11 text-right" 
                  value={paidNow}
                  onChange={(e) => setPaidNow(parseFloat(e.target.value) || 0)}
                  placeholder="0.00 $"
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 mt-4 font-bold text-lg">
                تأكيد التوريد
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-col md:flex-row-reverse items-center justify-between gap-4">
            <CardTitle className="text-lg">سجل الحركات التاريخي</CardTitle>
            <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="ابحث بالاسم أو الكود..." 
                  className="pr-9 h-9 text-right" 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-44">
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input 
                  type="date"
                  className="pr-9 h-9 text-right block w-full"
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
                <TableRow>
                  <TableHead className="text-right">الوقت والمستخدم</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المادة</TableHead>
                  <TableHead className="text-center">الكمية</TableHead>
                  <TableHead className="text-left">إجمالي القيمة</TableHead>
                  {isAdmin() && <TableHead className="text-left">حذف</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin() ? 6 : 5} className="text-center py-12 text-muted-foreground italic">
                      لا توجد سجلات مطابقة للمعايير المحددة
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((move) => {
                    const item = items.find(i => i.id === move.itemId);
                    const user = users.find(u => u.id === move.userId);
                    return (
                      <TableRow key={move.id}>
                        <TableCell className="text-right">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold flex items-center gap-1 justify-end">
                              {new Date(move.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                              <Clock className="h-3 w-3" />
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                              {user?.username}
                              <User className="h-3 w-3" />
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {move.type === 'IN' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold">توريد (وارد)</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold">صرف (صادر)</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-sm">{item?.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{item?.code}</div>
                        </TableCell>
                        <TableCell className="text-center font-black">
                          {move.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-left font-mono font-bold text-[#336699]">
                          {(move.priceAtTime * move.quantity).toLocaleString()} $
                        </TableCell>
                        {isAdmin() && (
                          <TableCell className="text-left">
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMovement(move.id)}>
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
    </div>
  );
}
