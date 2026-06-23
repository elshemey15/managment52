
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Package, ArrowDownLeft, ArrowUpRight, FolderOpen, Layers } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const { items, departments, units, addItem, updateItem, deleteItem, addMovement, debtAccounts, canEdit, isAdmin } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');

  const [dialogDeptId, setDialogDeptId] = useState<string>('');
  const [dialogUnitId, setDialogUnitId] = useState<string>('');

  const filteredItems = items.filter(item => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           item.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const resetDialog = () => {
    setEditingItem(null);
    setDialogDeptId('');
    setDialogUnitId('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name') as string,
      departmentId: dialogDeptId,
      unitId: dialogUnitId,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      salePrice: parseFloat(formData.get('salePrice') as string),
      currentStock: parseInt(formData.get('currentStock') as string || '0'),
    };

    if (!itemData.departmentId) return toast({ title: 'يرجى اختيار القسم', variant: 'destructive' });
    if (!itemData.unitId) return toast({ title: 'يرجى اختيار وحدة القياس', variant: 'destructive' });

    if (editingItem) {
      updateItem(editingItem.id, itemData);
    } else {
      addItem(itemData);
    }
    
    setIsDialogOpen(false);
    resetDialog();
  };

  const handleMovementSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const qty = parseInt(formData.get('quantity') as string);
    const debtAccId = formData.get('debtAccountId') as string;

    if (movementType === 'OUT' && activeItem.currentStock < qty) {
      return toast({ title: 'المخزون غير كافٍ!', variant: 'destructive' });
    }

    addMovement({
      itemId: activeItem.id,
      type: movementType,
      quantity: qty,
      priceAtTime: movementType === 'IN' ? activeItem.purchasePrice : activeItem.salePrice,
      debtAccountId: debtAccId === 'none' ? undefined : debtAccId
    });

    setIsMovementDialogOpen(false);
    setActiveItem(null);
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">مخزن المواد (المستودع)</h1>
          <p className="text-muted-foreground font-medium">إدارة الكميات والعمليات حسب الأقسام</p>
        </div>
        {canEdit() && (
          <Dialog open={isDialogOpen} onOpenChange={(val) => {
            setIsDialogOpen(val);
            if (!val) resetDialog();
            if (val && editingItem) {
              setDialogDeptId(editingItem.departmentId);
              setDialogUnitId(editingItem.unitId);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#336699] hover:bg-[#2a5580] font-bold">
                <Plus className="h-4 w-4 ml-2" /> إضافة مادة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">{editingItem ? 'تعديل بيانات المادة' : 'إنشاء مادة جديدة'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4 text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>القسم</Label>
                    <Select value={dialogDeptId} onValueChange={setDialogDeptId}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {departments.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>وحدة القياس</Label>
                    <Select value={dialogUnitId} onValueChange={setDialogUnitId}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر الوحدة" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {units.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">اسم المادة</Label>
                  <Input 
                    id="name" 
                    name="name"
                    defaultValue={editingItem?.name}
                    required 
                    placeholder="مثال: بطيخ أحمر كبير" 
                    className="text-right" 
                  />
                </div>

                {!editingItem && (
                   <p className="text-[10px] text-blue-600 font-bold">* سيتم توليد الكود تلقائياً عند الحفظ</p>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">سعر الشراء</Label>
                    <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" defaultValue={editingItem?.purchasePrice} required className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">سعر البيع</Label>
                    <Input id="salePrice" name="salePrice" type="number" step="0.01" defaultValue={editingItem?.salePrice} required className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">المخزون الحالي</Label>
                    <Input id="currentStock" name="currentStock" type="number" defaultValue={editingItem?.currentStock || 0} className="text-right" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full bg-[#336699] font-bold">
                    {editingItem ? 'تحديث البيانات' : 'حفظ الصنف'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="ابحث بالاسم أو الكود في جميع الأقسام..." 
          className="pr-9 text-right font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {departments.map((dept) => {
          const deptItems = filteredItems.filter(i => i.departmentId === dept.id);
          if (searchTerm && deptItems.length === 0) return null;

          return (
            <AccordionItem key={dept.id} value={dept.id} className="border rounded-xl bg-white shadow-sm overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 flex-row-reverse w-full">
                  <div className="p-2 bg-[#336699]/10 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-[#336699]" />
                  </div>
                  <div className="text-right flex-1">
                    <span className="text-lg font-black text-slate-800">{dept.name}</span>
                    <p className="text-xs text-muted-foreground font-bold">يحتوي على {deptItems.length} مادة</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0 border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="w-[80px] text-right">الكود</TableHead>
                      <TableHead className="text-right">اسم المادة</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-center">تسجيل حركة</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="w-[100px] text-center">خيارات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deptItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                          لا توجد مواد في هذا القسم حالياً
                        </TableCell>
                      </TableRow>
                    ) : (
                      deptItems.map((item) => {
                        const unit = units.find(u => u.id === item.unitId);
                        return (
                          <TableRow key={item.id} className="hover:bg-slate-50/30">
                            <TableCell className="font-mono text-xs font-bold text-right text-[#336699]">{item.code}</TableCell>
                            <TableCell className="font-bold text-right">{item.name}</TableCell>
                            <TableCell className="text-center">
                              <div className="text-lg font-black text-slate-700">{item.currentStock}</div>
                              <div className="text-[10px] text-muted-foreground font-bold">{unit?.name || 'قطعة'}</div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 h-8 font-bold"
                                  onClick={() => {
                                    setActiveItem(item);
                                    setMovementType('IN');
                                    setIsMovementDialogOpen(true);
                                  }}
                                >
                                  <ArrowDownLeft className="h-3 w-3 ml-1" /> وارد
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-amber-600 border-amber-600 hover:bg-amber-50 h-8 font-bold"
                                  onClick={() => {
                                    setActiveItem(item);
                                    setMovementType('OUT');
                                    setIsMovementDialogOpen(true);
                                  }}
                                >
                                  <ArrowUpRight className="h-3 w-3 ml-1" /> صرف
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {item.currentStock < 10 ? (
                                <Badge variant="destructive" className="bg-red-100 text-red-700 border-none font-bold">منخفض</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none font-bold">متوفر</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => {
                                  setEditingItem(item);
                                  setIsDialogOpen(true);
                                }}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                {isAdmin() && (
                                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent dir="rtl" className="text-right">
          <DialogHeader>
            <DialogTitle>تسجيل {movementType === 'IN' ? 'وارد (توريد)' : 'صادر (صرف)'} للمادة</DialogTitle>
          </DialogHeader>
          {activeItem && (
            <form onSubmit={handleMovementSubmit} className="space-y-4 py-4">
              <div className="bg-slate-50 p-3 rounded-lg border">
                <p className="text-sm font-bold">{activeItem.name}</p>
                <p className="text-xs text-muted-foreground">الكود: {activeItem.code} | المتوفر: {activeItem.currentStock}</p>
              </div>
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input name="quantity" type="number" min="1" required className="text-right" defaultValue="1" />
              </div>
              <div className="space-y-2">
                <Label>ربط بحساب (دين / ذمة)</Label>
                <Select name="debtAccountId" defaultValue="none">
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="none">بدون ربط (نقدي)</SelectItem>
                    {debtAccounts
                      .filter(a => a.type === (movementType === 'IN' ? 'SUPPLIER' : 'CUSTOMER'))
                      .map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className={`w-full font-bold ${movementType === 'IN' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                  تأكيد العملية
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
