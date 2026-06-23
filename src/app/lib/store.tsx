
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Item, Movement, DebtAccount, Expense, Repayment, Department, Unit, Supplier, PurchaseInvoice, SupplierPayment } from './types';
import { toast } from '@/hooks/use-toast';

interface WarehouseContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  units: Unit[];
  items: Item[];
  suppliers: Supplier[];
  purchases: PurchaseInvoice[];
  payments: SupplierPayment[];
  expenses: Expense[];
  
  login: (username: string, password?: string) => boolean;
  emergencyLogin: (masterKey: string) => boolean;
  logout: () => void;
  
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
  updateUserPassword: (id: string, newPass: string) => void;
  
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  deleteDepartment: (id: string) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  deleteUnit: (id: string) => void;
  
  addItem: (item: Omit<Item, 'id' | 'code'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id' | 'balance' | 'totalPurchases' | 'totalPayments'>) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addPurchase: (invoice: Omit<PurchaseInvoice, 'id' | 'remainingAmount' | 'status'>, itemUpdates: {itemId: string, qty: number}[]) => void;
  addPayment: (payment: Omit<SupplierPayment, 'id' | 'date'>) => void;
  
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'userId'>) => void;
  deleteExpense: (id: string) => void;
  
  canEdit: () => boolean;
  isAdmin: () => boolean;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);
const MASTER_KEY = 'abdallah12345a';

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'abdallah', role: 'Admin', password: MASTER_KEY },
  ]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ae_v2_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUsers(parsed.users || users);
        setDepartments(parsed.departments || []);
        setUnits(parsed.units || []);
        setItems(parsed.items || []);
        setSuppliers(parsed.suppliers || []);
        setPurchases(parsed.purchases || []);
        setPayments(parsed.payments || []);
        setExpenses(parsed.expenses || []);
        setCurrentUser(parsed.currentUser || null);
      } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ae_v2_state', JSON.stringify({
        users, departments, units, items, suppliers, purchases, payments, expenses, currentUser
      }));
    }
  }, [users, departments, units, items, suppliers, purchases, payments, expenses, currentUser, isLoaded]);

  const login = (u: string, p?: string) => {
    const user = users.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
    if (user) { setCurrentUser(user); return true; }
    return false;
  };

  const emergencyLogin = (k: string) => {
    if (k === MASTER_KEY) {
      setCurrentUser(users[0]);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);
  const isAdmin = () => currentUser?.role === 'Admin';
  const canEdit = () => currentUser?.role === 'Admin' || currentUser?.role === 'Editor';

  const addUser = (u: any) => {
    setUsers(prev => [...prev, { ...u, id: Math.random().toString(36).substr(2, 9) }]);
    toast({ title: 'تم إنشاء المستخدم بنجاح' });
  };
  
  const deleteUser = (id: string) => {
    if (id === currentUser?.id) {
      return toast({ title: 'لا يمكنك حذف حسابك الحالي', variant: 'destructive' });
    }
    setUsers(prev => prev.filter(x => x.id !== id));
    toast({ title: 'تم حذف المستخدم' });
  };
  
  const updateUserPassword = (id: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPass } : u));
    toast({ title: 'تم تحديث كلمة المرور بنجاح' });
  };

  const addDepartment = (d: any) => {
    setDepartments(prev => [...prev, { ...d, id: Math.random().toString(36).substr(2, 9) }]);
  };
  const deleteDepartment = (id: string) => setDepartments(prev => prev.filter(x => x.id !== id));

  const addUnit = (u: any) => setUnits(prev => [...prev, { ...u, id: Math.random().toString(36).substr(2, 9) }]);
  const deleteUnit = (id: string) => setUnits(prev => prev.filter(x => x.id !== id));

  const addItem = (i: any) => {
    const maxCode = items.reduce((max, x) => Math.max(max, parseInt(x.code) || 0), 0);
    setItems(prev => [...prev, { ...i, id: Math.random().toString(36).substr(2, 9), code: (maxCode + 1).toString() }]);
  };
  const updateItem = (id: string, d: any) => setItems(prev => prev.map(x => x.id === id ? { ...x, ...d } : x));
  const deleteItem = (id: string) => setItems(prev => prev.filter(x => x.id !== id));

  const addSupplier = (s: any) => {
    setSuppliers(prev => [...prev, { ...s, id: Math.random().toString(36).substr(2, 9), balance: 0, totalPurchases: 0, totalPayments: 0 }]);
  };
  const updateSupplier = (id: string, d: any) => setSuppliers(prev => prev.map(x => x.id === id ? { ...x, ...d } : x));
  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(x => x.id !== id));

  const addPurchase = (inv: any, updates: any[]) => {
    const remaining = inv.totalValue - inv.paidAmount;
    const status = remaining <= 0 ? 'PAID' : (inv.paidAmount > 0 ? 'PARTIAL' : 'UNPAID');
    const newInvoice = { ...inv, id: Math.random().toString(36).substr(2, 9), remainingAmount: remaining, status };
    
    setPurchases(prev => [newInvoice, ...prev]);
    
    setItems(prev => prev.map(item => {
      const update = updates.find(u => u.itemId === item.id);
      return update ? { ...item, currentStock: item.currentStock + update.qty } : item;
    }));

    setSuppliers(prev => prev.map(sup => {
      if (sup.id === inv.supplierId) {
        return {
          ...sup,
          balance: sup.balance + remaining,
          totalPurchases: sup.totalPurchases + inv.totalValue,
          totalPayments: sup.totalPayments + inv.paidAmount
        };
      }
      return sup;
    }));

    if (inv.paidAmount > 0) {
      setPayments(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        supplierId: inv.supplierId,
        amount: inv.paidAmount,
        date: inv.date,
        method: 'CASH',
        note: `دفعة مقدمة للفاتورة #${newInvoice.id}`
      }, ...prev]);
    }
    toast({ title: 'تم تسجيل المشتريات وتحديث المخزن' });
  };

  const addPayment = (p: any) => {
    const supplier = suppliers.find(s => s.id === p.supplierId);
    if (!supplier) return;
    if (p.amount > supplier.balance) {
      return toast({ title: 'خطأ: مبلغ السداد أكبر من الدين المتبقي', variant: 'destructive' });
    }

    const newPayment = { ...p, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() };
    setPayments(prev => [newPayment, ...prev]);

    setSuppliers(prev => prev.map(sup => {
      if (sup.id === p.supplierId) {
        return {
          ...sup,
          balance: sup.balance - p.amount,
          totalPayments: sup.totalPayments + p.amount
        };
      }
      return sup;
    }));
    toast({ title: 'تم تسجيل السداد بنجاح' });
  };

  const addExpense = (e: any) => setExpenses(prev => [...prev, { ...e, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), userId: currentUser?.id || '1' }]);
  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(x => x.id !== id));

  if (!isLoaded) return null;

  return (
    <WarehouseContext.Provider value={{
      currentUser, users, departments, units, items, suppliers, purchases, payments, expenses,
      login, emergencyLogin, logout, addUser, deleteUser, updateUserPassword,
      addDepartment, deleteDepartment, addUnit, deleteUnit,
      addItem, updateItem, deleteItem, addSupplier, updateSupplier, deleteSupplier,
      addPurchase, addPayment, addExpense, deleteExpense, canEdit, isAdmin
    }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) throw new Error('useWarehouse error');
  return context;
};
