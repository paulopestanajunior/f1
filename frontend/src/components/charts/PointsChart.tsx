import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Driver } from '@/lib/api/types';

interface PointsChartProps {
  drivers: Driver[];
  showLegend?: boolean;
}

export function PointsChart({ drivers, showLegend = true }: PointsChartProps) {
  // Usa pointsHistory (todas as corridas). Fallback para lastRaces caso ainda não tenha migrado.
  const seriesFor = (d: Driver) =>
    (d.pointsHistory && d.pointsHistory.length > 0 ? d.pointsHistory : d.lastRaces) ?? [];

  const maxLen =
    drivers.length > 0 ? Math.max(...drivers.map((d) => seriesFor(d).length)) : 0;

  const raceLabels = Array.from({ length: maxLen }, (_, i) => `R${i + 1}`);

  const data = raceLabels.map((race, index) => {
    const point: Record<string, string | number> = { race };

    drivers.forEach((driver) => {
      const points = seriesFor(driver);

      // acumulado até a corrida "index"
      const cumulative = points.slice(0, index + 1).reduce((sum, pts) => sum + (pts ?? 0), 0);

      point[driver.shortName] = cumulative;
    });

    return point;
  });

  if (!drivers.length || maxLen === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
        Sem dados para exibir o gráfico.
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="race" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}

          {drivers.map((driver) => (
            <Line
              key={driver.id}
              type="monotone"
              dataKey={driver.shortName}
              name={driver.name}
              stroke={driver.teamColor}
              strokeWidth={2}
              dot={{ fill: driver.teamColor, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
