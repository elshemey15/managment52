
export type UserRole = 'Admin' | 'Editor' | 'Logger';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  password?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  unitId: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance: number;
  totalPurchases: number;
  totalPayments: number;
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  dueDate: string;
  totalValue: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  amount: number;
  date: string;
  method: 'CASH' | 'TRANSFER' | 'CHECK';
  note?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  timestamp: string;
  category: string;
  userId: string;
}

export interface GeneralInvoice {
  id: string;
  date: string;
  day: string;
  invoiceCount?: number;
  salePrice?: number;
  expenses?: number;
  note?: string;
  timestamp: any;
  userId: string;
}

export interface Movement {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  priceAtTime: number;
  debtAccountId?: string;
  userId: string;
  timestamp: string;
  note?: string;
}
