export type UserRole = 'manager' | 'sales' | 'purchase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pin: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  customerId?: string;
  staffId: string;
  staffName: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: { productId: string; productName: string; quantity: number; cost: number }[];
  status: 'pending' | 'received' | 'cancelled';
  total: number;
  createdBy: string;
  createdAt: Date;
  receivedAt?: Date;
}

export type Category = 'Phones' | 'Laptops' | 'Tablets' | 'Accessories' | 'Audio' | 'Wearables' | 'Gaming' | 'Other';

export const CATEGORIES: Category[] = ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio', 'Wearables', 'Gaming', 'Other'];
