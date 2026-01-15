console.log("RENDER => PilotoDetalhe");

import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/cards/StatCard';
import { PointsChart } from '@/components/charts/PointsChart';
import { useDrivers } from '@/lib/api/hooks';
import { ArrowLeft, Trophy, Target, TrendingUp, TrendingDown, Minus, Flag, Percent } from 'lucide-react';

export default function PilotoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: driverData, isLoading } = useDrivers();
  const driver = driverData?.find((d) => d.id === (id || ''));

  if (!driver) {
    if (isLoading) {
      return (
        <Layout>
          <div className="text-center py-12 text-muted-foreground">Carregando piloto...</div>
        </Layout>
      );
    }
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Piloto não encontrado</p>
          <Link to="/pilotos" className="text-primary hover:underline">
            ← Voltar para pilotos
          </Link>
        </div>
      </Layout>
    );
  }

  const TrendIcon = driver.trend === 'up' ? TrendingUp : driver.trend === 'down' ? TrendingDown : Minus;
  const trendLabel = driver.trend === 'up' ? 'Em crescimento' : driver.trend === 'down' ? 'Em queda' : 'Estável';
  const trendDescription = driver.trend === 'up' 
    ? 'Piloto vem apresentando resultados acima da média nas últimas corridas'
    : driver.trend === 'down'
    ? 'Piloto passa por fase difícil e precisa recuperar o ritmo'
    : 'Piloto mantém desempenho consistente ao longo da temporada';

  // Find teammate for comparison
  const teammate = driverData?.find(d => d.team === driver.team && d.id !== driver.id);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Back Link */}
        <Link 
          to="/pilotos" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para pilotos
        </Link>

        {/* Driver Header */}
        <div className="card-editorial overflow-hidden">
          <div className="h-2" style={{ backgroundColor: driver.teamColor }} />
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold"
                style={{ backgroundColor: driver.teamColor }}
              >
                {driver.shortName}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {driver.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-3">{driver.team}</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  driver.trend === 'up' ? 'badge-positive' : 
                  driver.trend === 'down' ? 'badge-negative' : 'badge-neutral'
                }`}>
                  <TrendIcon size={16} />
                  {trendLabel}
                </div>
              </div>
              <div className="text-right">
                <p className="stat-value">{driver.points}</p>
                <p className="stat-label">Pontos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Vitórias"
            value={driver.wins}
            icon={<Trophy size={20} />}
          />
          <StatCard
            title="Pódios"
            value={driver.podiums}
            icon={<Flag size={20} />}
          />
          <StatCard
            title="Posição Média"
            value={driver.avgPosition.toFixed(1)}
            icon={<Target size={20} />}
          />
          <StatCard
            title="Consistência"
            value={`${driver.consistency}%`}
            icon={<Percent size={20} />}
          />
        </div>

        {/* Chart Section */}
        <div className="card-editorial p-6">
          <h2 className="section-title">
            Evolução de Pontos
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Pontos acumulados nas últimas 8 corridas
          </p>
          <PointsChart drivers={teammate ? [driver, teammate] : [driver]} />
          {teammate && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              Comparação com companheiro de equipe: {teammate.name}
            </p>
          )}
        </div>

        {/* Analysis Card */}
        <div className={`card-editorial p-6 ${
          driver.trend === 'up' ? 'border-success/30 bg-success/5' : 
          driver.trend === 'down' ? 'border-danger/30 bg-danger/5' : ''
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              driver.trend === 'up' ? 'bg-success/10 text-success' : 
              driver.trend === 'down' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
            }`}>
              <TrendIcon size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Análise do momento</h3>
              <p className="text-muted-foreground">{trendDescription}</p>
            </div>
          </div>
        </div>

        {/* Last Races Points */}
        <div className="card-editorial p-6">
          <h2 className="section-title">
            Últimas Corridas
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {driver.lastRaces.map((points, index) => (
              <div 
                key={index}
                className={`text-center p-3 rounded-lg ${
                  points === 25 ? 'bg-warning/10 border border-warning/30' :
                  points >= 15 ? 'bg-success/10 border border-success/30' :
                  points === 0 ? 'bg-danger/10 border border-danger/30' :
                  'bg-muted'
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1">R{index + 1}</p>
                <p className="font-bold text-foreground">{points}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
