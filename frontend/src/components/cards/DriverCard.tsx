import { Driver } from '@/lib/api/types';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DriverCardProps {
  driver: Driver;
  showDetails?: boolean;
  compact?: boolean;
}

export function DriverCard({ driver, showDetails = true, compact = false }: DriverCardProps) {
  const TrendIcon = driver.trend === 'up' ? TrendingUp : driver.trend === 'down' ? TrendingDown : Minus;
  const trendColor = driver.trend === 'up' ? 'text-success' : driver.trend === 'down' ? 'text-danger' : 'text-muted-foreground';
  const trendLabel = driver.trend === 'up' ? 'Em alta' : driver.trend === 'down' ? 'Em queda' : 'Estável';

  if (compact) {
    return (
      <Link
        to={`/pilotos/${driver.id}`}
        className="card-editorial p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: driver.teamColor }}
        >
          {driver.shortName}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{driver.name}</p>
          <p className="text-sm text-muted-foreground">{driver.team}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-primary">{driver.points} pts</p>
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon size={12} />
            <span>{trendLabel}</span>
          </div>
        </div>
        <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
    );
  }

  return (
    <Link
      to={`/pilotos/${driver.id}`}
      className="card-editorial overflow-hidden hover:border-primary/30 transition-colors group"
    >
      {/* Team Color Bar */}
      <div className="h-1.5" style={{ backgroundColor: driver.teamColor }} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: driver.teamColor }}
            >
              {driver.shortName}
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {driver.name}
              </h3>
              <p className="text-sm text-muted-foreground">{driver.team}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            driver.trend === 'up' ? 'badge-positive' : 
            driver.trend === 'down' ? 'badge-negative' : 'badge-neutral'
          }`}>
            <TrendIcon size={12} />
            {trendLabel}
          </div>
        </div>

        {showDetails && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{driver.points}</p>
              <p className="text-xs text-muted-foreground">Pontos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{driver.wins}</p>
              <p className="text-xs text-muted-foreground">Vitórias</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{driver.podiums}</p>
              <p className="text-xs text-muted-foreground">Pódios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{driver.avgPosition.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Pos. Média</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
