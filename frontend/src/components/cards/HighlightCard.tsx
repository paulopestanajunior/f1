import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface HighlightCardProps {
  title: string;
  description: string;
  value?: string | number;
  icon: LucideIcon;
  variant?: 'positive' | 'negative' | 'neutral';
}

export function HighlightCard({
  title,
  description,
  value,
  icon: Icon,
  variant = 'neutral',
}: HighlightCardProps) {
  const variantStyles = {
    positive: 'border-success/30 bg-success/5',
    negative: 'border-danger/30 bg-danger/5',
    neutral: 'border-border',
  };

  const iconStyles = {
    positive: 'text-success bg-success/10',
    negative: 'text-danger bg-danger/10',
    neutral: 'text-primary bg-primary/10',
  };

  return (
    <div className={`card-editorial p-5 ${variantStyles[variant]}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${iconStyles[variant]}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          {value && (
            <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}
