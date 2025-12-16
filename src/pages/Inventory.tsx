import { useState } from 'react';
import { Search, Plus, Edit, Trash2, X, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { formatCurrency } from '@/data/mockData';
import { Product, CATEGORIES, Category } from '@/types/pos';
import { BottomNav } from '@/components/pos/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

const Inventory = () => {
  const { user } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = usePOS();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Phones' as Category,
    price: '',
    cost: '',
    quantity: '',
    minStock: '',
  });

  const isManager = user?.role === 'manager';

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesStock = filterStock === 'all' || 
                        (filterStock === 'low' && p.quantity <= p.minStock && p.quantity > 0) ||
                        (filterStock === 'out' && p.quantity === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const resetForm = () => {
    setFormData({ name: '', sku: '', barcode: '', category: 'Phones', price: '', cost: '', quantity: '', minStock: '' });
    setEditingProduct(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      category: product.category as Category,
      price: product.price.toString(),
      cost: product.cost.toString(),
      quantity: product.quantity.toString(),
      minStock: product.minStock.toString(),
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.sku || !formData.price || !formData.cost) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const productData = {
      name: formData.name,
      sku: formData.sku,
      barcode: formData.barcode || undefined,
      category: formData.category,
      price: Number(formData.price),
      cost: Number(formData.cost),
      quantity: Number(formData.quantity) || 0,
      minStock: Number(formData.minStock) || 5,
    };

    if (editingProduct) {
      updateProduct({ ...productData, id: editingProduct.id });
      toast({ title: 'Product updated successfully' });
    } else {
      addProduct(productData);
      toast({ title: 'Product added successfully' });
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Delete "${product.name}"?`)) {
      deleteProduct(product.id);
      toast({ title: 'Product deleted' });
    }
  };

  const totalValue = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 safe-top sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">Inventory</h1>
            <p className="text-sm text-muted-foreground">
              {products.length} products · {formatCurrency(totalValue)} value
            </p>
          </div>
          {isManager && (
            <Button onClick={openAddForm}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3">
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as Category | 'All')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStock} onValueChange={(v) => setFilterStock(v as 'all' | 'low' | 'out')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Products List */}
      <main className="p-4">
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      {product.quantity === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : product.quantity <= product.minStock ? (
                        <Badge variant="outline" className="text-warning border-warning">
                          Low: {product.quantity}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Stock: {product.quantity}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>Price: <strong className="text-primary">{formatCurrency(product.price)}</strong></span>
                      <span className="text-muted-foreground">Cost: {formatCurrency(product.cost)}</span>
                    </div>
                  </div>

                  {isManager && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No products found</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="iPhone 15 Pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>SKU *</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="APL-IP15P"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <Input
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as Category })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Selling Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="80000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Stock Alert</Label>
                  <Input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingProduct ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Inventory;
