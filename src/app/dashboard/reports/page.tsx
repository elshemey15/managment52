
"use client";

import React from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, TrendingDown, Package, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const { items, movements, debtAccounts, expenses, isAdmin } = useWarehouse();

  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Only system administrators can view financial reports.</p>
      </div>
    );
  }

  const stockValueByCategory = items.reduce((acc: any, item) => {
    const val = item.currentStock * item.purchasePrice;
    acc[item.categoryId] = (acc[item.categoryId] || 0) + val;
    return acc;
  }, {});

  const totalSupplierDebt = debtAccounts.filter(a => a.type === 'SUPPLIER').reduce((acc, a) => acc + a.balance, 0);
  const totalCustomerDebt = debtAccounts.filter(a => a.type === 'CUSTOMER').reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const inventoryValue = items.reduce((acc, i) => acc + (i.currentStock * i.purchasePrice), 0);

  const COLORS = ['#336699', '#F2AE33', '#10b981', '#ef4444', '#8b5cf6'];

  const movementSummary = movements.reduce((acc: any, move) => {
    const date = new Date(move.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = { date, in: 0, out: 0 };
    if (move.type === 'IN') acc[date].in += move.quantity;
    else acc[date].out += move.quantity;
    return acc;
  }, {});

  const movementData = Object.values(movementSummary).slice(-7);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">Financial Reports</h1>
        <p className="text-muted-foreground">Comprehensive overview of assets, debts and flows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#336699] text-white">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Inventory Asset Value</p>
            <h3 className="text-3xl font-black">${inventoryValue.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-emerald-600 text-white">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Accounts Receivable</p>
            <h3 className="text-3xl font-black">${totalCustomerDebt.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-red-600 text-white">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Accounts Payable</p>
            <h3 className="text-3xl font-black">${totalSupplierDebt.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 text-white">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Accumulated Expenses</p>
            <h3 className="text-3xl font-black">${totalExpenses.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Inventory Flow (Last 7 Active Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="in" name="Stock In" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="out" name="Stock Out" fill="#F2AE33" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Inventory', value: inventoryValue },
                      { name: 'Receivables', value: totalCustomerDebt }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#336699" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip />
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
