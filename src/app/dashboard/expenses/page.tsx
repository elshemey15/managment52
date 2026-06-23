
"use client";

import React from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Plus, TrendingDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ExpensesPage() {
  const { expenses, addExpense, canEdit } = useWarehouse();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addExpense({
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
    });
    e.currentTarget.reset();
  };

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">General Expenses</h1>
          <p className="text-muted-foreground">Track operating costs (Rent, Electricity, etc.)</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Total Monthly Expenses</p>
          <h2 className="text-3xl font-black text-red-700">${totalExpenses.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Record Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input name="description" required placeholder="e.g. Warehouse Rent Feb" />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Expense Category</Label>
                <Input name="category" required placeholder="e.g. Utilities, Logistics" />
              </div>
              <Button type="submit" className="w-full bg-[#336699]" disabled={!canEdit()}>
                <Plus className="h-4 w-4 mr-2" /> Log Expense
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">No expenses recorded</TableCell>
                  </TableRow>
                ) : (
                  expenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-xs">{new Date(exp.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{exp.description}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{exp.category}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-red-600">
                        -${exp.amount.toLocaleString()}
                      </TableCell>
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
