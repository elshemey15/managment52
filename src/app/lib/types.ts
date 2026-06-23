
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

export interface Category {
  id: string;
  name: string;
  departmentId: string;
  description?: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
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
}

export interface DebtAccount {
  id: string;
  name: string;
  type: 'SUPPLIER' | 'CUSTOMER';
  balance: number; // Positive means we owe them (Supplier), negative means they owe us (Customer)
  phone?: string;
}

export interface Repayment {
  id: string;
  debtAccountId: string;
  amount: number;
  type: 'PAYMENT' | 'RECEIPT';
  userId: string;
  timestamp: string;
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
