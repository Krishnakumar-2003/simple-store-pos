import { Minus, Plus, Trash2, Percent } from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { formatCurrency } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, updateCartDiscount, cartSubtotal, cartTotal } = usePOS();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <p className="text-lg">Cart is empty</p>
        <p className="text-sm">Add products to start a sale</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {cart.map(item => (
            <div key={item.product.id} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.product.price)}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2 gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.quantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Percent className="h-3 w-3 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => updateCartDiscount(item.product.id, Number(e.target.value))}
                    className="w-14 h-8 text-center text-sm"
                  />
                </div>
                
                <p className="font-semibold text-sm min-w-[80px] text-right">
                  {formatCurrency(item.product.price * item.quantity * (1 - item.discount / 100))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="border-t border-border pt-3 mt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(cartSubtotal)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(cartTotal)}</span>
        </div>
      </div>
    </div>
  );
};
