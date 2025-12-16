import { forwardRef } from 'react';
import { Sale } from '@/types/pos';
import { formatCurrency } from '@/data/mockData';
import { format } from 'date-fns';

interface ReceiptProps {
  sale: Sale;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ sale, storeName = 'Electronics Store', storeAddress = 'Main Street, City', storePhone = '+91 98765 43210' }, ref) => {
    return (
      <div ref={ref} className="bg-white text-black p-4 font-mono text-xs max-w-[300px] mx-auto">
        {/* Header */}
        <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
          <h1 className="text-lg font-bold">{storeName}</h1>
          <p>{storeAddress}</p>
          <p>Tel: {storePhone}</p>
          <p className="mt-1">GST: 29XXXXX1234X1ZX</p>
        </div>

        {/* Invoice Info */}
        <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
          <div className="flex justify-between">
            <span>Invoice:</span>
            <span>{sale.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{sale.staffName}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
          <div className="flex justify-between font-bold mb-1">
            <span>Item</span>
            <span>Amount</span>
          </div>
          {sale.items.map((item, index) => (
            <div key={index} className="mb-1">
              <div className="truncate">{item.product.name}</div>
              <div className="flex justify-between text-gray-600">
                <span>
                  {item.quantity} x {formatCurrency(item.product.price)}
                  {item.discount > 0 && ` (-${item.discount}%)`}
                </span>
                <span>
                  {formatCurrency(item.product.price * item.quantity * (1 - item.discount / 100))}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{sale.discount}%</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm mt-1">
            <span>TOTAL:</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="uppercase">{sale.paymentMethod}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-2">
          <p>Thank you for your purchase!</p>
          <p className="mt-1 text-gray-500">Exchange within 7 days with receipt</p>
          <div className="mt-2">
            <div className="border border-black inline-block p-1">
              <p className="text-[8px]">SCAN FOR WARRANTY</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
