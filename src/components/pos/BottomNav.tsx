import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, ClipboardList, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home', roles: ['manager', 'sales', 'purchase'] },
  { path: '/sales', icon: ShoppingCart, label: 'Sales', roles: ['manager', 'sales'] },
  { path: '/inventory', icon: Package, label: 'Inventory', roles: ['manager', 'sales', 'purchase'] },
  { path: '/purchase-orders', icon: ClipboardList, label: 'Orders', roles: ['manager', 'purchase'] },
  { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['manager'] },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const visibleItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {visibleItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
