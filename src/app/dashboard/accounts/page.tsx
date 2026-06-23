
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, CreditCard, Receipt, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AccountsPage() {
  const { debtAccounts, addDebtAccount, addRepayment, repayments, canEdit } = useWarehouse();
  const [isAccDialogOpen, setIsAccDialogOpen] = useState(false);
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false);

  const handleCreateAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addDebtAccount({
      name: formData.get('name') as string,
      type: formData.get('type') as 'SUPPLIER' | 'CUSTOMER',
      phone: formData.get('phone') as string,
    });
    setIsAccDialogOpen(false);
  };

  const handleRepayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const accountId = formData.get('accountId') as string;
    const account = debtAccounts.find(a => a.id === accountId);

    addRepayment({
      debtAccountId: accountId,
      amount,
      type: account?.type === 'SUPPLIER' ? 'PAYMENT' : 'RECEIPT',
      note: formData.get('note') as string,
    });
    setIsRepayDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">Debt Accounts</h1>
          <p className="text-muted-foreground">Manage suppliers, customers, and credit balance</p>
        </div>
        <div className="flex gap-2">
          {canEdit() && (
            <>
              <Dialog open={isRepayDialogOpen} onOpenChange={setIsRepayDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-[#336699] text-[#336699] hover:bg-[#336699] hover:text-white">
                    <Receipt className="h-4 w-4 mr-2" /> Record Repayment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Settle Debt / Repayment</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRepayment} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Account</Label>
                      <Select name="accountId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {debtAccounts.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount Paid/Received</Label>
                      <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Note / Receipt Reference</Label>
                      <Input name="note" placeholder="Optional reference" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full bg-[#336699]">Save Transaction</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isAccDialogOpen} onOpenChange={setIsAccDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#336699] hover:bg-[#2a5580]">
                    <Plus className="h-4 w-4 mr-2" /> New Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Debt Account</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAccount} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input name="name" required placeholder="Company or Individual Name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <Select name="type" defaultValue="SUPPLIER">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUPPLIER">Supplier (We pay them)</SelectItem>
                          <SelectItem value="CUSTOMER">Customer (They pay us)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone / Contact</Label>
                      <Input name="phone" placeholder="Contact details" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full bg-[#336699]">Create Account</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList className="bg-white/50 border mb-4">
          <TabsTrigger value="suppliers" className="px-8">Suppliers</TabsTrigger>
          <TabsTrigger value="customers" className="px-8">Customers</TabsTrigger>
          <TabsTrigger value="history" className="px-8">Repayment History</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Current Debt</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debtAccounts.filter(a => a.type === 'SUPPLIER').map(acc => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-bold">{acc.name}</TableCell>
                      <TableCell>{acc.phone || '-'}</TableCell>
                      <TableCell className="text-right font-mono text-lg font-bold text-red-600">
                        ${acc.balance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {acc.balance > 0 ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700">Payment Due</span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-100 text-emerald-700">Settled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Credit Balance</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debtAccounts.filter(a => a.type === 'CUSTOMER').map(acc => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-bold">{acc.name}</TableCell>
                      <TableCell>{acc.phone || '-'}</TableCell>
                      <TableCell className="text-right font-mono text-lg font-bold text-blue-600">
                        ${Math.abs(acc.balance).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {acc.balance < 0 ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">Active Receivable</span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-100 text-emerald-700">Settled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">No payment history yet</TableCell>
                    </TableRow>
                  ) : (
                    repayments.map(rep => {
                      const acc = debtAccounts.find(a => a.id === rep.debtAccountId);
                      return (
                        <TableRow key={rep.id}>
                          <TableCell className="text-xs">{new Date(rep.timestamp).toLocaleDateString()}</TableCell>
                          <TableCell className="font-semibold">{acc?.name}</TableCell>
                          <TableCell>
                            {rep.type === 'PAYMENT' ? (
                              <span className="text-red-600 flex items-center gap-1 text-xs font-bold uppercase"><TrendingDown className="h-3 w-3"/> Payment Out</span>
                            ) : (
                              <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold uppercase"><TrendingUp className="h-3 w-3"/> Receipt In</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold">${rep.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-xs italic text-muted-foreground">{rep.note || '-'}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
