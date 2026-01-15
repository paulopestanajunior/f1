import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/cards/StatCard';
import { HighlightCard } from '@/components/cards/HighlightCard';
import { DriverCard } from '@/components/cards/DriverCard';
import { ResultsTable } from '@/components/tables/ResultsTable';
import { useDrivers, useSeasonOverview } from '@/lib/api/hooks';
import { useSeason } from '@/lib/season-context';
import { Trophy, TrendingUp, TrendingDown, Users, Flag, Calendar, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';


export default function Panorama() {
  const { season } = useSeason();
  const { data: overview, isLoading: overviewLoading } = useSeasonOverview();
  const { data: driverData } = useDrivers();

  if (!overview && overviewLoading) {
    return (
      <Layout>
        <div className="py-12 text-center text-muted-foreground">Carregando panorama da temporada...</div>
      </Layout>
    );
  }

  const driversToShow = (driverData || []).slice(0, 4);
  if (!overview) {
    return (
      <Layout>
        <div className="py-12 text-center text-muted-foreground">Não foi possível carregar o panorama da temporada.</div>
      </Layout>
    );
  }

  const overviewData = overview;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Hero Section */}
        <section>
          <div className="card-editorial card-highlight p-6 md:p-8">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Trophy size={20} />
              <span className="text-sm font-semibold uppercase tracking-wide">Panorama da Temporada {season}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {overviewData.leader.name} lidera o campeonato
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-primary">{overviewData.leader.points}</p>
                <p className="text-sm text-muted-foreground">Pontos do líder</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-foreground">{overviewData.leader.wins}</p>
                <p className="text-sm text-muted-foreground">Vitórias</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-foreground">{overviewData.lastRace.round}</p>
                <p className="text-sm text-muted-foreground">Corridas realizadas</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-3xl md:text-4xl font-extrabold text-foreground">
                  {overviewData.leader.consistency}%
                </p>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <span className="text-sm text-muted-foreground">Consistência</span>
                      <Info size={14} className="text-muted-foreground" />
                    </div>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Percentual de corridas em que o piloto terminou no Top 10 ao longo da temporada.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-2">Destaques da temporada</h3>
              <ul className="grid md:grid-cols-2 gap-2">
                {overviewData.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Zap size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Stats Cards */}
        <section className="grid md:grid-cols-3 gap-4">
          <HighlightCard
            title="Piloto em melhor fase"
            description={`${overviewData.topMomentum.name} vem crescendo nas últimas corridas e ameaça a liderança`}
            value={`${overviewData.topMomentum.points} pts`}
            icon={TrendingUp}
            variant="positive"
          />
          <HighlightCard
            title="Piloto em queda"
            description={`${overviewData.fallingDriver.name} passa por momento difícil e está abaixo das expectativas`}
            value={`${overviewData.fallingDriver.points} pts`}
            icon={TrendingDown}
            variant="negative"
          />
          <HighlightCard
            title="Equipe dominante"
            description={`${overviewData.dominantTeam} tem o melhor carro no momento e lidera os construtores`}
            icon={Users}
            variant="neutral"
          />
        </section>

        {/* Last Race Section */}
        <section>
          <h2 className="section-title">
            <Flag size={20} />
            Último GP Analisado
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card-editorial p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{overviewData.lastRace.name}</h3>
                    <p className="text-sm text-muted-foreground">{overviewData.lastRace.circuit}</p>
                  </div>
                  <Link 
                    to={`/corridas/${overviewData.lastRace.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Ver detalhes →
                  </Link>
                </div>
                <ResultsTable results={overviewData.lastRace.results.slice(0, 5)} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="card-editorial p-5">
                <h4 className="font-semibold text-foreground mb-3">Destaques da corrida</h4>
                <ul className="space-y-3">
                  {overviewData.lastRace.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-editorial p-5">
                <p className="text-xs text-muted-foreground mb-1">Volta mais rápida</p>
                <p className="font-semibold text-foreground">{overviewData.lastRace.fastestLap}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Drivers Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <Trophy size={20} />
              Top 4 do Campeonato
            </h2>
            <Link 
              to="/pilotos"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {driversToShow.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        </section>

        {/* Info Note */}
        <section className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            <Calendar size={14} className="inline mr-1" />
            Análise baseada nas últimas corridas disponíveis • Temporada {season}
          </p>
        </section>
      </div>
    </Layout>
  );
}
