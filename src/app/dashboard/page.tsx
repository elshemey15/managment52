
"use client";

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

export default function DashboardOverview() {
  const { items, movements, debtAccounts } = useWarehouse();
  const [consumptionPeriod, setConsumptionPeriod] = useState('daily');

  const lowStockItems = items.filter(i => i.currentStock < 10);
  const totalDebt = debtAccounts.filter(a => a.type === 'SUPPLIER').reduce((acc, a) => acc + a.balance, 0);
  const totalReceivables = debtAccounts.filter(a => a.type === 'CUSTOMER').reduce((acc, a) => acc + Math.abs(a.balance), 0);

  const stats = [
    { title: 'إجمالي المواد', value: items.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'نقص المخزون', value: lowStockItems.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'ديون الموردين', value: `${totalDebt.toLocaleString()} $`, icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'مستحقات العملاء', value: `${totalReceivables.toLocaleString()} $`, icon: ArrowDownRight, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  // Logic to calculate top consumed items based on period
  const topConsumedData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (consumptionPeriod === 'daily') startDate.setHours(0, 0, 0, 0);
    else if (consumptionPeriod === 'weekly') startDate.setDate(now.getDate() - 7);
    else if (consumptionPeriod === 'monthly') startDate.setMonth(now.getMonth() - 1);

    const outMovements = movements.filter(m => 
      m.type === 'OUT' && new Date(m.timestamp) >= startDate
    );

    const consumptionMap: Record<string, number> = {};
    outMovements.forEach(m => {
      consumptionMap[m.itemId] = (consumptionMap[m.itemId] || 0) + m.quantity;
    });

    return Object.entries(consumptionMap)
      .map(([itemId, quantity]) => {
        const item = items.find(i => i.id === itemId);
        return {
          name: item?.name || 'مادة محذوفة',
          quantity: quantity
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [movements, items, consumptionPeriod]);

  const stockLevelData = items.slice(0, 8).map(item => ({
    name: item.name,
    stock: item.currentStock
  }));

  return (
    <div className="space-y-8 text-right">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">لوحة التحكم العامة</h1>
        <p className="text-muted-foreground mt-1 font-medium">إحصائيات فورية ومؤشرات المخزون الرئيسية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="flex items-center gap-4 p-6 justify-between flex-row-reverse">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-black">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Consumption Analysis Section */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 flex-row-reverse">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              الأكثر استهلاكاً (صرف)
            </CardTitle>
            <Tabs defaultValue="daily" onValueChange={setConsumptionPeriod} className="w-auto" dir="rtl">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="daily" className="text-xs font-bold">يومي</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs font-bold">أسبوعي</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs font-bold">شهري</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {topConsumedData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topConsumedData} layout="vertical" margin={{ right: 30, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100} 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      orientation="right"
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'right' }}
                    />
                    <Bar dataKey="quantity" name="الكمية المصروفة" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground italic">
                <BarChart2 className="h-12 w-12 opacity-20 mb-2" />
                <p>لا توجد بيانات صرف لهذه الفترة</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-right text-lg">مستويات المخزون الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockLevelData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} orientation="right" />
                  <Tooltip 
                    cursor={{fill: '#f0f0f0'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'right' }}
                  />
                  <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                    {stockLevelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.stock < 10 ? '#F2AE33' : '#336699'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-right text-lg">أحدث الحركات في المستودع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {movements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 col-span-full">لا توجد حركات حديثة</p>
              ) : (
                movements.slice(0, 5).map((move) => {
                  const item = items.find(i => i.id === move.itemId);
                  return (
                    <div key={move.id} className="flex flex-col p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${move.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                           {move.type === 'IN' ? 'وارد' : 'صادر'}
                         </span>
                         <span className="text-[10px] text-muted-foreground">
                           {new Date(move.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <p className="text-sm font-bold truncate mb-1">{item?.name || 'مادة محذوفة'}</p>
                      <p className="text-lg font-black text-[#336699]">{move.quantity.toLocaleString()} <span className="text-[10px] text-muted-foreground">وحدة</span></p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
