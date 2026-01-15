import { Layout } from '@/components/layout/Layout';
import { RaceCard } from '@/components/cards/RaceCard';
import { useRaces, useSeasonOverview } from '@/lib/api/hooks';
import { useSeason } from '@/lib/season-context';
import { Calendar, Flag } from 'lucide-react';

export default function Corridas() {
  const { season } = useSeason();

  const { data: raceData, isLoading } = useRaces();
  const { data: overview, isLoading: overviewLoading } = useSeasonOverview(); 
  const raceList = raceData || [];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Corridas</h1>
          <p className="text-muted-foreground">
            Veja o que cada corrida da temporada mostrou
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-editorial p-4 text-center">
            <p className="text-2xl font-bold text-primary"> {overview?.racesCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Corridas realizadas</p>
          </div>
          <div className="card-editorial p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{overview?.racesCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Total na temporada</p>
          </div>
          <div className="card-editorial p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{overview?.winnersCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Vencedores diferentes</p>
          </div>
          <div className="card-editorial p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{overview?.podiumTeamsCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Equipes no pódio</p>
          </div>
        </div>

        {/* Races List */}
        <section>
          <h2 className="section-title">
            <Calendar size={20} />
            Últimas Corridas
          </h2>
          {isLoading ? (
            <div className="card-editorial p-12 text-center text-muted-foreground">Carregando corridas...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {raceList.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            <Flag size={14} className="inline mr-1" />
            Dados das corridas mais recentes disponíveis
          </p>
        </div>
      </div>
    </Layout>
  );
}
