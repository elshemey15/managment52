
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Item, Movement, DebtAccount, Expense, Repayment, Department, Unit } from './types';
import { toast } from '@/hooks/use-toast';

interface MovementWithPayment extends Omit<Movement, 'id' | 'timestamp' | 'userId'> {
  paidAmount?: number;
}

interface WarehouseContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  units: Unit[];
  items: Item[];
  movements: Movement[];
  debtAccounts: DebtAccount[];
  expenses: Expense[];
  repayments: Repayment[];
  login: (username: string, password?: string) => boolean;
  emergencyLogin: (masterKey: string) => boolean;
  logout: () => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  deleteDepartment: (id: string) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  deleteUnit: (id: string) => void;
  addItem: (item: Omit<Item, 'id' | 'code'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  addMovement: (movement: MovementWithPayment) => void;
  deleteMovement: (id: string) => void;
  addDebtAccount: (account: Omit<DebtAccount, 'id' | 'balance'>) => void;
  deleteDebtAccount: (id: string) => void;
  addRepayment: (repayment: Omit<Repayment, 'id' | 'timestamp' | 'userId'>) => void;
  deleteRepayment: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'userId'>) => void;
  deleteExpense: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
  updateUserPassword: (id: string, newPassword: string) => void;
  canEdit: () => boolean;
  isAdmin: () => boolean;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const MASTER_KEY = 'abdallah12345a';

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'abdallah', role: 'Admin', password: 'abdallah12345a' },
  ]);

  const [departments, setDepartments] = useState<Department[]>([
    { id: 'd1', name: 'قسم الفواكه' },
  ]);

  const [units, setUnits] = useState<Unit[]>([
    { id: 'u1', name: 'قطعة' },
    { id: 'u2', name: 'كيلو' },
  ]);

  const [items, setItems] = useState<Item[]>([
    { id: 'i1', code: '1', name: 'بطيخ أحمر كبير', departmentId: 'd1', unitId: 'u1', purchasePrice: 5, salePrice: 8, currentStock: 100 },
  ]);

  const [movements, setMovements] = useState<Movement[]>([]);
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ae_storage_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.departments) setDepartments(parsed.departments);
        if (parsed.units) setUnits(parsed.units);
        if (parsed.items) setItems(parsed.items);
        if (parsed.movements) setMovements(parsed.movements);
        if (parsed.debtAccounts) setDebtAccounts(parsed.debtAccounts);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.repayments) setRepayments(parsed.repayments);
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      const state = {
        users, departments, units, items, movements, debtAccounts, expenses, repayments, currentUser
      };
      localStorage.setItem('ae_storage_state', JSON.stringify(state));
    }
  }, [users, departments, units, items, movements, debtAccounts, expenses, repayments, currentUser, isLoaded]);

  const login = (username: string, password?: string) => {
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const emergencyLogin = (masterKey: string) => {
    if (masterKey === MASTER_KEY) {
      const adminUser = users.find(u => u.role === 'Admin') || users[0];
      setCurrentUser(adminUser);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);
  const isAdmin = () => currentUser?.role === 'Admin';
  const canEdit = () => currentUser?.role === 'Admin' || currentUser?.role === 'Editor';

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    if (!canEdit()) return;
    setDepartments(prev => [...prev, { ...dept, id: Math.random().toString(36).substr(2, 9) }]);
    toast({ title: 'تمت إضافة القسم بنجاح' });
  };

  const deleteDepartment = (id: string) => {
    if (!isAdmin()) return;
    if (items.some(i => i.departmentId === id)) {
      return toast({ title: 'لا يمكن حذف قسم يحتوي على مواد', variant: 'destructive' });
    }
    setDepartments(prev => prev.filter(d => d.id !== id));
    toast({ title: 'تم حذف القسم' });
  };

  const addUnit = (unit: Omit<Unit, 'id'>) => {
    if (!canEdit()) return;
    setUnits(prev => [...prev, { ...unit, id: Math.random().toString(36).substr(2, 9) }]);
    toast({ title: 'تمت إضافة وحدة القياس' });
  };

  const deleteUnit = (id: string) => {
    if (!isAdmin()) return;
    if (items.some(i => i.unitId === id)) {
      return toast({ title: 'الوحدة مستخدمة في مواد حالية', variant: 'destructive' });
    }
    setUnits(prev => prev.filter(u => u.id !== id));
    toast({ title: 'تم حذف وحدة القياس' });
  };

  const addItem = (item: Omit<Item, 'id' | 'code'>) => {
    if (!canEdit()) return;
    const maxCode = items.reduce((max, i) => {
      const codeNum = parseInt(i.code);
      return isNaN(codeNum) ? max : Math.max(max, codeNum);
    }, 0);
    const newCode = (maxCode + 1).toString();
    setItems(prev => [...prev, { 
      ...item, 
      id: Math.random().toString(36).substr(2, 9),
      code: newCode
    }]);
    toast({ title: 'تمت إضافة المادة بنجاح بالكود: ' + newCode });
  };

  const updateItem = (id: string, itemData: Partial<Item>) => {
    if (!canEdit()) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...itemData } : i));
    toast({ title: 'تم تحديث بيانات المادة' });
  };

  const deleteItem = (id: string) => {
    if (!isAdmin()) return;
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'تم حذف المادة بنجاح' });
  };

  const addMovement = (moveWithPayment: MovementWithPayment) => {
    if (!currentUser) return;
    const { paidAmount, ...move } = moveWithPayment;
    
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
      const actualDebtChange = totalValue;
      
      setDebtAccounts(prev => prev.map(acc => {
        if (acc.id === movement.debtAccountId) {
          const balanceChange = movement.type === 'IN' ? actualDebtChange : -actualDebtChange;
          return { ...acc, balance: acc.balance + balanceChange };
        }
        return acc;
      }));

      if (paidAmount && paidAmount > 0) {
        addRepayment({
          debtAccountId: movement.debtAccountId,
          amount: paidAmount,
          type: movement.type === 'IN' ? 'PAYMENT' : 'RECEIPT',
          note: `دفعة فورية عند ${movement.type === 'IN' ? 'التوريد' : 'الصرف'} - حركة #${movement.id}`
        });
      }
    }
    toast({ title: movement.type === 'IN' ? 'تم تسجيل التوريد' : 'تم تسجيل الصرف' });
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

  const addUser = (userData: Omit<User, 'id'>) => {
    if (!isAdmin()) return;
    setUsers(prev => [...prev, { ...userData, id: Math.random().toString(36).substr(2, 9) }]);
    toast({ title: 'تم إنشاء المستخدم بنجاح' });
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
    toast({ title: 'تم تحديث كلمة المرور' });
  };

  if (!isLoaded) return null;

  return (
    <WarehouseContext.Provider value={{
      currentUser, users, departments, units, items, movements, debtAccounts, expenses, repayments,
      login, emergencyLogin, logout, addDepartment, deleteDepartment, addUnit, deleteUnit,
      addItem, updateItem, deleteItem, addMovement, deleteMovement, addDebtAccount, deleteDebtAccount,
      addRepayment, deleteRepayment, addExpense, deleteExpense, addUser, deleteUser, updateUserPassword,
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
