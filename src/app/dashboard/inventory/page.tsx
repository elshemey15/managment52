
"use client";

import React, { useState, useEffect } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Edit2, Trash2, Package, ArrowDownLeft, ArrowUpRight, Sparkles } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const { items, categories, departments, addItem, updateItem, deleteItem, addMovement, debtAccounts, canEdit, isAdmin } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');

  // Dialog States for New Item
  const [dialogDeptId, setDialogDeptId] = useState<string>('');
  const [dialogCatId, setDialogCatId] = useState<string>('');
  const [dialogItemName, setDialogItemName] = useState<string>('');
  const [dialogItemCode, setDialogItemCode] = useState<string>('');

  useEffect(() => {
    if (isDialogOpen && !editingItem && dialogItemName && dialogCatId) {
      const dept = departments.find(d => d.id === dialogDeptId);
      const cat = categories.find(c => c.id === dialogCatId);
      const prefix = (dept?.name?.substring(0, 2) || 'X').toUpperCase();
      const catPrefix = (cat?.name?.substring(0, 2) || 'Y').toUpperCase();
      const random = Math.floor(1000 + Math.random() * 9000);
      setDialogItemCode(`${prefix}${catPrefix}-${random}`);
    }
  }, [dialogItemName, dialogCatId, isDialogOpen, editingItem, dialogDeptId, departments, categories]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetDialog = () => {
    setEditingItem(null);
    setDialogDeptId('');
    setDialogCatId('');
    setDialogItemName('');
    setDialogItemCode('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: dialogItemName,
      code: dialogItemCode,
      categoryId: dialogCatId,
      unit: formData.get('unit') as string,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      salePrice: parseFloat(formData.get('salePrice') as string),
      currentStock: parseInt(formData.get('currentStock') as string || '0'),
    };

    if (!itemData.categoryId) return toast({ title: 'يرجى اختيار القسم والتصنيف', variant: 'destructive' });

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
          <p className="text-muted-foreground font-medium">إدارة الكميات، الصرف، والوارد في مكان واحد</p>
        </div>
        {canEdit() && (
          <Dialog open={isDialogOpen} onOpenChange={(val) => {
            setIsDialogOpen(val);
            if (!val) resetDialog();
            if (val && editingItem) {
              setDialogItemName(editingItem.name);
              setDialogItemCode(editingItem.code);
              setDialogCatId(editingItem.categoryId);
              const cat = categories.find(c => c.id === editingItem.categoryId);
              if (cat) setDialogDeptId(cat.departmentId);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#336699] hover:bg-[#2a5580] font-bold">
                <Plus className="h-4 w-4 ml-2" /> إضافة مادة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">{editingItem ? 'تعديل بيانات المادة' : 'إنشاء صنف جديد'}</DialogTitle>
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
                    <Label>التصنيف</Label>
                    <Select value={dialogCatId} onValueChange={setDialogCatId} disabled={!dialogDeptId}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {categories.filter(c => c.departmentId === dialogDeptId).map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">اسم المادة</Label>
                  <Input 
                    id="name" 
                    value={dialogItemName} 
                    onChange={(e) => setDialogItemName(e.target.value)} 
                    required 
                    placeholder="اسم المادة بالكامل" 
                    className="text-right" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center gap-1 justify-end text-blue-600">
                      كود المادة (تلقائي) <Sparkles className="h-3 w-3" />
                    </Label>
                    <Input 
                      id="code" 
                      value={dialogItemCode} 
                      onChange={(e) => setDialogItemCode(e.target.value)} 
                      required 
                      className="text-right font-mono bg-slate-50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">وحدة القياس</Label>
                    <Input id="unit" name="unit" defaultValue={editingItem?.unit} required placeholder="مثال: قطعة، كجم" className="text-right" />
                  </div>
                </div>

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

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white/50 border-b">
          <div className="flex flex-col md:flex-row-reverse gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="ابحث بالاسم أو الكود..." 
                className="pr-9 text-right font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-row-reverse">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] text-right">
                  <SelectValue placeholder="تصفية حسب التصنيف" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">كل التصنيفات</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[120px] text-right">الكود</TableHead>
                <TableHead className="text-right">اسم المادة</TableHead>
                <TableHead className="text-center">الكمية المتاحة</TableHead>
                <TableHead className="text-center">تسجيل حركة</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="w-[120px] text-center">خيارات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    لم يتم العثور على أي مواد مطابقة
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  return (
                    <TableRow key={item.id} className="group">
                      <TableCell className="font-mono text-xs font-bold text-right">{item.code}</TableCell>
                      <TableCell className="font-bold text-right">{item.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="text-xl font-black text-[#336699]">{item.currentStock}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{item.unit}</div>
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
                          <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">مخزون منخفض</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">متوفر</Badge>
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
        </CardContent>
      </Card>

      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent dir="rtl" className="text-right">
          <DialogHeader>
            <DialogTitle>تسجيل {movementType === 'IN' ? 'وارد (توريد)' : 'صادر (صرف)'} للمادة</DialogTitle>
          </DialogHeader>
          {activeItem && (
            <form onSubmit={handleMovementSubmit} className="space-y-4 py-4">
              <div className="bg-slate-50 p-3 rounded-lg border">
                <p className="text-sm font-bold">{activeItem.name}</p>
                <p className="text-xs text-muted-foreground">الكود: {activeItem.code} | المتوفر: {activeItem.currentStock} {activeItem.unit}</p>
              </div>
              <div className="space-y-2">
                <Label>الكمية ({activeItem.unit})</Label>
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
