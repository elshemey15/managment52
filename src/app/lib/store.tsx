
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Item, Movement, Expense, Department, Unit, Supplier, PurchaseInvoice, SupplierPayment, GeneralInvoice, CashTransaction } from './types';
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
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
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

  addGeneralInvoice: (invoice: Omit<GeneralInvoice, 'id' | 'timestamp' | 'userId'>) => void;
  deleteGeneralInvoice: (id: string) => void;

  addCashTransaction: (transaction: Omit<CashTransaction, 'id' | 'timestamp' | 'userId'>) => void;
  deleteCashTransaction: (id: string) => void;
  
  recordSimpleMovement: (itemId: string, type: 'IN' | 'OUT', qty: number, note: string) => Promise<void>;
  deleteMovement: (id: string) => void;
  
  exportAllData: (format: 'json' | 'excel' | 'pdf') => void;
  canEdit: () => boolean;
  isAdmin: () => boolean;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);
const MASTER_KEY = 'abdallah123456a';

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
  const [generalInvoices, setGeneralInvoices] = useState<GeneralInvoice[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);

  useEffect(() => {
    // نظام الاستماع اللحظي (Real-time) للمزامنة من أي مكان في العالم
    const unsubscribers = [
      onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() } as User)))),
      onSnapshot(collection(db, 'departments'), (s) => setDepartments(s.docs.map(d => ({ id: d.id, ...d.data() } as Department)))),
      onSnapshot(collection(db, 'units'), (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit)))),
      onSnapshot(collection(db, 'items'), (s) => setItems(s.docs.map(d => ({ id: d.id, ...d.data() } as Item)))),
      onSnapshot(collection(db, 'suppliers'), (s) => setSuppliers(s.docs.map(d => ({ id: d.id, ...d.data() } as Supplier)))),
      onSnapshot(query(collection(db, 'purchases'), orderBy('date', 'desc')), (s) => setPurchases(s.docs.map(d => ({ id: d.id, ...d.data() } as PurchaseInvoice)))),
      onSnapshot(query(collection(db, 'payments'), orderBy('date', 'desc')), (s) => setPayments(s.docs.map(d => ({ id: d.id, ...d.data() } as SupplierPayment)))),
      onSnapshot(query(collection(db, 'expenses'), orderBy('timestamp', 'desc')), (s) => setExpenses(s.docs.map(d => ({ id: d.id, ...d.data() } as Expense)))),
      onSnapshot(query(collection(db, 'movements'), orderBy('timestamp', 'desc')), (s) => setMovements(s.docs.map(d => ({ id: d.id, ...d.data() } as Movement)))),
      onSnapshot(query(collection(db, 'general_invoices'), orderBy('timestamp', 'desc')), (s) => setGeneralInvoices(s.docs.map(d => ({ id: d.id, ...d.data() } as GeneralInvoice)))),
      onSnapshot(query(collection(db, 'cash_transactions'), orderBy('timestamp', 'desc')), (s) => setCashTransactions(s.docs.map(d => ({ id: d.id, ...d.data() } as CashTransaction))))
    ];

    const savedUser = localStorage.getItem('ae_current_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ae_current_user');
      }
    }
    
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
      let admin = users.find(u => u.role === 'Admin');
      if (!admin) {
        admin = { id: 'root-admin', username: 'Abdallah_Root', role: 'Admin' };
      }
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

  const addUser = (u: any) => addDoc(collection(db, 'users'), u);
  const deleteUser = (id: string) => {
    if (id === currentUser?.id) return toast({ title: 'لا يمكنك حذف حسابك الحالي', variant: 'destructive' });
    deleteDoc(doc(db, 'users', id));
  };
  const updateUserPassword = (id: string, newPass: string) => setDoc(doc(db, 'users', id), { password: newPass }, { merge: true });

  const addDepartment = (d: any) => addDoc(collection(db, 'departments'), d);
  const deleteDepartment = (id: string) => deleteDoc(doc(db, 'departments', id));
  const addUnit = (u: any) => addDoc(collection(db, 'units'), u);
  const deleteUnit = (id: string) => deleteDoc(doc(db, 'units', id));

  const addItem = async (i: any) => {
    const maxCode = items.reduce((max, x) => Math.max(max, parseInt(x.code) || 0), 0);
    const itemData = { 
      ...i, 
      code: (maxCode + 1).toString(),
      currentStock: Number(i.currentStock || 0),
      purchasePrice: Number(i.purchasePrice || 0),
      salePrice: Number(i.salePrice || 0)
    };
    const docRef = await addDoc(collection(db, 'items'), itemData);
    
    if (itemData.currentStock > 0) {
      await addDoc(collection(db, 'movements'), {
        itemId: docRef.id,
        type: 'IN',
        quantity: itemData.currentStock,
        priceAtTime: itemData.purchasePrice,
        userId: currentUser?.id || 'system',
        timestamp: serverTimestamp(),
        note: 'رصيد أول المدة عند إنشاء الصنف'
      });
    }
  };

  const updateItem = (id: string, d: any) => setDoc(doc(db, 'items', id), d, { merge: true });
  const deleteItem = (id: string) => deleteDoc(doc(db, 'items', id));

  const addSupplier = (s: any) => addDoc(collection(db, 'suppliers'), { ...s, balance: 0, totalPurchases: 0, totalPayments: 0 });
  const updateSupplier = (id: string, d: any) => setDoc(doc(db, 'suppliers', id), d, { merge: true });
  const deleteSupplier = (id: string) => deleteDoc(doc(db, 'suppliers', id));

  const addPurchase = async (inv: any, updates: any[]) => {
    const totalVal = Number(inv.totalValue || 0);
    const paid = Number(inv.paidAmount || 0);
    const remaining = totalVal - paid;
    const status = remaining <= 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'UNPAID');
    const batch = writeBatch(db);
    
    const purchaseRef = doc(collection(db, 'purchases'));
    batch.set(purchaseRef, { 
      ...inv, 
      totalValue: totalVal,
      paidAmount: paid,
      remainingAmount: remaining, 
      status 
    });

    updates.forEach(u => {
      const itemRef = doc(db, 'items', u.itemId);
      batch.update(itemRef, { currentStock: increment(Number(u.qty)) });
      const moveRef = doc(collection(db, 'movements'));
      batch.set(moveRef, {
        itemId: u.itemId,
        type: 'IN',
        quantity: Number(u.qty),
        priceAtTime: Number(inv.items.find((i: any) => i.itemId === u.itemId)?.price || 0),
        userId: currentUser?.id || 'system',
        timestamp: serverTimestamp(),
        note: `توريد فاتورة من المورد: ${inv.supplierName}`
      });
    });

    const supplierRef = doc(db, 'suppliers', inv.supplierId);
    batch.update(supplierRef, {
      balance: increment(remaining),
      totalPurchases: increment(totalVal),
      totalPayments: increment(paid)
    });

    if (paid > 0) {
      const paymentRef = doc(collection(db, 'payments'));
      batch.set(paymentRef, {
        supplierId: inv.supplierId,
        amount: paid,
        date: inv.date,
        method: 'CASH',
        note: `دفعة مقدمة للفاتورة`
      });
    }

    await batch.commit();
    toast({ title: 'تم الحفظ والمزامنة السحابية بنجاح' });
  };

  const recordSimpleMovement = async (itemId: string, type: 'IN' | 'OUT', qty: number, note: string) => {
    const batch = writeBatch(db);
    const itemRef = doc(db, 'items', itemId);
    const item = items.find(i => i.id === itemId);
    const numQty = Number(qty || 0);
    
    batch.update(itemRef, { currentStock: increment(type === 'IN' ? numQty : -numQty) });
    
    const moveRef = doc(collection(db, 'movements'));
    batch.set(moveRef, {
      itemId,
      type,
      quantity: numQty,
      priceAtTime: type === 'IN' ? (item?.purchasePrice || 0) : (item?.salePrice || 0),
      userId: currentUser?.id || 'system',
      timestamp: serverTimestamp(),
      note: note || (type === 'IN' ? 'توريد يدوي' : 'صرف يدوي')
    });
    
    await batch.commit();
    toast({ title: type === 'IN' ? 'تم تسجيل الوارد بنجاح' : 'تم تسجيل المنصرف بنجاح' });
  };

  const addPayment = async (p: any) => {
    const supplier = suppliers.find(s => s.id === p.supplierId);
    if (!supplier) return;
    const batch = writeBatch(db);
    const amount = Number(p.amount || 0);
    const paymentRef = doc(collection(db, 'payments'));
    batch.set(paymentRef, { ...p, amount, date: new Date().toISOString() });
    const supplierRef = doc(db, 'suppliers', p.supplierId);
    batch.update(supplierRef, { balance: increment(-amount), totalPayments: increment(amount) });
    await batch.commit();
    toast({ title: 'تم تسجيل السداد ومزامنته' });
  };

  const addExpense = (e: any) => addDoc(collection(db, 'expenses'), { 
    ...e, 
    amount: Number(e.amount || 0),
    timestamp: new Date().toISOString(), 
    userId: currentUser?.id || 'system' 
  });
  
  const deleteExpense = (id: string) => deleteDoc(doc(db, 'expenses', id));
  
  const addGeneralInvoice = (inv: any) => addDoc(collection(db, 'general_invoices'), { 
    ...inv, 
    invoiceCount: Number(inv.invoiceCount || 0),
    salePrice: Number(inv.salePrice || 0),
    expenses: Number(inv.expenses || 0),
    timestamp: serverTimestamp(), 
    userId: currentUser?.id || 'system' 
  });
  
  const deleteGeneralInvoice = (id: string) => deleteDoc(doc(db, 'general_invoices', id));

  const addCashTransaction = (trans: any) => addDoc(collection(db, 'cash_transactions'), {
    ...trans,
    amount: Number(trans.amount || 0),
    timestamp: serverTimestamp(),
    userId: currentUser?.id || 'system'
  });

  const deleteCashTransaction = (id: string) => deleteDoc(doc(db, 'cash_transactions', id));

  const deleteMovement = (id: string) => deleteDoc(doc(db, 'movements', id));

  // دالة لمعالجة التواريخ بشكل آمن لمنع تعطل التصدير
  const parseSafeDate = (val: any) => {
    if (!val) return new Date();
    if (val.toDate && typeof val.toDate === 'function') return val.toDate();
    if (val.seconds) return new Date(val.seconds * 1000);
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const exportAllData = (format: 'json' | 'excel' | 'pdf') => {
    try {
      const timestampStr = new Date().toLocaleString('ar-EG');
      
      if (format === 'json') {
        const allData = {
          timestamp: timestampStr,
          exportedBy: currentUser?.username,
          warehouseItems: items,
          suppliers: suppliers,
          purchases: purchases,
          payments: payments,
          expenses: expenses,
          movements: movements,
          generalInvoices: generalInvoices,
          cashTransactions: cashTransactions,
          departments: departments,
          units: units
        };
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AE-Storage-Backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'excel') {
        const wb = XLSX.utils.book_new();
        
        // 1. الملخص المالي والعام
        const summaryData = [{
          'إجمالي قيمة المخزن': items.reduce((acc, i) => acc + (i.currentStock * i.purchasePrice), 0),
          'إجمالي الديون': suppliers.reduce((acc, s) => acc + s.balance, 0),
          'عدد الأصناف الكلي': items.length,
          'عدد الموردين': suppliers.length,
          'إجمالي المبيعات العامة': generalInvoices.reduce((acc, i) => acc + (i.salePrice || 0), 0),
          'وقت التصدير': timestampStr
        }];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "ملخص عام");

        // 2. المخزن
        const excelItems = items.map(i => ({
          'الكود': i.code,
          'اسم المادة': i.name,
          'القسم': departments.find(d => d.id === i.departmentId)?.name || 'غير معروف',
          'الوحدة': units.find(u => u.id === i.unitId)?.name || 'غير معروف',
          'سعر الشراء': i.purchasePrice,
          'سعر البيع': i.salePrice,
          'المخزون الحالي': i.currentStock,
          'إجمالي القيمة': (i.currentStock * i.purchasePrice)
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelItems), "المخزن والمواد");

        // 3. الموردين
        const excelSuppliers = suppliers.map(s => ({
          'اسم المورد': s.name,
          'الهاتف': s.phone,
          'العنوان': s.address,
          'إجمالي المشتريات': s.totalPurchases,
          'إجمالي المسدد': s.totalPayments,
          'المديونية المتبقية': s.balance
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelSuppliers), "الموردين والديون");

        // 4. سجل الحركات
        const excelMovements = movements.map(m => {
          const item = items.find(i => i.id === m.itemId);
          const user = users.find(u => u.id === m.userId);
          const dateObj = parseSafeDate(m.timestamp);
          return {
            'التاريخ': dateObj.toLocaleDateString('ar-EG'),
            'الوقت': dateObj.toLocaleTimeString('ar-EG'),
            'نوع الحركة': m.type === 'IN' ? 'وارد' : 'منصرف',
            'اسم المادة': item?.name || 'مادة محذوفة',
            'كود المادة': item?.code || '-',
            'الكمية': m.quantity,
            'السعر': m.priceAtTime,
            'المستخدم': user?.username || 'نظام آلي',
            'ملاحظات': m.note || '-'
          };
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelMovements), "سجل حركات المخزن");

        // 5. الحوالات والكاش
        const excelCash = cashTransactions.map(t => {
          const dateObj = parseSafeDate(t.timestamp);
          return {
            'التاريخ': dateObj.toLocaleDateString('ar-EG'),
            'النوع': t.type === 'RECEIVE' ? 'استلام (+)' : 'إرسال (-)',
            'اسم الطرف': t.personName,
            'رقم الهاتف': t.phoneNumber,
            'المبلغ': t.amount,
            'ملاحظات': t.note || '-'
          };
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelCash), "سجل الحوالات والكاش");

        // 6. المبيعات العامة
        const excelSales = generalInvoices.map(inv => ({
          'التاريخ': inv.date,
          'اليوم': inv.day,
          'عدد الفواتير': inv.invoiceCount,
          'المبيعات': inv.salePrice,
          'المصروفات': inv.expenses,
          'الصافي': (inv.salePrice || 0) - (inv.expenses || 0)
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelSales), "سجل المبيعات اليومي");

        XLSX.writeFile(wb, `AE-Storage-Report-${new Date().toISOString().split('T')[0]}.xlsx`);
      } else if (format === 'pdf') {
        window.print();
      }
      
      toast({ title: 'تم تجهيز وتنزيل تقرير البيانات بنجاح' });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: 'حدث خطأ أثناء تصدير البيانات، يرجى المحاولة مرة أخرى', variant: 'destructive' });
    }
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
