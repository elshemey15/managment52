
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Search, Clock, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function MovementsPage() {
  const { items, movements, addMovement, debtAccounts, users } = useWarehouse();
  const [selectedItemId, setSelectedItemId] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [debtAccountId, setDebtAccountId] = useState('');

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return toast({ title: 'Please select an item', variant: 'destructive' });
    
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    if (type === 'OUT' && item.currentStock < quantity) {
      return toast({ title: 'Insufficient stock!', variant: 'destructive' });
    }

    addMovement({
      itemId: selectedItemId,
      type,
      quantity,
      priceAtTime: type === 'IN' ? item.purchasePrice : item.salePrice,
      debtAccountId: debtAccountId === 'none' ? undefined : debtAccountId
    });

    toast({ title: 'Movement recorded successfully' });
    setQuantity(1);
    setSelectedItemId('');
    setDebtAccountId('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#336699]">Stock Movements</h1>
        <p className="text-muted-foreground">Record item arrivals and sales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-accent" />
              New Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecord} className="space-y-4">
              <div className="space-y-2">
                <Label>Movement Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button" 
                    variant={type === 'IN' ? 'default' : 'outline'}
                    className={`h-12 ${type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => setType('IN')}
                  >
                    <ArrowDownLeft className="mr-2 h-4 w-4" /> Stock In
                  </Button>
                  <Button 
                    type="button" 
                    variant={type === 'OUT' ? 'default' : 'outline'}
                    className={`h-12 ${type === 'OUT' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                    onClick={() => setType('OUT')}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" /> Stock Out
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item">Select Item</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Search Item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.code}) - Stock: {item.currentStock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input 
                  id="qty" 
                  type="number" 
                  min="1" 
                  className="h-11"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt">Link to Account (Credit/Debt)</Label>
                <Select value={debtAccountId} onValueChange={setDebtAccountId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Account (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Cash Transaction)</SelectItem>
                    {debtAccounts.filter(a => a.type === (type === 'IN' ? 'SUPPLIER' : 'CUSTOMER')).map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">
                  *IN adds to supplier debt. OUT adds to customer credit.
                </p>
              </div>

              <Button type="submit" className="w-full h-11 bg-[#336699] mt-4">
                Confirm Movement
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter history..." className="pl-9 h-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time & User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((move) => {
                    const item = items.find(i => i.id === move.itemId);
                    const user = users.find(u => u.id === move.userId);
                    return (
                      <TableRow key={move.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {new Date(move.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" /> {user?.username}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {move.type === 'IN' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">IN (وارد)</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">OUT (صادر)</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{item?.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{item?.code}</div>
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {move.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          ${(move.priceAtTime * move.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
