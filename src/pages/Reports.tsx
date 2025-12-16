import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Package, Users } from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { formatCurrency } from '@/data/mockData';
import { BottomNav } from '@/components/pos/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const Reports = () => {
  const { sales, products } = usePOS();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const dateRange = useMemo(() => {
    const today = new Date();
    switch (period) {
      case 'today':
        return { start: startOfDay(today), end: endOfDay(today) };
      case 'week':
        return { start: startOfDay(subDays(today, 7)), end: endOfDay(today) };
      case 'month':
        return { start: startOfDay(subDays(today, 30)), end: endOfDay(today) };
    }
  }, [period]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => 
      isWithinInterval(new Date(sale.createdAt), dateRange)
    );
  }, [sales, dateRange]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalCost = filteredSales.reduce((sum, s) => 
      sum + s.items.reduce((itemSum, item) => itemSum + item.product.cost * item.quantity, 0), 0
    );
    const totalProfit = totalRevenue - totalCost;
    const avgSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

    return { totalRevenue, totalCost, totalProfit, avgSale, transactionCount: filteredSales.length };
  }, [filteredSales]);

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = { name: item.product.name, quantity: 0, revenue: 0 };
        }
        productSales[item.product.id].quantity += item.quantity;
        productSales[item.product.id].revenue += item.product.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales]);

  const paymentBreakdown = useMemo(() => {
    const breakdown = { cash: 0, card: 0, upi: 0 };
    filteredSales.forEach(sale => {
      breakdown[sale.paymentMethod] += sale.total;
    });
    return breakdown;
  }, [filteredSales]);

  const stockValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.cost * p.quantity, 0);
  }, [products]);

  const potentialRevenue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 safe-top sticky top-0 z-40">
        <h1 className="text-xl font-bold mb-3">Reports & Analytics</h1>
        
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">7 Days</TabsTrigger>
            <TabsTrigger value="month">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <main className="p-4 space-y-4">
          {/* Revenue Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
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
                    <p className="text-xs text-muted-foreground">Profit</p>
                    <p className="text-lg font-bold">{formatCurrency(stats.totalProfit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                    <p className="text-lg font-bold">{stats.transactionCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. Sale</p>
                    <p className="text-lg font-bold">{formatCurrency(stats.avgSale)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(paymentBreakdown).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="capitalize">{method}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ 
                            width: `${stats.totalRevenue > 0 ? (amount / stats.totalRevenue) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="font-medium min-w-[80px] text-right">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-5">{index + 1}.</span>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[150px]">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.quantity} sold</p>
                        </div>
                      </div>
                      <span className="font-bold text-primary">{formatCurrency(product.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data</p>
              )}
            </CardContent>
          </Card>

          {/* Stock Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock Value (Cost)</span>
                  <span className="font-medium">{formatCurrency(stockValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potential Revenue</span>
                  <span className="font-medium">{formatCurrency(potentialRevenue)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Potential Profit</span>
                  <span className="font-bold text-accent">{formatCurrency(potentialRevenue - stockValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSales.length > 0 ? (
                <div className="space-y-3">
                  {filteredSales.slice(0, 5).map(sale => (
                    <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{sale.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(sale.createdAt), 'dd MMM, HH:mm')} · {sale.items.length} items
                        </p>
                      </div>
                      <span className="font-bold">{formatCurrency(sale.total)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No sales in this period</p>
              )}
            </CardContent>
          </Card>
        </main>
      </ScrollArea>

      <BottomNav />
    </div>
  );
};

export default Reports;
