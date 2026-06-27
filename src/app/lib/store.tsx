"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Item, Movement, Expense, Department, Unit, Supplier, PurchaseInvoice, SupplierPayment, GeneralInvoice, CashTransaction } from './types';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

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
  movements: Movement[];
  generalInvoices: GeneralInvoice[];
  cashTransactions: CashTransaction[];
  
  login: (username: string, password?: string) => boolean;
  emergencyLogin: (masterKey: string) => boolean;
  logout: () => void;
  
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUserPassword: (id: string, newPass: string) => Promise<void>;
  
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addUnit: (unit: Omit<Unit, 'id'>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  
  addItem: (item: Omit<Item, 'id' | 'code'>) => Promise<void>;
  updateItem: (id: string, item: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  addSupplier: (supplier: Omit<Supplier, 'id' | 'balance' | 'totalPurchases' | 'totalPayments'>) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  addPurchase: (invoice: Omit<PurchaseInvoice, 'id' | 'remainingAmount' | 'status'>, itemUpdates: {itemId: string, qty: number}[]) => Promise<void>;
  addPayment: (payment: Omit<SupplierPayment, 'id' | 'date'>) => Promise<void>;
  
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addGeneralInvoice: (invoice: Omit<GeneralInvoice, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  deleteGeneralInvoice: (id: string) => Promise<void>;

  addCashTransaction: (transaction: Omit<CashTransaction, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  deleteCashTransaction: (id: string) => Promise<void>;
  
  recordSimpleMovement: (itemId: string, type: 'IN' | 'OUT', qty: number, note: string) => Promise<void>;
  deleteMovement: (id: string) => Promise<void>;
  
  exportAllData: (format: 'json' | 'excel' | 'pdf') => void;
  canEdit: () => boolean;
  isAdmin: () => boolean;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);
const MASTER_KEY = 'abdallah123456a';

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const getLocalData = (key: string, fallback: any) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    }
    return fallback;
  };

  const [users, setUsers] = useState<User[]>(() => getLocalData('wh_users', []));
  const [departments, setDepartments] = useState<Department[]>(() => getLocalData('wh_departments', []));
  const [units, setUnits] = useState<Unit[]>(() => getLocalData('wh_units', []));
  const [items, setItems] = useState<Item[]>(() => getLocalData('wh_items', []));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getLocalData('wh_suppliers', []));
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => getLocalData('wh_purchases', []));
  const [payments, setPayments] = useState<SupplierPayment[]>(() => getLocalData('wh_payments', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => getLocalData('wh_expenses', []));
  const [movements, setMovements] = useState<Movement[]>(() => getLocalData('wh_movements', []));
  const [generalInvoices, setGeneralInvoices] = useState<GeneralInvoice[]>(() => getLocalData('wh_general_invoices', []));
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => getLocalData('wh_cash_transactions', []));

  useEffect(() => { if (isLoaded) localStorage.setItem('wh_users', JSON.stringify(users)); }, [users, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_departments', JSON.stringify(departments)); }, [departments, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_units', JSON.stringify(units)); }, [units, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_items', JSON.stringify(items)); }, [items, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_suppliers', JSON.stringify(suppliers)); }, [suppliers, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_purchases', JSON.stringify(purchases)); }, [purchases, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_payments', JSON.stringify(payments)); }, [payments, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_expenses', JSON.stringify(expenses)); }, [expenses, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_movements', JSON.stringify(movements)); }, [movements, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_general_invoices', JSON.stringify(generalInvoices)); }, [generalInvoices, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('wh_cash_transactions', JSON.stringify(cashTransactions)); }, [cashTransactions, isLoaded]);

  useEffect(() => {
    const savedUser = localStorage.getItem('ae_current_user');
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('ae_current_user'); }
    }
    setIsLoaded(true);
  }, []);

  const login = (u: string, p?: string) => {
    const user = users.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
    if (user) { 
      setCurrentUser(user); 
      localStorage.setItem('ae_current_user', JSON.stringify(user));
      return true; 
    }
    return false;
  };

  const emergencyLogin = (k: string) => {
    if (k === MASTER_KEY) {
      let admin = users.find(u => u.role === 'Admin');
      if (!admin) admin = { id: 'root-admin', username: 'Abdallah_Root', role: 'Admin' };
      setCurrentUser(admin);
      localStorage.setItem('ae_current_user', JSON.stringify(admin));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ae_current_user');
  };

  const isAdmin = () => currentUser?.role === 'Admin';
  const canEdit = () => currentUser?.role === 'Admin' || currentUser?.role === 'Editor';

  const makeId = () => Math.random().toString(36).substr(2, 9);

  const addUser = async (u: any) => { setUsers(prev => [...prev, { id: makeId(), ...u }]); toast({ title: 'تم إضافة المستخدم بنجاح وثباته' }); };
  const deleteUser = async (id: string) => {
    if (id === currentUser?.id) return toast({ title: 'لا يمكنك حذف حسابك الحالي', variant: 'destructive' });
    setUsers(prev => prev.filter(x => x.id !== id));
    toast({ title: 'تم حذف المستخدم' });
  };
  const updateUserPassword = async (id: string, newPass: string) => { setUsers(prev => prev.map(x => x.id === id ? { ...x, password: newPass } : x)); toast({ title: 'تم تحديث كلمة المرور' }); };

  const addDepartment = async (d: any) => { setDepartments(prev => [...prev, { id: makeId(), ...d }]); toast({ title: 'تم إضافة القسم' }); };
  const deleteDepartment = async (id: string) => { setDepartments(prev => prev.filter(x => x.id !== id)); toast({ title: 'تم حذف القسم' }); };

  const addUnit = async (u: any) => { setUnits(prev => [...prev, { id: makeId(), ...u }]); toast({ title: 'تم إضافة الوحدة' }); };
  const deleteUnit = async (id: string) => { setUnits(prev => prev.filter(x => x.id !== id)); toast({ title: 'تم حذف الوحدة' }); };

  const addItem = async (i: any) => {
    const maxCode = items.reduce((max, x) => Math.max(max, parseInt(x.code) || 0), 0);
    const newCode = (maxCode + 1).toString();
    const newItemId = makeId();
    const currentStock = Number(i.currentStock || 0);
    const purchasePrice = Number(i.purchasePrice || 0);
    const salePrice = Number(i.salePrice || 0);

    setItems(prev => [...prev, { id: newItemId, code: newCode, name: i.name, currentStock, purchasePrice, salePrice, unitId: i.unitId, departmentId: i.departmentId, barcode: i.barcode }]);

    if (currentStock > 0) {
      setMovements(prev => [{ id: makeId(), itemId: newItemId, type: 'IN', quantity: currentStock, priceAtTime: purchasePrice, timestamp: new Date(), note: 'كمية افتتاحية عند إنشاء الصنف', userId: currentUser?.id || 'system' }, ...prev]);
    }
    toast({ title: 'تم حفظ الصنف بنجاح وثباته' });
  };

  const updateItem = async (id: string, d: any) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, name: d.name, purchasePrice: Number(d.purchasePrice || 0), salePrice: Number(d.salePrice || 0), barcode: d.barcode, unitId: d.unitId, departmentId: d.departmentId } : x));
    toast({ title: 'تم تعديل الصنف' });
  };
  const deleteItem = async (id: string) => { setItems(prev => prev.filter(x => x.id !== id)); toast({ title: 'تم حذف الصنف' }); };

  const addSupplier = async (s: any) => { setSuppliers(prev => [...prev, { id: makeId(), balance: 0, totalPurchases: 0, totalPayments: 0, ...s }]); toast({ title: 'تم إضافة المورد' }); };
  const updateSupplier = async (id: string, d: any) => { setSuppliers(prev => prev.map(x => x.id === id ? { ...x, ...d } : x)); toast({ title: 'تم التعديل' }); };
  const deleteSupplier = async (id: string) => { setSuppliers(prev => prev.filter(x => x.id !== id)); toast({ title: 'تم حذف المورد' }); };

  const addPurchase = async (inv: any, updates: any[]) => {
    const totalVal = Number(inv.totalValue || 0);
    const paid = Number(inv.paidAmount || 0);
    const remaining = totalVal - paid;
    const status = remaining <= 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'UNPAID');
    const invId = makeId();

    setPurchases(prev => [{ id: invId, remainingAmount: remaining, status, date: new Date(), ...inv }, ...prev]);
    setItems(prev => prev.map(item => {
      const up = updates.find(u => u.itemId === item.id);
      return up ? { ...item, currentStock: item.currentStock + Number(up.qty) } : item;
    }));

    updates.forEach(u => {
      const itemPrice = Number(inv.items.find((i: any) => i.itemId === u.itemId)?.price || 0);
      setMovements(prev => [{ id: makeId(), itemId: u.itemId, type: 'IN', quantity: Number(u.qty), priceAtTime: itemPrice, timestamp: new Date(), note: `توريد فاتورة من المورد: ${inv.supplierName}`, userId: currentUser?.id || 'system' }, ...prev]);
    });

    setSuppliers(prev => prev.map(s => s.id === inv.supplierId ? { ...s, balance: s.balance + remaining, totalPurchases: s.totalPurchases + totalVal, totalPayments: s.totalPayments + paid } : s));

    if (paid > 0) {
      setPayments(prev => [{ id: makeId(), supplierId: inv.supplierId, amount: paid, date: new Date(), method: 'CASH', note: 'دفعة مقدمة للفاتورة' }, ...prev]);
    }
    toast({ title: 'تم تسجيل فاتورة المشتريات والمخزن بنجاح' });
  };

  const recordSimpleMovement = async (itemId: string, type: 'IN' | 'OUT', qty: number, note: string) => {
    const numQty = Number(qty || 0);
    const item = items.find(i => i.id === itemId);
    const price = type === 'IN' ? (item?.purchasePrice || 0) : (item?.salePrice || 0);

    setItems(prev => prev.map(i => i.id === itemId ? { ...i, currentStock: i.currentStock + (type === 'IN' ? numQty : -numQty) } : i));
    setMovements(prev => [{ id: makeId(), itemId, type, quantity: numQty, priceAtTime: price, timestamp: new Date(), note: note || (type === 'IN' ? 'توريد يدوي' : 'صرف يدوي'), userId: currentUser?.id || 'system' }, ...prev]);
    toast({ title: 'تم حركات المخزن بنجاح' });
  };

  const addPayment = async (p: any) => {
    const amount = Number(p.amount || 0);
    setPayments(prev => [{ id: makeId(), date: new Date(), ...p }, ...prev]);
    setSuppliers(prev => prev.map(s => s.id === p.supplierId ? { ...s, balance: s.balance - amount, totalPayments: s.totalPayments + amount } : s));
    toast({ title: 'تم تسجيل السداد' });
  };

  const addExpense = async (e: any) => { setExpenses(prev => [{ id: makeId(), timestamp: new Date(), userId: currentUser?.id || 'system', ...e }, ...prev]); toast({ title: 'تم تسجيل المصروف' }); };
  const deleteExpense = async (id: string) => { setExpenses(prev => prev.filter(x => x.id !== id)); };

  const addGeneralInvoice = async (inv: any) => { setGeneralInvoices(prev => [{ id: makeId(), timestamp: new Date(), userId: currentUser?.id || 'system', ...inv }, ...prev]); toast({ title: 'تم حفظ المبيعات اليومية' }); };
  const deleteGeneralInvoice = async (id: string) => { setGeneralInvoices(prev => prev.filter(x => x.id !== id)); };

  const addCashTransaction = async (trans: any) => { setCashTransactions(prev => [{ id: makeId(), timestamp: new Date(), userId: currentUser?.id || 'system', ...trans }, ...prev]); toast({ title: 'تم تسجيل المعاملة' }); };
  const deleteCashTransaction = async (id: string) => { setCashTransactions(prev => prev.filter(x => x.id !== id)); };
  const deleteMovement = async (id: string) => { setMovements(prev => prev.filter(x => x.id !== id)); };

  const exportAllData = (format: 'json' | 'excel' | 'pdf') => {
    try {
      if (format === 'excel') {
        const wb = XLSX.utils.book_new();
        const summaryData = [{ 'إجمالي قيمة المخزن': items.reduce((acc, i) => acc + (i.currentStock * i.purchasePrice), 0), 'عدد الأصناف': items.length }];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "ملخص");
        XLSX.writeFile(wb, `AE-Storage-Report-${new Date().toISOString().split('T')[0]}.xlsx`);
      } else if (format === 'pdf') { window.print(); }
      toast({ title: 'تم التحميل بنجاح' });
    } catch (e) { console.error(e); }
  };

  if (!isLoaded) return null;

  return (
    <WarehouseContext.Provider value={{
      currentUser, users, departments, units, items, suppliers, purchases, payments, expenses, movements, generalInvoices, cashTransactions,
      login, emergencyLogin, logout, addUser, deleteUser, updateUserPassword,
      addDepartment, deleteDepartment, addUnit, deleteUnit,
      addItem, updateItem, deleteItem, addSupplier, updateSupplier, deleteSupplier,
      addPurchase, addPayment, addExpense, deleteExpense, addGeneralInvoice, deleteGeneralInvoice, addCashTransaction, deleteCashTransaction, recordSimpleMovement, deleteMovement, exportAllData, canEdit, isAdmin
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