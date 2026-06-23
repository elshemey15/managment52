
"use client";

import React from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Wallet,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DashboardOverview() {
  const { items, movements, debtAccounts, expenses } = useWarehouse();

  const lowStockItems = items.filter(i => i.currentStock < 10);
  const totalStockValue = items.reduce((acc, item) => acc + (item.currentStock * item.purchasePrice), 0);
  const totalDebt = debtAccounts.filter(a => a.type === 'SUPPLIER').reduce((acc, a) => acc + a.balance, 0);
  const totalReceivables = debtAccounts.filter(a => a.type === 'CUSTOMER').reduce((acc, a) => acc + Math.abs(a.balance), 0);

  const stats = [
    { title: 'Total Items', value: items.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Low Stock', value: lowStockItems.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Supplier Debt', value: `$${totalDebt.toLocaleString()}`, icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'Total Receivables', value: `$${totalReceivables.toLocaleString()}`, icon: ArrowDownRight, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  const chartData = items.slice(0, 8).map(item => ({
    name: item.name,
    stock: item.currentStock
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time stats and key inventory indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f0f0f0'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.stock < 10 ? '#F2AE33' : '#336699'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {movements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent movements</p>
              ) : (
                movements.slice(0, 5).map((move) => {
                  const item = items.find(i => i.id === move.itemId);
                  return (
                    <div key={move.id} className="flex items-start gap-4">
                      <div className={`mt-1 p-1.5 rounded-full ${move.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {move.type === 'IN' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {move.type === 'IN' ? 'Stock In' : 'Stock Out'} • {move.quantity} {item?.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(move.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
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
