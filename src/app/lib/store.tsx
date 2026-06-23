
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
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  // Users Management
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
  updateUserPassword: (id: string, newPassword: string) => void;
  // Items Management
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  // Categories Management
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  // Movements Management
  addMovement: (movement: Omit<Movement, 'id' | 'timestamp' | 'userId'>) => void;
  deleteMovement: (id: string) => void;
  // Accounts Management
  addDebtAccount: (account: Omit<DebtAccount, 'id' | 'balance'>) => void;
  deleteDebtAccount: (id: string) => void;
  // Repayments Management
  addRepayment: (repayment: Omit<Repayment, 'id' | 'timestamp' | 'userId'>) => void;
  deleteRepayment: (id: string) => void;
  // Expenses Management
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'userId'>) => void;
  deleteExpense: (id: string) => void;
  
  canEdit: () => boolean;
  isAdmin: () => boolean;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', role: 'Admin', password: '123' },
    { id: '2', username: 'editor', role: 'Editor', password: '123' },
    { id: '3', username: 'logger', role: 'Logger', password: '123' },
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

  const login = (username: string, password?: string) => {
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      (!u.password || u.password === password)
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const isAdmin = () => currentUser?.role === 'Admin';
  const canEdit = () => currentUser?.role === 'Admin' || currentUser?.role === 'Editor';

  // Users
  const addUser = (userData: Omit<User, 'id'>) => {
    if (!isAdmin()) return;
    const newUser = { 
      ...userData, 
      id: Math.random().toString(36).substr(2, 9),
      password: userData.password || '123'
    };
    setUsers(prev => [...prev, newUser]);
    toast({ title: 'تمت إضافة المستخدم بنجاح' });
  };

  const deleteUser = (id: string) => {
    if (!isAdmin()) return;
    if (id === currentUser?.id) return toast({ title: 'لا يمكنك حذف حسابك الحالي', variant: 'destructive' });
    setUsers(prev => prev.filter(u => u.id !== id));
    toast({ title: 'تم حذف المستخدم' });
  };

  const updateUserPassword = (id: string, newPassword: string) => {
    if (!isAdmin()) return;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPassword } : u));
    toast({ title: 'تم تحديث كلمة المرور بنجاح' });
  };

  // Items
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
    toast({ title: 'تم حذف المادة بنجاح' });
  };

  // Categories
  const addCategory = (cat: Omit<Category, 'id'>) => {
    if (!canEdit()) return;
    setCategories(prev => [...prev, { ...cat, id: Math.random().toString(36).substr(2, 9) }]);
    toast({ title: 'تمت إضافة التصنيف' });
  };

  const deleteCategory = (id: string) => {
    if (!isAdmin()) return toast({ title: 'فقط المدير يمكنه حذف التصنيف', variant: 'destructive' });
    if (items.some(i => i.categoryId === id)) {
      return toast({ title: 'لا يمكن حذف تصنيف يحتوي على مواد', variant: 'destructive' });
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    toast({ title: 'تم حذف التصنيف بنجاح' });
  };

  // Movements
  const addMovement = (move: Omit<Movement, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUser) return;
    const movement: Movement = {
      ...move,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
    };

    setMovements(prev => [movement, ...prev]);

    setItems(prev => prev.map(i => {
      if (i.id === movement.itemId) {
        const delta = movement.type === 'IN' ? movement.quantity : -movement.quantity;
        return { ...i, currentStock: i.currentStock + delta };
      }
      return i;
    }));

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

  const deleteMovement = (id: string) => {
    if (!isAdmin()) return;
    const move = movements.find(m => m.id === id);
    if (!move) return;

    setItems(prev => prev.map(i => {
      if (i.id === move.itemId) {
        const delta = move.type === 'IN' ? -move.quantity : move.quantity;
        return { ...i, currentStock: i.currentStock + delta };
      }
      return i;
    }));

    if (move.debtAccountId) {
      const totalValue = move.quantity * move.priceAtTime;
      setDebtAccounts(prev => prev.map(acc => {
        if (acc.id === move.debtAccountId) {
          const balanceChange = move.type === 'IN' ? -totalValue : totalValue;
          return { ...acc, balance: acc.balance + balanceChange };
        }
        return acc;
      }));
    }

    setMovements(prev => prev.filter(m => m.id !== id));
    toast({ title: 'تم حذف الحركة وتصحيح الأرصدة' });
  };

  // Debt Accounts
  const addDebtAccount = (acc: Omit<DebtAccount, 'id' | 'balance'>) => {
    if (!canEdit()) return;
    setDebtAccounts(prev => [...prev, { ...acc, id: Math.random().toString(36).substr(2, 9), balance: 0 }]);
    toast({ title: 'تم إنشاء الحساب المالي' });
  };

  const deleteDebtAccount = (id: string) => {
    if (!isAdmin()) return;
    const account = debtAccounts.find(a => a.id === id);
    if (account && account.balance !== 0) {
      return toast({ title: 'لا يمكن حذف حساب رصيده غير صفري', variant: 'destructive' });
    }
    setDebtAccounts(prev => prev.filter(a => a.id !== id));
    toast({ title: 'تم حذف الحساب المالي' });
  };

  // Repayments
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

  const deleteRepayment = (id: string) => {
    if (!isAdmin()) return;
    const rep = repayments.find(r => r.id === id);
    if (!rep) return;

    setDebtAccounts(prev => prev.map(acc => {
      if (acc.id === rep.debtAccountId) {
        const amountChange = rep.type === 'PAYMENT' ? rep.amount : -rep.amount;
        return { ...acc, balance: acc.balance + amountChange };
      }
      return acc;
    }));

    setRepayments(prev => prev.filter(r => r.id !== id));
    toast({ title: 'تم حذف حركة السداد وتصحيح الرصيد' });
  };

  // Expenses
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

  const deleteExpense = (id: string) => {
    if (!isAdmin()) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({ title: 'تم حذف المصروف' });
  };

  return (
    <WarehouseContext.Provider value={{
      currentUser, users, categories, items, movements, debtAccounts, expenses, repayments,
      login, logout, addUser, deleteUser, addItem, updateItem, deleteItem, addCategory, deleteCategory, 
      addMovement, deleteMovement, addDebtAccount, deleteDebtAccount, addRepayment, deleteRepayment, addExpense, deleteExpense,
      canEdit, isAdmin, updateUserPassword
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
