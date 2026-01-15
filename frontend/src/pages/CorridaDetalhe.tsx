import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ResultsTable } from '@/components/tables/ResultsTable';
import { StatCard } from '@/components/cards/StatCard';
import { useRace } from '@/lib/api/hooks';
import { ArrowLeft, Calendar, MapPin, Flag, Timer, ArrowUp, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CorridaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: race, isLoading, isError } = useRace(id);

  // Loading
  if (isLoading) {
    return (
      <Layout>
        <div className="py-12 text-center text-muted-foreground">Carregando corrida...</div>
      </Layout>
    );
  }

  // Error (API falhou, sem mock)
  if (isError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Não foi possível carregar os dados da corrida.</p>
          <Link to="/corridas" className="text-primary hover:underline">
            ← Voltar para corridas
          </Link>
        </div>
      </Layout>
    );
  }

  // Not found / missing data
  if (!race) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Corrida não encontrada</p>
          <Link to="/corridas" className="text-primary hover:underline">
            ← Voltar para corridas
          </Link>
        </div>
      </Layout>
    );
  }

  const hasDate = Boolean(race.date);
  const formattedDate = hasDate
    ? format(new Date(race.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : 'Data indisponível';

  const results = race.results || [];
  const winner = results.find((r) => r.position === 1) ?? results[0];

  const bestOvercomer =
    results.length > 0
      ? results.reduce((best, r) =>
          (r.positionChange ?? 0) > (best.positionChange ?? 0) ? r : best
        , results[0])
      : undefined;

  const [fastestLapDriver, fastestLapTime] = race.fastestLap?.split(' - ') ?? [];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Back Link */}
        <Link
          to="/corridas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para corridas
        </Link>

        {/* Race Header */}
        <div className="card-editorial card-highlight p-6 md:p-8">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Flag size={18} />
            <span className="text-sm font-semibold">Etapa {race.round}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {race.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin size={16} />
              <span>{race.circuit}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            title="Vencedor"
            value={winner ? winner.driver : 'Indisponível'}
            subtitle={winner?.team}
            icon={<Flag size={20} />}
            highlight
          />
          <StatCard
            title="Maior ganho de posições"
            value={bestOvercomer ? `+${bestOvercomer.positionChange ?? 0}` : '–'}
            subtitle={bestOvercomer?.driver}
            icon={<ArrowUp size={20} />}
          />
          <StatCard
            title="Volta mais rápida"
            value={fastestLapTime || 'Indisponível'}
            subtitle={fastestLapDriver || 'Sem registro'}
            icon={<Timer size={20} />}
            className="col-span-2 md:col-span-1"
          />
        </div>

        {/* Results Table */}
        <div className="card-editorial p-6">
          <h2 className="section-title">Resultado Final</h2>

          {results.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              Sem resultados disponíveis para esta corrida.
            </div>
          ) : (
            <ResultsTable results={results} showAllColumns />
          )}
        </div>

        {/* Highlights */}
        <div className="card-editorial p-6">
          <h2 className="section-title">
            <Zap size={20} />
            Destaques da Corrida
          </h2>

          {race.highlights?.length ? (
            <ul className="space-y-4">
              {race.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-foreground pt-1">{highlight}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground">Sem destaques registrados.</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
