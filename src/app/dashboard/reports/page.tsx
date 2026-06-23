
"use client";

import React from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { ShieldCheck, TrendingDown, TrendingUp, Wallet, Package } from 'lucide-react';

export default function ReportsPage() {
  const { items, suppliers, purchases, payments, expenses, isAdmin } = useWarehouse();

  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center" dir="rtl">
        <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-bold">دخول مرفوض</h2>
        <p className="text-muted-foreground font-medium">فقط مدراء النظام يمكنهم استعراض التقارير المالية التفصيلية.</p>
      </div>
    );
  }

  // المحاسبة المالية
  const totalSupplierDebt = suppliers.reduce((acc, s) => acc + s.balance, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const inventoryValue = items.reduce((acc, i) => acc + (i.currentStock * i.purchasePrice), 0);
  const paidInventoryValue = Math.max(0, inventoryValue - totalSupplierDebt);
  const unpaidInventoryValue = totalSupplierDebt;
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);

  // إحصائيات المشتريات لآخر 7 أيام
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const purchaseHistoryData = last7Days.map(date => {
    const dailyTotal = purchases
      .filter(p => p.date.startsWith(date))
      .reduce((acc, p) => acc + p.totalValue, 0);
    return { date, value: dailyTotal };
  });

  return (
    <div className="space-y-8 text-right">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">التقارير المالية والتحليلية</h1>
        <p className="text-muted-foreground font-medium">نظرة شاملة على الأصول، الديون، والتدفقات النقدية للموردين</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#336699] text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start flex-row-reverse">
              <Package className="h-5 w-5 opacity-50" />
              <div className="text-right">
                <p className="text-xs font-bold opacity-80 mb-1">إجمالي قيمة المخزن</p>
                <h3 className="text-2xl font-black">{inventoryValue.toLocaleString()} $</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start flex-row-reverse">
              <TrendingUp className="h-5 w-5 opacity-50" />
              <div className="text-right">
                <p className="text-xs font-bold opacity-80 mb-1">المخزن المدفوع</p>
                <h3 className="text-2xl font-black">{paidInventoryValue.toLocaleString()} $</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start flex-row-reverse">
              <TrendingDown className="h-5 w-5 opacity-50" />
              <div className="text-right">
                <p className="text-xs font-bold opacity-80 mb-1">ديون الموردين</p>
                <h3 className="text-2xl font-black">{totalSupplierDebt.toLocaleString()} $</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start flex-row-reverse">
              <Wallet className="h-5 w-5 opacity-50" />
              <div className="text-right">
                <p className="text-xs font-bold opacity-80 mb-1">إجمالي المصاريف</p>
                <h3 className="text-2xl font-black">{totalExpenses.toLocaleString()} $</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-right text-lg font-bold">حجم المشتريات (آخر 7 أيام)</CardTitle>
          </CardHeader>
          <CardContent dir="ltr">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchaseHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={10} tickFormatter={(str) => str.split('-').slice(1).join('/')} />
                  <YAxis fontSize={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'right' }}
                  />
                  <Bar dataKey="value" name="مشتريات" fill="#336699" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-right text-lg font-bold">توزيع قيمة الأصول</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'مخزن مدفوع', value: paidInventoryValue },
                      { name: 'ديون موردين', value: unpaidInventoryValue }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={{ textAlign: 'right' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
