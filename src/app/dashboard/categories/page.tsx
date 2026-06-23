
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Tags } from 'lucide-react';
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

export default function CategoriesPage() {
  const { categories, addCategory, deleteCategory, items, departments, canEdit, isAdmin } = useWarehouse();
  const [newCatName, setNewCatName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !selectedDeptId) return;
    addCategory({ name: newCatName, departmentId: selectedDeptId });
    setNewCatName('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">تصنيفات المنتجات</h1>
        <p className="text-muted-foreground font-medium">تنظيم المخزون حسب النوع والقسم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-right flex items-center gap-2 justify-end">
              إضافة تصنيف جديد
              <Tags className="h-5 w-5 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4 text-right">
              <div className="space-y-2">
                <Label>القسم التابع له</Label>
                <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
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
                <Label htmlFor="catname">اسم التصنيف</Label>
                <Input 
                  id="catname" 
                  placeholder="مثال: كابلات نحاس" 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)}
                  disabled={!canEdit()}
                  className="text-right"
                />
              </div>
              <Button type="submit" className="w-full bg-[#336699] font-bold" disabled={!canEdit() || !selectedDeptId}>
                <Plus className="h-4 w-4 ml-2" /> إضافة التصنيف
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right">اسم التصنيف</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-center">عدد المواد</TableHead>
                  {isAdmin() && <TableHead className="text-left">خيارات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => {
                  const dept = departments.find(d => d.id === cat.departmentId);
                  return (
                    <TableRow key={cat.id}>
                      <TableCell className="font-bold text-right">{cat.name}</TableCell>
                      <TableCell className="text-right">{dept?.name || '-'}</TableCell>
                      <TableCell className="text-center font-black">
                        {items.filter(i => i.categoryId === cat.id).length}
                      </TableCell>
                      {isAdmin() && (
                        <TableCell className="text-left">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => deleteCategory(cat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
