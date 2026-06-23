
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
  DollarSign,
  ShoppingCart,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardOverview() {
  const { items, suppliers, purchases, movements } = useWarehouse();

  // الحسابات المالية
  const inventoryValue = useMemo(() => items.reduce((acc, i) => acc + (i.currentStock * (i.purchasePrice || 0)), 0), [items]);
  const totalDebt = useMemo(() => suppliers.reduce((acc, s) => acc + s.balance, 0), [suppliers]);
  const netAssets = inventoryValue - totalDebt;
  const totalInvoices = purchases.length;
  const lowStock = items.filter(i => i.currentStock < 10).length;

  const stats = [
    { title: 'إجمالي قيمة المخزن (الأصول)', value: `${inventoryValue.toLocaleString()} $`, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'ديون الموردين', value: `${totalDebt.toLocaleString()} $`, icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'صافي قيمة الأصول (المدفوع)', value: `${netAssets.toLocaleString()} $`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'إجمالي الفواتير', value: totalInvoices, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  // تحليل المنتجات الأكثر حركة
  const getTopItems = (type: 'IN' | 'OUT', days: number) => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    
    const itemMap = new Map<string, number>();
    movements.filter(m => {
      // التعامل مع التوقيت سواء كان Timestamp من Firebase أو Date عادي
      let mDate;
      if (m.timestamp && typeof (m.timestamp as any).toDate === 'function') {
        mDate = (m.timestamp as any).toDate();
      } else {
        mDate = new Date(m.timestamp);
      }
      return m.type === type && mDate >= startDate;
    }).forEach(m => {
      itemMap.set(m.itemId, (itemMap.get(m.itemId) || 0) + m.quantity);
    });

    return Array.from(itemMap.entries())
      .map(([id, qty]) => ({
        name: items.find(i => i.id === id)?.name || 'غير معروف',
        quantity: qty
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const stockLevelData = items.slice(0, 8).map(item => ({
    name: item.name,
    stock: item.currentStock
  }));

  return (
    <div className="space-y-8 text-right">
      <div className="flex justify-between items-end flex-row-reverse">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">نظرة عامة على النظام</h1>
          <p className="text-muted-foreground mt-1 font-medium">الوضع المالي وحركة المخزون اللحظية</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 font-bold">
          <Activity className="h-4 w-4" />
          النظام يعمل سحابياً ومحدث دائماً
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 p-6 justify-between flex-row-reverse">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}><stat.icon className="h-6 w-6" /></div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground">{stat.title}</p>
                <h3 className="text-xl font-black">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-right text-lg flex items-center justify-end gap-2">
              <TrendingUp className="h-5 w-5 text-[#336699]" />
              تحليل المنتجات الأكثر حركة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" dir="rtl">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="daily">يومي</TabsTrigger>
                <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
                <TabsTrigger value="monthly">شهري</TabsTrigger>
              </TabsList>
              
              {['daily', 'weekly', 'monthly'].map((period) => {
                const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
                const topIn = getTopItems('IN', days);
                const topOut = getTopItems('OUT', days);
                
                return (
                  <TabsContent key={period} value={period} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 justify-end text-emerald-600 font-bold text-sm mb-2">
                          الأكثر وروداً (شراء)
                          <ArrowDownCircle className="h-4 w-4" />
                        </div>
                        {topIn.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4 italic">لا توجد عمليات توريد</p> : 
                          topIn.map(item => (
                            <div key={item.name} className="flex justify-between items-center bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                              <span className="font-mono font-bold text-emerald-700">{item.quantity.toLocaleString()}</span>
                              <span className="text-sm font-bold truncate max-w-[150px]">{item.name}</span>
                            </div>
                          ))
                        }
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 justify-end text-amber-600 font-bold text-sm mb-2">
                          الأكثر استهلاكاً (صرف)
                          <ArrowUpCircle className="h-4 w-4" />
                        </div>
                        {topOut.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4 italic">لا توجد عمليات صرف</p> : 
                          topOut.map(item => (
                            <div key={item.name} className="flex justify-between items-center bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                              <span className="font-mono font-bold text-amber-700">{item.quantity.toLocaleString()}</span>
                              <span className="text-sm font-bold truncate max-w-[150px]">{item.name}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-[#336699] text-white">
            <CardHeader><CardTitle className="text-right text-lg">تنبيهات هامة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {lowStock > 0 && (
                <div className="bg-white/10 p-4 rounded-lg flex items-center justify-between flex-row-reverse border border-white/20">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    <span className="font-bold text-sm">أصناف تحت حد الطلب</span>
                  </div>
                  <span className="bg-amber-400 text-[#336699] px-3 py-0.5 rounded-full font-black text-xs">{lowStock}</span>
                </div>
              )}
              <div className="bg-white/10 p-4 rounded-lg flex items-center justify-between flex-row-reverse border border-white/20">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-sm">إجمالي المديونية الحالية</span>
                </div>
                <span className="text-lg font-black">{totalDebt.toLocaleString()} $</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-right text-sm font-bold">مستويات التوفر</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockLevelData}>
                    <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                      {stockLevelData.map((e, idx) => <Cell key={idx} fill={e.stock < 10 ? '#ef4444' : '#336699'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
