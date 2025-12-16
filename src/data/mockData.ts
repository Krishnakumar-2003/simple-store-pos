import { User, Product, Supplier, Sale, PurchaseOrder } from '@/types/pos';

export const mockUsers: User[] = [
  { id: '1', name: 'Admin Manager', email: 'admin@store.com', role: 'manager', pin: '1234' },
  { id: '2', name: 'Sales Person', email: 'sales@store.com', role: 'sales', pin: '5678' },
  { id: '3', name: 'Purchase Officer', email: 'purchase@store.com', role: 'purchase', pin: '9012' },
];

export const mockProducts: Product[] = [
  { id: '1', name: 'iPhone 15 Pro', sku: 'APL-IP15P', barcode: '1234567890123', category: 'Phones', price: 134900, cost: 115000, quantity: 15, minStock: 5 },
  { id: '2', name: 'Samsung Galaxy S24', sku: 'SAM-S24', barcode: '1234567890124', category: 'Phones', price: 79999, cost: 65000, quantity: 20, minStock: 5 },
  { id: '3', name: 'MacBook Air M3', sku: 'APL-MBA-M3', barcode: '1234567890125', category: 'Laptops', price: 114900, cost: 95000, quantity: 8, minStock: 3 },
  { id: '4', name: 'Dell XPS 15', sku: 'DEL-XPS15', barcode: '1234567890126', category: 'Laptops', price: 149900, cost: 125000, quantity: 5, minStock: 2 },
  { id: '5', name: 'iPad Pro 12.9"', sku: 'APL-IPADP', barcode: '1234567890127', category: 'Tablets', price: 112900, cost: 95000, quantity: 10, minStock: 3 },
  { id: '6', name: 'AirPods Pro 2', sku: 'APL-APP2', barcode: '1234567890128', category: 'Audio', price: 24900, cost: 19000, quantity: 30, minStock: 10 },
  { id: '7', name: 'Sony WH-1000XM5', sku: 'SNY-WH5', barcode: '1234567890129', category: 'Audio', price: 29990, cost: 24000, quantity: 12, minStock: 5 },
  { id: '8', name: 'Apple Watch Ultra 2', sku: 'APL-AWU2', barcode: '1234567890130', category: 'Wearables', price: 89900, cost: 75000, quantity: 6, minStock: 2 },
  { id: '9', name: 'USB-C Cable 1m', sku: 'ACC-USBC1', barcode: '1234567890131', category: 'Accessories', price: 499, cost: 150, quantity: 100, minStock: 30 },
  { id: '10', name: 'Wireless Charger', sku: 'ACC-WC15', barcode: '1234567890132', category: 'Accessories', price: 2999, cost: 1500, quantity: 45, minStock: 15 },
  { id: '11', name: 'PS5 Controller', sku: 'SNY-PS5C', barcode: '1234567890133', category: 'Gaming', price: 5990, cost: 4500, quantity: 18, minStock: 5 },
  { id: '12', name: 'Nintendo Switch OLED', sku: 'NIN-SWO', barcode: '1234567890134', category: 'Gaming', price: 34999, cost: 28000, quantity: 7, minStock: 3 },
];

export const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Apple India Distributors', phone: '9876543210', email: 'apple@distributor.in', address: 'Mumbai, Maharashtra' },
  { id: '2', name: 'Samsung Wholesale', phone: '9876543211', email: 'samsung@wholesale.in', address: 'Delhi, NCR' },
  { id: '3', name: 'Tech Accessories Hub', phone: '9876543212', email: 'accessories@hub.in', address: 'Bangalore, Karnataka' },
];

export const mockSales: Sale[] = [];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    supplierId: '1',
    supplierName: 'Apple India Distributors',
    items: [
      { productId: '1', productName: 'iPhone 15 Pro', quantity: 10, cost: 115000 },
      { productId: '6', productName: 'AirPods Pro 2', quantity: 20, cost: 19000 },
    ],
    status: 'pending',
    total: 1530000,
    createdBy: 'Admin Manager',
    createdAt: new Date('2024-01-15'),
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
