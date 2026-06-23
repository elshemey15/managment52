
"use client";

import React, { createContext, useContext, useState } from 'react';
import { User, Category, Item, Movement, DebtAccount, Expense, Repayment } from './types';
import { toast } from '@/hooks/use-toast';

interface WarehouseContextType {
  currentUser: User | null;
  users: User[];
  categories: Category[];
  items: Item[];
  movements: Movement[];
  debtAccounts: DebtAccount[];
  expenses: Expense[];
  repayments: Repayment[];
  login: (username: string) => boolean;
  logout: () => void;
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  addMovement: (movement: Omit<Movement, 'id' | 'timestamp' | 'userId'>) => void;
  addDebtAccount: (account: Omit<DebtAccount, 'id' | 'balance'>) => void;
  addRepayment: (repayment: Omit<Repayment, 'id' | 'timestamp' | 'userId'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'userId'>) => void;
  canEdit: () => boolean;
  isAdmin: () => boolean;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>([
    { id: '1', username: 'admin', role: 'Admin' },
    { id: '2', username: 'editor', role: 'Editor' },
    { id: '3', username: 'logger', role: 'Logger' },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 'c1', name: 'إلكترونيات' },
    { id: 'c2', name: 'أثاث مكتبي' },
  ]);

  const [items, setItems] = useState<Item[]>([
    { id: 'i1', code: 'E001', name: 'لابتوب احترافي', categoryId: 'c1', unit: 'قطعة', purchasePrice: 800, salePrice: 1200, currentStock: 10 },
    { id: 'i2', code: 'F001', name: 'كرسي مكتب', categoryId: 'c2', unit: 'قطعة', purchasePrice: 50, salePrice: 95, currentStock: 25 },
  ]);

  const [movements, setMovements] = useState<Movement[]>([]);
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([
    { id: 'd1', name: 'المورد العالمي المحدود', type: 'SUPPLIER', balance: 0 },
    { id: 'd2', name: 'شركة البركة التجارية', type: 'CUSTOMER', balance: 0 },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);

  const login = (username: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const isAdmin = () => currentUser?.role === 'Admin';
  const canEdit = () => currentUser?.role === 'Admin' || currentUser?.role === 'Editor';

  const addItem = (item: Omit<Item, 'id'>) => {
    if (!canEdit()) return toast({ title: 'عذراً، لا تملك الصلاحية', variant: 'destructive' });
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setItems(prev => [...prev, newItem]);
    toast({ title: 'تمت إضافة المادة بنجاح' });
  };

  const updateItem = (id: string, itemData: Partial<Item>) => {
    if (!canEdit()) return toast({ title: 'عذراً، لا تملك الصلاحية', variant: 'destructive' });
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...itemData } : i));
    toast({ title: 'تم تحديث بيانات المادة' });
  };

  const deleteItem = (id: string) => {
    if (!isAdmin()) return toast({ title: 'فقط المدير يمكنه الحذف', variant: 'destructive' });
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'تم حذف المادة' });
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    if (!canEdit()) return;
    setCategories(prev => [...prev, { ...cat, id: Math.random().toString(36).substr(2, 9) }]);
    toast({ title: 'تمت إضافة التصنيف' });
  };

  const addMovement = (move: Omit<Movement, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUser) return;
    const movement: Movement = {
      ...move,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
    };

    setMovements(prev => [movement, ...prev]);

    // Update Item Stock
    setItems(prev => prev.map(i => {
      if (i.id === movement.itemId) {
        const delta = movement.type === 'IN' ? movement.quantity : -movement.quantity;
        return { ...i, currentStock: i.currentStock + delta };
      }
      return i;
    }));

    // Update Debt if linked
    if (movement.debtAccountId) {
      const totalValue = movement.quantity * movement.priceAtTime;
      setDebtAccounts(prev => prev.map(acc => {
        if (acc.id === movement.debtAccountId) {
          const balanceChange = movement.type === 'IN' ? totalValue : -totalValue;
          return { ...acc, balance: acc.balance + balanceChange };
        }
        return acc;
      }));
    }
  };

  const addDebtAccount = (acc: Omit<DebtAccount, 'id' | 'balance'>) => {
    if (!canEdit()) return;
    setDebtAccounts(prev => [...prev, { ...acc, id: Math.random().toString(36).substr(2, 9), balance: 0 }]);
    toast({ title: 'تم إنشاء الحساب المالي' });
  };

  const addRepayment = (rep: Omit<Repayment, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUser) return;
    const repayment: Repayment = {
      ...rep,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
    };
    setRepayments(prev => [repayment, ...prev]);

    setDebtAccounts(prev => prev.map(acc => {
      if (acc.id === repayment.debtAccountId) {
        const amountChange = repayment.type === 'PAYMENT' ? -repayment.amount : repayment.amount;
        return { ...acc, balance: acc.balance + amountChange };
      }
      return acc;
    }));
    toast({ title: 'تم تسجيل الحركة المالية' });
  };

  const addExpense = (exp: Omit<Expense, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUser) return;
    const expense: Expense = {
      ...exp,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
    };
    setExpenses(prev => [expense, ...prev]);
    toast({ title: 'تم تسجيل المصروف بنجاح' });
  };

  return (
    <WarehouseContext.Provider value={{
      currentUser, users, categories, items, movements, debtAccounts, expenses, repayments,
      login, logout, addItem, updateItem, deleteItem, addCategory, addMovement, addDebtAccount, addRepayment, addExpense,
      canEdit, isAdmin
    }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) throw new Error('useWarehouse must be used within WarehouseProvider');
  return context;
};
