import { Race } from '@/lib/api/types';
import { Calendar, MapPin, ChevronRight, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RaceCardProps {
  race: Race;
}

export function RaceCard({ race }: RaceCardProps) {
  const winner = race.results[0];
  const formattedDate = format(new Date(race.date), "d 'de' MMMM", { locale: ptBR });

  return (
    <Link
      to={`/corridas/${race.id}`}
      className="card-editorial p-5 hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              Etapa {race.round}
            </span>
          </div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            {race.name}
          </h3>
        </div>
        <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} />
          <span>{race.circuit}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-warning">
            <Flag size={16} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vencedor</p>
            <p className="font-semibold text-foreground">{winner ? winner.driver : 'Sem dados'}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
