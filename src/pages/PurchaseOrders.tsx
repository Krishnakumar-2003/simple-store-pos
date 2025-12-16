import { useState } from 'react';
import { Plus, Package, Check, X, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { formatCurrency } from '@/data/mockData';
import { PurchaseOrder } from '@/types/pos';
import { BottomNav } from '@/components/pos/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const PurchaseOrders = () => {
  const { user } = useAuth();
  const { products, suppliers, purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus } = usePOS();
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'received' | 'cancelled'>('all');

  const filteredOrders = purchaseOrders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    setOrderItems(orderItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.cost || 0) * item.quantity;
    }, 0);
  };

  const handleSubmit = () => {
    if (!selectedSupplier || orderItems.length === 0) {
      toast({ title: 'Please select supplier and add items', variant: 'destructive' });
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    if (!supplier || !user) return;

    const items = orderItems
      .filter(item => item.productId && item.quantity > 0)
      .map(item => {
        const product = products.find(p => p.id === item.productId)!;
        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          cost: product.cost,
        };
      });

    addPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      items,
      status: 'pending',
      total: calculateTotal(),
      createdBy: user.name,
    });

    toast({ title: 'Purchase order created' });
    setShowForm(false);
    setSelectedSupplier('');
    setOrderItems([]);
  };

  const handleStatusChange = (orderId: string, status: PurchaseOrder['status']) => {
    updatePurchaseOrderStatus(orderId, status);
    toast({ 
      title: status === 'received' 
        ? 'Order received! Stock updated.' 
        : `Order marked as ${status}` 
    });
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning border-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'received':
        return <Badge variant="default" className="bg-accent"><Check className="h-3 w-3 mr-1" />Received</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Cancelled</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 safe-top sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">Purchase Orders</h1>
            <p className="text-sm text-muted-foreground">
              {purchaseOrders.filter(o => o.status === 'pending').length} pending orders
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Order
          </Button>
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </header>

      {/* Orders List */}
      <main className="p-4 space-y-4">
        {filteredOrders.map(order => (
          <Card key={order.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">{order.supplierName}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.productName} x{item.quantity}</span>
                    <span className="text-muted-foreground">{formatCurrency(item.cost * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), 'dd MMM yyyy')} · {order.createdBy}
                  </p>
                  <p className="font-bold">{formatCurrency(order.total)}</p>
                </div>

                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'received')}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Receive
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No orders found</p>
          </div>
        )}
      </main>

      {/* New Order Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Items</Label>
                  <Button variant="outline" size="sm" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <Select
                        value={item.productId}
                        onValueChange={(v) => handleItemChange(index, 'productId', v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      className="w-20 h-9"
                      placeholder="Qty"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {orderItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Add items to this order
                  </p>
                )}
              </div>

              {orderItems.length > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default PurchaseOrders;
