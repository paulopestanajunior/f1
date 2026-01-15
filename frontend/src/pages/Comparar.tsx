import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PointsChart } from '@/components/charts/PointsChart';
import { useDrivers } from '@/lib/api/hooks';
import { Users, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Comparar() {
  const [driver1Id, setDriver1Id] = useState<string>('');
  const [driver2Id, setDriver2Id] = useState<string>('');

  const { data: driverData, isLoading } = useDrivers();
  const driverList = driverData || [];

  useEffect(() => {
    if (!driverList.length) return;

    const first = driverList[0]?.id;
    const second = driverList.find((d) => d.id !== first)?.id;

    if (!driver1Id || !driverList.some((d) => d.id === driver1Id)) {
      if (first) setDriver1Id(first);
    }

    if (!driver2Id || !driverList.some((d) => d.id === driver2Id) || driver2Id === driver1Id) {
      if (second) setDriver2Id(second);
    }
  }, [driverList, driver1Id, driver2Id]);

  const driver1 = useMemo(
    () => driverList.find((d) => d.id === driver1Id),
    [driverList, driver1Id]
  );
  const driver2 = useMemo(
    () => driverList.find((d) => d.id === driver2Id),
    [driverList, driver2Id]
  );

  const ComparisonStat = ({
    label,
    value1,
    value2,
    higherIsBetter = true,
  }: {
    label: string;
    value1: number;
    value2: number;
    higherIsBetter?: boolean;
  }) => {
    const winner1 = higherIsBetter ? value1 > value2 : value1 < value2;
    const winner2 = higherIsBetter ? value2 > value1 : value2 < value1;

    const format = (v: number) => (typeof v === 'number' && v % 1 !== 0 ? v.toFixed(1) : v);

    return (
      <div className="grid grid-cols-3 items-center py-4 border-b border-border last:border-0">
        <div className={`text-right ${winner1 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
          {format(value1)}
        </div>
        <div className="text-center text-sm font-medium text-foreground">{label}</div>
        <div className={`text-left ${winner2 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
          {format(value2)}
        </div>
      </div>
    );
  };

  const TrendBadge = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const label = trend === 'up' ? 'Em alta' : trend === 'down' ? 'Em queda' : 'Estável';

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend === 'up' ? 'badge-positive' : trend === 'down' ? 'badge-negative' : 'badge-neutral'
        }`}
      >
        <Icon size={12} />
        {label}
      </div>
    );
  };

  const hist1 = driver1?.pointsHistory ?? [];
  const hist2 = driver2?.pointsHistory ?? [];
  const totalRounds = Math.max(hist1.length, hist2.length);

  const getVal = (arr: number[], idx: number) =>
    typeof arr[idx] === 'number' ? arr[idx] : undefined;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Comparar Pilotos</h1>
          <p className="text-muted-foreground">Compare o desempenho de dois pilotos na temporada</p>
        </div>

        {/* Selectors */}
        <div className="card-editorial p-6">
          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
            <Select value={driver1Id} onValueChange={setDriver1Id}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um piloto" />
              </SelectTrigger>
              <SelectContent>
                {driverList.map((d) => (
                  <SelectItem key={d.id} value={d.id} disabled={d.id === driver2Id}>
                    {d.name} ({d.team})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden md:flex items-center justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Users size={20} className="text-primary" />
              </div>
            </div>

            <Select value={driver2Id} onValueChange={setDriver2Id}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um piloto" />
              </SelectTrigger>
              <SelectContent>
                {driverList.map((d) => (
                  <SelectItem key={d.id} value={d.id} disabled={d.id === driver1Id}>
                    {d.name} ({d.team})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="card-editorial p-12 text-center text-muted-foreground">
            Carregando pilotos para comparação...
          </div>
        ) : driver1 && driver2 ? (
          <>
            {/* Driver Headers */}
            <div className="grid md:grid-cols-2 gap-4">
              {[driver1, driver2].map((d) => (
                <div key={d.id} className="card-editorial overflow-hidden">
                  <div className="h-1.5" style={{ backgroundColor: d.teamColor }} />
                  <div className="p-5 flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: d.teamColor }}
                    >
                      {d.shortName}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{d.name}</h3>
                      <p className="text-sm text-muted-foreground">{d.team}</p>
                    </div>
                    <TrendBadge trend={d.trend} />
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Stats */}
            <div className="card-editorial p-6">
              <h2 className="section-title mb-6">
                <Trophy size={20} />
                Números da Temporada
              </h2>

              <div className="max-w-xl mx-auto">
                <div className="grid grid-cols-3 items-center pb-2 border-b-2 border-primary mb-2">
                  <div className="text-right">
                    <div
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ backgroundColor: driver1.teamColor }}
                    />
                  </div>
                  <div className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estatística
                  </div>
                  <div className="text-left">
                    <div
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ backgroundColor: driver2.teamColor }}
                    />
                  </div>
                </div>

                <ComparisonStat label="Pontos" value1={driver1.points} value2={driver2.points} />
                <ComparisonStat label="Vitórias" value1={driver1.wins} value2={driver2.wins} />
                <ComparisonStat label="Pódios" value1={driver1.podiums} value2={driver2.podiums} />
                <ComparisonStat
                  label="Pos. Média"
                  value1={driver1.avgPosition}
                  value2={driver2.avgPosition}
                  higherIsBetter={false}
                />
                <ComparisonStat label="Consistência" value1={driver1.consistency} value2={driver2.consistency} />
              </div>
            </div>

            {/* Points Chart */}
            <div className="card-editorial p-6">
              <h2 className="section-title">Evolução de Pontos</h2>
              <p className="text-sm text-muted-foreground mb-6">Pontos acumulados na temporada</p>
              <PointsChart drivers={[driver1, driver2]} />
            </div>

            {/* Race by Race (TODAS) */}
            <div className="card-editorial p-6">
              <h2 className="section-title">Corrida a Corrida</h2>

              <div className="overflow-x-auto">
                <table className="table-f1 w-full">
                  {/* ✅ define as larguras das colunas pra alinhar header e valores */}
                  <colgroup>
                    <col style={{ width: '110px' }} />
                    <col style={{ width: '220px' }} />
                    <col style={{ width: '220px' }} />
                    <col style={{ width: '170px' }} />
                  </colgroup>

                  <thead>
                    <tr>
                      <th className="text-left">CORRIDA</th>
                      {/* ✅ header centralizado */}
                      <th className="text-center" style={{ color: driver1.teamColor }}>
                        {driver1.name}
                      </th>
                      <th className="text-center" style={{ color: driver2.teamColor }}>
                        {driver2.name}
                      </th>
                      <th className="text-center">VANTAGEM</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Array.from({ length: totalRounds }, (_, i) => i).map((i) => {
                      const v1 = getVal(hist1, i);
                      const v2 = getVal(hist2, i);

                      const canCompare = typeof v1 === 'number' && typeof v2 === 'number';
                      const diff = canCompare ? (v1 as number) - (v2 as number) : 0;

                      return (
                        <tr key={i}>
                          <td className="font-medium text-left">{`R${i + 1}`}</td>

                          {/* ✅ valor centralizado igual ao header */}
                          <td
                            className={`text-center font-semibold ${
                              canCompare && (v1 as number) > (v2 as number) ? 'text-primary' : ''
                            }`}
                          >
                            {typeof v1 === 'number' ? `${v1} pts` : '—'}
                          </td>

                          <td
                            className={`text-center font-semibold ${
                              canCompare && (v2 as number) > (v1 as number) ? 'text-primary' : ''
                            }`}
                          >
                            {typeof v2 === 'number' ? `${v2} pts` : '—'}
                          </td>

                          <td
                            className={`text-center font-medium ${
                              !canCompare
                                ? 'text-muted-foreground'
                                : diff > 0
                                ? 'text-success'
                                : diff < 0
                                ? 'text-danger'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {!canCompare
                              ? '—'
                              : diff > 0
                              ? `+${diff} ${driver1.shortName}`
                              : diff < 0
                              ? `+${Math.abs(diff)} ${driver2.shortName}`
                              : 'Empate'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Comparação baseada em dados da temporada</p>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
