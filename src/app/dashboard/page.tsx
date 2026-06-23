
"use client";

import React, { useMemo } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  TrendingUp,
  CreditCard,
  DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function DashboardOverview() {
  const { items, suppliers, purchases } = useWarehouse();

  const inventoryValue = useMemo(() => items.reduce((acc, i) => acc + (i.currentStock * i.purchasePrice), 0), [items]);
  const totalDebt = useMemo(() => suppliers.reduce((acc, s) => acc + s.balance, 0), [suppliers]);
  const paidInventory = inventoryValue - totalDebt;
  const lowStock = items.filter(i => i.currentStock < 10).length;

  const unpaidInvoicesCount = purchases.filter(p => p.status !== 'PAID').length;

  const stats = [
    { title: 'قيمة المخزون الكلية', value: `${inventoryValue.toLocaleString()} $`, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'ديون الموردين', value: `${totalDebt.toLocaleString()} $`, icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'المخزون المدفوع', value: `${paidInventory.toLocaleString()} $`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'فواتير غير مسددة', value: unpaidInvoicesCount, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const stockLevelData = items.slice(0, 8).map(item => ({
    name: item.name,
    stock: item.currentStock
  }));

  return (
    <div className="space-y-8 text-right">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">لوحة التحكم المالية والمخزنية</h1>
        <p className="text-muted-foreground mt-1 font-medium">مؤشرات الأداء اللحظية ومركز مراقبة الديون</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 p-6 justify-between flex-row-reverse">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}><stat.icon className="h-6 w-6" /></div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-black">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-right text-lg">مستويات المخزون</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockLevelData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis orientation="right" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                    {stockLevelData.map((e, idx) => <Cell key={idx} fill={e.stock < 10 ? '#ef4444' : '#336699'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-[#336699] text-white">
          <CardHeader><CardTitle className="text-right text-lg">تنبيهات هامة</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {lowStock > 0 && (
              <div className="bg-white/10 p-4 rounded-lg flex items-center justify-between flex-row-reverse">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <span className="font-bold">أصناف شارفت على الانتهاء</span>
                </div>
                <span className="bg-amber-400 text-[#336699] px-2 py-0.5 rounded font-black">{lowStock}</span>
              </div>
            )}
            <div className="bg-white/10 p-4 rounded-lg flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="font-bold">إجمالي المديونية الحالية</span>
              </div>
              <span className="text-xl font-black">{totalDebt.toLocaleString()} $</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
