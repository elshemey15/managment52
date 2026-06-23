
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Scale } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function UnitsPage() {
  const { units, items, addUnit, deleteUnit, canEdit, isAdmin } = useWarehouse();
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    addUnit({ name: newName });
    setNewName('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">وحدات القياس</h1>
        <p className="text-muted-foreground font-medium">إدارة وحدات تعبئة وقياس المواد في المستودع</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-right flex items-center gap-2 justify-end">
              إضافة وحدة جديدة
              <Scale className="h-5 w-5 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4 text-right">
              <div className="space-y-2">
                <Label htmlFor="unitname">اسم الوحدة</Label>
                <Input 
                  id="unitname" 
                  placeholder="مثال: كرتونة، كجم" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={!canEdit()}
                  className="text-right"
                />
              </div>
              <Button type="submit" className="w-full bg-[#336699] font-bold" disabled={!canEdit()}>
                <Plus className="h-4 w-4 ml-2" /> إضافة الوحدة
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right">اسم الوحدة</TableHead>
                  <TableHead className="text-center">عدد المواد المرتبطة</TableHead>
                  {isAdmin() && <TableHead className="text-left">خيارات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">لم يتم إضافة وحدات قياس بعد</TableCell>
                  </TableRow>
                ) : (
                  units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-bold text-right">{unit.name}</TableCell>
                      <TableCell className="text-center font-black">
                        {items.filter(i => i.unitId === unit.id).length}
                      </TableCell>
                      {isAdmin() && (
                        <TableCell className="text-left">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => deleteUnit(unit.id)}
                          >
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
