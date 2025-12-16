import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, ClipboardList, BarChart3, AlertTriangle, LogOut, TrendingUp, IndianRupee } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { formatCurrency } from '@/data/mockData';
import { BottomNav } from '@/components/pos/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { products, sales, getLowStockProducts, purchaseOrders } = usePOS();
  const navigate = useNavigate();

  const lowStockProducts = getLowStockProducts();
  const todaySales = sales.filter(s => {
    const today = new Date();
    const saleDate = new Date(s.createdAt);
    return saleDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const pendingOrders = purchaseOrders.filter(o => o.status === 'pending').length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const quickActions = [
    { label: 'New Sale', icon: ShoppingCart, path: '/sales', roles: ['manager', 'sales'], color: 'bg-primary' },
    { label: 'Inventory', icon: Package, path: '/inventory', roles: ['manager', 'sales', 'purchase'], color: 'bg-accent' },
    { label: 'Orders', icon: ClipboardList, path: '/purchase-orders', roles: ['manager', 'purchase'], color: 'bg-warning' },
    { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['manager'], color: 'bg-secondary' },
  ];

  const visibleActions = quickActions.filter(a => user && a.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ElectroPOS</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.name}
              <Badge variant="outline" className="ml-2 capitalize">{user?.role}</Badge>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Today's Sales</p>
                  <p className="text-lg font-bold">{formatCurrency(todayRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">{todaySales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Products</p>
                  <p className="text-lg font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Orders</p>
                  <p className="text-lg font-bold">{pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {visibleActions.map(action => (
                <Button
                  key={action.path}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className="h-6 w-6" />
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (user?.role === 'manager' || user?.role === 'purchase') && (
          <Card className="border-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 3).map(product => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{product.name}</span>
                    <Badge variant="destructive">{product.quantity} left</Badge>
                  </div>
                ))}
                {lowStockProducts.length > 3 && (
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/inventory')}>
                    View all {lowStockProducts.length} items
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
