
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Trash2, Calendar } from 'lucide-react';
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

export default function PurchasesPage() {
  const { suppliers, items, addPurchase, canEdit } = useWarehouse();
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<{itemId: string, qty: number, price: number}[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);

  const addItemToInvoice = () => {
    setInvoiceItems([...invoiceItems, { itemId: '', qty: 1, price: 0 }]);
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceItems];
    if (field === 'price' || field === 'qty') {
      (newItems[index] as any)[field] = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    } else {
      (newItems[index] as any)[field] = value;
    }
    
    if (field === 'itemId') {
      const item = items.find(i => i.id === value);
      if (item) newItems[index].price = item.purchasePrice || 0;
    }
    setInvoiceItems(newItems);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const totalValue = invoiceItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
  const remaining = totalValue - paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || invoiceItems.length === 0) return;

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    
    addPurchase({
      supplierId: selectedSupplierId,
      supplierName: supplier?.name || '',
      date: new Date(invoiceDate).toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      totalValue,
      paidAmount,
      items: invoiceItems
    }, invoiceItems.map(i => ({ itemId: i.itemId, qty: i.qty })));

    // Reset
    setSelectedSupplierId('');
    setInvoiceItems([]);
    setPaidAmount(0);
  };

  return (
    <div className="space-y-6 text-right">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">فواتير الشراء (المشتريات)</h1>
        <p className="text-muted-foreground font-medium">تسجيل توريد بضاعة جديدة، ربطها بالموردين وتحديث المخزون</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle className="text-lg flex items-center justify-end gap-2"><ShoppingCart className="h-5 w-5" /> فاتورة مشتريات جديدة</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>المورد</Label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger className="text-right"><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                  <SelectContent dir="rtl">
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تاريخ الفاتورة</Label>
                <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="text-right" />
              </div>
              <div className="space-y-2">
                <Label>تاريخ الاستحقاق (للدين)</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-right" />
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader><TableRow className="bg-slate-50">
                  <TableHead className="text-right">المادة</TableHead>
                  <TableHead className="text-center">الكمية</TableHead>
                  <TableHead className="text-center">سعر الوحدة</TableHead>
                  <TableHead className="text-left">الإجمالي</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {invoiceItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select value={item.itemId} onValueChange={(val) => updateInvoiceItem(idx, 'itemId', val)}>
                          <SelectTrigger className="text-right"><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                          <SelectContent dir="rtl">
                            {items.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.code})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Input type="number" step="any" value={item.qty} onChange={(e) => updateInvoiceItem(idx, 'qty', e.target.value)} className="text-center" /></TableCell>
                      <TableCell><Input type="number" step="any" value={item.price} onChange={(e) => updateInvoiceItem(idx, 'price', e.target.value)} className="text-center" /></TableCell>
                      <TableCell className="text-left font-mono font-bold">{(item.qty * item.price).toLocaleString()} $</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="ghost" onClick={addItemToInvoice} className="w-full h-12 border-t rounded-none text-[#336699] font-bold"><Plus className="ml-2 h-4 w-4" /> إضافة صنف للفاتورة</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-4 bg-slate-50 p-6 rounded-xl border">
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="font-bold text-slate-600">إجمالي الفاتورة:</span>
                  <span className="text-2xl font-black">{totalValue.toLocaleString()} $</span>
                </div>
                <div className="space-y-2">
                  <Label>المبلغ المدفوع الآن (نقدي)</Label>
                  <Input type="number" step="0.01" value={paidAmount} onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-right h-12 text-lg font-bold" />
                </div>
                <div className="flex justify-between items-center flex-row-reverse border-t pt-4">
                  <span className="font-bold text-red-600">المتبقي (مديونية):</span>
                  <span className="text-xl font-black text-red-700">{remaining.toLocaleString()} $</span>
                </div>
              </div>
              <Button type="submit" className="h-14 bg-[#336699] text-xl font-bold shadow-lg" disabled={!canEdit() || totalValue <= 0}>حفظ الفاتورة وتحديث المخازن</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
