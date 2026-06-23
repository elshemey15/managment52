
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Item, Movement, Expense, Department, Unit, Supplier, PurchaseInvoice, SupplierPayment } from './types';
import { toast } from '@/hooks/use-toast';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

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
  
  deleteMovement: (id: string) => void;
  
  canEdit: () => boolean;
  isAdmin: () => boolean;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);
const MASTER_KEY = 'abdallah12345a';

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = initializeFirebase();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  // Real-time synchronization for all collections
  useEffect(() => {
    const unsubscribers = [
      onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() } as User)))),
      onSnapshot(collection(db, 'departments'), (s) => setDepartments(s.docs.map(d => ({ id: d.id, ...d.data() } as Department)))),
      onSnapshot(collection(db, 'units'), (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit)))),
      onSnapshot(collection(db, 'items'), (s) => setItems(s.docs.map(d => ({ id: d.id, ...d.data() } as Item)))),
      onSnapshot(collection(db, 'suppliers'), (s) => setSuppliers(s.docs.map(d => ({ id: d.id, ...d.data() } as Supplier)))),
      onSnapshot(query(collection(db, 'purchases'), orderBy('date', 'desc')), (s) => setPurchases(s.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseInvoice)))),
      onSnapshot(query(collection(db, 'payments'), orderBy('date', 'desc')), (s) => setPayments(s.docs.map(d => ({ id: d.id, ...d.data() } as SupplierPayment)))),
      onSnapshot(query(collection(db, 'expenses'), orderBy('timestamp', 'desc')), (s) => setExpenses(s.docs.map(d => ({ id: d.id, ...d.data() } as Expense)))),
      onSnapshot(query(collection(db, 'movements'), orderBy('timestamp', 'desc')), (s) => setMovements(s.docs.map(d => ({ id: d.id, ...d.data() } as Movement))))
    ];

    // Load currentUser from local session only for persistence of login
    const savedUser = localStorage.getItem('ae_current_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    setIsLoaded(true);
    return () => unsubscribers.forEach(u => u());
  }, [db]);

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
      const admin = users.find(u => u.role === 'Admin') || users[0];
      if (admin) {
        setCurrentUser(admin);
        localStorage.setItem('ae_current_user', JSON.stringify(admin));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ae_current_user');
  };

  const isAdmin = () => currentUser?.role === 'Admin';
  const canEdit = () => currentUser?.role === 'Admin' || currentUser?.role === 'Editor';

  const addUser = (u: any) => {
    addDoc(collection(db, 'users'), u);
    toast({ title: 'تم إنشاء المستخدم بنجاح' });
  };
  
  const deleteUser = (id: string) => {
    if (id === currentUser?.id) return toast({ title: 'لا يمكنك حذف حسابك الحالي', variant: 'destructive' });
    deleteDoc(doc(db, 'users', id));
  };
  
  const updateUserPassword = (id: string, newPass: string) => {
    setDoc(doc(db, 'users', id), { password: newPass }, { merge: true });
    toast({ title: 'تم تحديث كلمة المرور بنجاح' });
  };

  const addDepartment = (d: any) => addDoc(collection(db, 'departments'), d);
  const deleteDepartment = (id: string) => deleteDoc(doc(db, 'departments', id));

  const addUnit = (u: any) => addDoc(collection(db, 'units'), u);
  const deleteUnit = (id: string) => deleteDoc(doc(db, 'units', id));

  const addItem = (i: any) => {
    const maxCode = items.reduce((max, x) => Math.max(max, parseInt(x.code) || 0), 0);
    addDoc(collection(db, 'items'), { ...i, code: (maxCode + 1).toString() });
  };

  const updateItem = (id: string, d: any) => setDoc(doc(db, 'items', id), d, { merge: true });
  const deleteItem = (id: string) => deleteDoc(doc(db, 'items', id));

  const addSupplier = (s: any) => {
    addDoc(collection(db, 'suppliers'), { 
      ...s, 
      balance: 0, 
      totalPurchases: 0, 
      totalPayments: 0 
    });
  };

  const updateSupplier = (id: string, d: any) => setDoc(doc(db, 'suppliers', id), d, { merge: true });
  const deleteSupplier = (id: string) => deleteDoc(doc(db, 'suppliers', id));

  const addPurchase = async (inv: any, updates: any[]) => {
    const remaining = inv.totalValue - inv.paidAmount;
    const status = remaining <= 0 ? 'PAID' : (inv.paidAmount > 0 ? 'PARTIAL' : 'UNPAID');
    
    const batch = writeBatch(db);
    
    // Create Purchase Invoice
    const purchaseRef = doc(collection(db, 'purchases'));
    batch.set(purchaseRef, { ...inv, remainingAmount: remaining, status });

    // Update Items Stock and Add Movements
    updates.forEach(u => {
      const itemRef = doc(db, 'items', u.itemId);
      batch.update(itemRef, { currentStock: increment(u.qty) });

      const moveRef = doc(collection(db, 'movements'));
      batch.set(moveRef, {
        itemId: u.itemId,
        type: 'IN',
        quantity: u.qty,
        priceAtTime: inv.items.find((i: any) => i.itemId === u.itemId)?.price || 0,
        userId: currentUser?.id || 'system',
        timestamp: serverTimestamp()
      });
    });

    // Update Supplier Balance
    const supplierRef = doc(db, 'suppliers', inv.supplierId);
    batch.update(supplierRef, {
      balance: increment(remaining),
      totalPurchases: increment(inv.totalValue),
      totalPayments: increment(inv.paidAmount)
    });

    // If payment made, record in payments ledger
    if (inv.paidAmount > 0) {
      const paymentRef = doc(collection(db, 'payments'));
      batch.set(paymentRef, {
        supplierId: inv.supplierId,
        amount: inv.paidAmount,
        date: inv.date,
        method: 'CASH',
        note: `دفعة مقدمة للفاتورة`
      });
    }

    await batch.commit();
    toast({ title: 'تم تسجيل المشتريات وتحديث المخزن سحابياً' });
  };

  const addPayment = async (p: any) => {
    const supplier = suppliers.find(s => s.id === p.supplierId);
    if (!supplier) return;
    if (p.amount > supplier.balance) {
      return toast({ title: 'خطأ: مبلغ السداد أكبر من الدين المتبقي', variant: 'destructive' });
    }

    const batch = writeBatch(db);
    const paymentRef = doc(collection(db, 'payments'));
    batch.set(paymentRef, { ...p, date: new Date().toISOString() });

    const supplierRef = doc(db, 'suppliers', p.supplierId);
    batch.update(supplierRef, {
      balance: increment(-p.amount),
      totalPayments: increment(p.amount)
    });

    await batch.commit();
    toast({ title: 'تم تسجيل السداد بنجاح' });
  };

  const addExpense = (e: any) => {
    addDoc(collection(db, 'expenses'), { 
      ...e, 
      timestamp: new Date().toISOString(), 
      userId: currentUser?.id || 'system' 
    });
  };
  const deleteExpense = (id: string) => deleteDoc(doc(db, 'expenses', id));

  const deleteMovement = (id: string) => deleteDoc(doc(db, 'movements', id));

  if (!isLoaded) return null;

  return (
    <WarehouseContext.Provider value={{
      currentUser, users, departments, units, items, suppliers, purchases, payments, expenses, movements,
      login, emergencyLogin, logout, addUser, deleteUser, updateUserPassword,
      addDepartment, deleteDepartment, addUnit, deleteUnit,
      addItem, updateItem, deleteItem, addSupplier, updateSupplier, deleteSupplier,
      addPurchase, addPayment, addExpense, deleteExpense, deleteMovement, canEdit, isAdmin
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
