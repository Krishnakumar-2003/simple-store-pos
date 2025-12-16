import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Sale, Supplier, PurchaseOrder } from '@/types/pos';
import { mockProducts, mockSuppliers, mockSales, mockPurchaseOrders } from '@/data/mockData';

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  sales: Sale[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: 'cash' | 'card' | 'upi', staffId: string, staffName: string, discount?: number) => Sale;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  updatePurchaseOrderStatus: (orderId: string, status: PurchaseOrder['status']) => void;
  getLowStockProducts: () => Product[];
  cartTotal: number;
  cartSubtotal: number;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('pos_products');
    const savedSales = localStorage.getItem('pos_sales');
    const savedOrders = localStorage.getItem('pos_purchase_orders');
    
    setProducts(savedProducts ? JSON.parse(savedProducts) : mockProducts);
    setSales(savedSales ? JSON.parse(savedSales) : mockSales);
    setPurchaseOrders(savedOrders ? JSON.parse(savedOrders) : mockPurchaseOrders);
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('pos_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('pos_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, Math.min(quantity, item.product.quantity)) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const updateCartDiscount = (productId: string, discount: number) => {
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, discount } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    return sum + itemTotal - (itemTotal * item.discount / 100);
  }, 0);

  const completeSale = (paymentMethod: 'cash' | 'card' | 'upi', staffId: string, staffName: string, discount = 0): Sale => {
    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      items: [...cart],
      subtotal: cartSubtotal,
      discount,
      tax: 0,
      total: cartTotal - (cartTotal * discount / 100),
      paymentMethod,
      staffId,
      staffName,
      createdAt: new Date(),
    };

    // Update product quantities
    setProducts(prev =>
      prev.map(product => {
        const cartItem = cart.find(item => item.product.id === product.id);
        if (cartItem) {
          return { ...product, quantity: product.quantity - cartItem.quantity };
        }
        return product;
      })
    );

    setSales(prev => [sale, ...prev]);
    clearCart();
    return sale;
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: `PROD-${Date.now()}` };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    const newOrder: PurchaseOrder = {
      ...order,
      id: `PO-${Date.now()}`,
      createdAt: new Date(),
    };
    setPurchaseOrders(prev => [newOrder, ...prev]);
  };

  const updatePurchaseOrderStatus = (orderId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const updated = { ...order, status };
          if (status === 'received') {
            updated.receivedAt = new Date();
            // Update product quantities
            setProducts(products =>
              products.map(product => {
                const orderItem = order.items.find(item => item.productId === product.id);
                if (orderItem) {
                  return { ...product, quantity: product.quantity + orderItem.quantity };
                }
                return product;
              })
            );
          }
          return updated;
        }
        return order;
      })
    );
  };

  const getLowStockProducts = () => products.filter(p => p.quantity <= p.minStock);

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        sales,
        suppliers,
        purchaseOrders,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartDiscount,
        clearCart,
        completeSale,
        addProduct,
        updateProduct,
        deleteProduct,
        addPurchaseOrder,
        updatePurchaseOrderStatus,
        getLowStockProducts,
        cartTotal,
        cartSubtotal,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within POSProvider');
  }
  return context;
};
