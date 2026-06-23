
"use client";

import React, { useState } from 'react';
import { useWarehouse } from '@/app/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Edit2, Trash2, MoreHorizontal, Package } from 'lucide-react';
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
import { Label } from '@/components/ui/label';

export default function InventoryPage() {
  const { items, categories, addItem, updateItem, deleteItem, canEdit, isAdmin } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      categoryId: formData.get('categoryId') as string,
      unit: formData.get('unit') as string,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      salePrice: parseFloat(formData.get('salePrice') as string),
      currentStock: parseInt(formData.get('currentStock') as string || '0'),
    };

    if (editingItem) {
      updateItem(editingItem.id, itemData);
    } else {
      addItem(itemData);
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#336699]">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your stock, codes and pricing</p>
        </div>
        {canEdit() && (
          <Dialog open={isDialogOpen} onOpenChange={(val) => {
            setIsDialogOpen(val);
            if (!val) setEditingItem(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#336699] hover:bg-[#2a5580]">
                <Plus className="h-4 w-4 mr-2" /> Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Item' : 'Create New Item'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Item Code</Label>
                    <Input id="code" name="code" defaultValue={editingItem?.code} required placeholder="e.g. LAP-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" name="name" defaultValue={editingItem?.name} required placeholder="Full item name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select name="categoryId" defaultValue={editingItem?.categoryId || categories[0]?.id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit of Measure</Label>
                    <Input id="unit" name="unit" defaultValue={editingItem?.unit} required placeholder="e.g. pcs, kg" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" defaultValue={editingItem?.purchasePrice} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price</Label>
                    <Input id="salePrice" name="salePrice" type="number" step="0.01" defaultValue={editingItem?.salePrice} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Initial Stock</Label>
                    <Input id="currentStock" name="currentStock" type="number" defaultValue={editingItem?.currentStock || 0} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full bg-[#336699]">
                    {editingItem ? 'Update Item' : 'Save Item'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white/50 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or code..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price (Buy/Sell)</TableHead>
                <TableHead className="text-center">Current Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    No items found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const cat = categories.find(c => c.id === item.categoryId);
                  return (
                    <TableRow key={item.id} className="group">
                      <TableCell className="font-mono text-xs font-bold">{item.code}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{cat?.name || 'Uncategorized'}</TableCell>
                      <TableCell className="text-right">
                        <div className="text-xs text-muted-foreground">In: ${item.purchasePrice}</div>
                        <div className="font-bold text-[#336699]">Out: ${item.salePrice}</div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {item.currentStock} <span className="text-xs font-normal text-muted-foreground uppercase">{item.unit}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.currentStock < 10 ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Low Stock</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {canEdit() && (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingItem(item);
                              setIsDialogOpen(true);
                            }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {isAdmin() && (
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
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
  );
}
