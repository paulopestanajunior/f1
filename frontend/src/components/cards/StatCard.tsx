import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: ReactNode;
  highlight?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  highlight = false,
  className = '',
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-muted-foreground';

  return (
    <div className={`card-editorial p-5 ${highlight ? 'card-highlight border-primary/30' : ''} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="stat-label">{title}</span>
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="stat-value">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
