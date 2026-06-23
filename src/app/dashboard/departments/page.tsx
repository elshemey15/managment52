
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Layers } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DepartmentsPage() {
  const { departments, categories, addDepartment, deleteDepartment, canEdit, isAdmin } = useWarehouse();
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    addDepartment({ name: newName });
    setNewName('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">أقسام المستودع</h1>
        <p className="text-muted-foreground font-medium">الطبقة العليا لتنظيم المخزون</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-right flex items-center gap-2 justify-end">
              إضافة قسم جديد
              <Layers className="h-5 w-5 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4 text-right">
              <div className="space-y-2">
                <Label htmlFor="deptname">اسم القسم</Label>
                <Input 
                  id="deptname" 
                  placeholder="مثال: المواد الكهربائية" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={!canEdit()}
                  className="text-right"
                />
              </div>
              <Button type="submit" className="w-full bg-[#336699] font-bold" disabled={!canEdit()}>
                <Plus className="h-4 w-4 ml-2" /> إضافة القسم
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right">اسم القسم</TableHead>
                  <TableHead className="text-center">عدد التصنيفات</TableHead>
                  {isAdmin() && <TableHead className="text-left">خيارات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-bold text-right">{dept.name}</TableCell>
                    <TableCell className="text-center font-black">
                      {categories.filter(c => c.departmentId === dept.id).length}
                    </TableCell>
                    {isAdmin() && (
                      <TableCell className="text-left">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteDepartment(dept.id)}
                        >
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
      </div>
    </div>
  );
}
