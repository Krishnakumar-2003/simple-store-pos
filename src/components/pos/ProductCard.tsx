import { Plus, AlertTriangle } from 'lucide-react';
import { Product } from '@/types/pos';
import { formatCurrency } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd?: () => void;
  onClick?: () => void;
  showStock?: boolean;
  compact?: boolean;
}

export const ProductCard = ({ product, onAdd, onClick, showStock = true, compact = false }: ProductCardProps) => {
  const isLowStock = product.quantity <= product.minStock;
  const isOutOfStock = product.quantity === 0;

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all hover:shadow-md cursor-pointer',
        isOutOfStock && 'opacity-60',
        compact && 'h-full'
      )}
      onClick={onClick}
    >
      <CardContent className={cn('p-3', compact && 'p-2')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={cn('font-semibold truncate', compact ? 'text-sm' : 'text-base')}>
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground">{product.sku}</p>
            <p className={cn('font-bold text-primary mt-1', compact ? 'text-sm' : 'text-lg')}>
              {formatCurrency(product.price)}
            </p>
            
            {showStock && (
              <div className="flex items-center gap-2 mt-2">
                {isOutOfStock ? (
                  <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                ) : isLowStock ? (
                  <Badge variant="outline" className="text-xs text-warning border-warning">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Low: {product.quantity}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Stock: {product.quantity}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {onAdd && !isOutOfStock && (
            <Button
              size="icon"
              variant="default"
              className="h-10 w-10 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
