import { useState, useRef } from 'react';
import { Search, X, CreditCard, Banknote, Smartphone, Share2, Printer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { formatCurrency } from '@/data/mockData';
import { CATEGORIES, Category } from '@/types/pos';
import { BottomNav } from '@/components/pos/BottomNav';
import { ProductCard } from '@/components/pos/ProductCard';
import { Cart } from '@/components/pos/Cart';
import { Receipt } from '@/components/pos/Receipt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Sale } from '@/types/pos';

const Sales = () => {
  const { user } = useAuth();
  const { products, cart, addToCart, completeSale, clearCart, cartTotal } = usePOS();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [showPayment, setShowPayment] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.sku.toLowerCase().includes(search.toLowerCase()) ||
                         p.barcode?.includes(search);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePayment = (method: 'cash' | 'card' | 'upi') => {
    if (!user) return;
    const sale = completeSale(method, user.id, user.name);
    setCompletedSale(sale);
    setShowPayment(false);
    setShowReceipt(true);
    toast({ title: 'Sale completed!', description: `Total: ${formatCurrency(sale.total)}` });
  };

  const handleShareReceipt = async () => {
    if (!completedSale) return;
    
    const receiptText = `
ElectroPOS Receipt
Invoice: ${completedSale.id}
Date: ${new Date(completedSale.createdAt).toLocaleString()}
---
${completedSale.items.map(item => `${item.product.name} x${item.quantity} - ${formatCurrency(item.product.price * item.quantity)}`).join('\n')}
---
Total: ${formatCurrency(completedSale.total)}
Payment: ${completedSale.paymentMethod.toUpperCase()}
---
Thank you for your purchase!
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Receipt', text: receiptText });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(receiptText);
      toast({ title: 'Receipt copied to clipboard!' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 safe-top sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Cart Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" className="relative">
                Cart
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {cart.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
              <SheetHeader>
                <SheetTitle>Shopping Cart</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden py-4">
                <Cart />
              </div>
              {cart.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <Button className="w-full" size="lg" onClick={() => setShowPayment(true)}>
                    Checkout {formatCurrency(cartTotal)}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Categories */}
        <ScrollArea className="mt-3 -mx-4 px-4">
          <div className="flex gap-2 pb-2">
            <Badge
              variant={selectedCategory === 'All' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategory('All')}
            >
              All
            </Badge>
            {CATEGORIES.map(cat => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </header>

      {/* Products Grid */}
      <main className="p-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => addToCart(product)}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No products found</p>
            </div>
          )}
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-2xl font-bold mb-6">{formatCurrency(cartTotal)}</p>
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="h-16 text-lg" onClick={() => handlePayment('cash')}>
                <Banknote className="h-6 w-6 mr-3" />
                Cash
              </Button>
              <Button variant="outline" className="h-16 text-lg" onClick={() => handlePayment('card')}>
                <CreditCard className="h-6 w-6 mr-3" />
                Card
              </Button>
              <Button variant="outline" className="h-16 text-lg" onClick={() => handlePayment('upi')}>
                <Smartphone className="h-6 w-6 mr-3" />
                UPI
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sale Complete!</DialogTitle>
          </DialogHeader>
          {completedSale && (
            <>
              <ScrollArea className="max-h-[60vh]">
                <Receipt ref={receiptRef} sale={completedSale} />
              </ScrollArea>
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button className="w-full" onClick={handleShareReceipt}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Receipt
                </Button>
                <Button variant="outline" className="w-full" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setShowReceipt(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Sales;
