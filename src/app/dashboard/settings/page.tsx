
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, UserCog, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
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
import { UserRole } from '@/app/lib/types';

export default function SettingsPage() {
  const { users, addUser, deleteUser, currentUser, isAdmin } = useWarehouse();
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Logger');

  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center" dir="rtl">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4 opacity-50" />
        <h2 className="text-2xl font-bold">دخول مرفوض</h2>
        <p className="text-muted-foreground font-medium">فقط مدراء النظام يمكنهم الوصول لإعدادات المستخدمين.</p>
      </div>
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername) return;
    addUser({ username: newUsername, role: newRole });
    setNewUsername('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-right" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">إعدادات المستخدمين</h1>
        <p className="text-muted-foreground font-medium">إدارة صلاحيات الوصول والحسابات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 justify-end">
              إضافة مستخدم جديد
              <UserCog className="h-5 w-5 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label>اسم المستخدم</Label>
                <Input 
                  placeholder="مثال: Ahmed_2024" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label>الصلاحية</Label>
                <Select value={newRole} onValueChange={(val: UserRole) => setNewRole(val)}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="Admin">مدير نظام (Admin)</SelectItem>
                    <SelectItem value="Editor">محرر (Editor)</SelectItem>
                    <SelectItem value="Logger">مدخل بيانات (Logger)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-[#336699] font-bold">
                <Plus className="h-4 w-4 ml-2" /> إنشاء الحساب
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-center">الصلاحية</TableHead>
                  <TableHead className="text-left">خيارات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-bold text-right flex items-center gap-2 justify-end">
                      {user.username}
                      {user.id === currentUser?.id && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">أنت</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {user.role === 'Admin' && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                        {user.role === 'Editor' && <Shield className="h-4 w-4 text-[#336699]" />}
                        <span className="font-medium">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => deleteUser(user.id)}
                        disabled={user.id === currentUser?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
