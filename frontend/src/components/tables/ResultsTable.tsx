import { RaceResult } from '@/lib/api/types';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ResultsTableProps {
  results: RaceResult[];
  showAllColumns?: boolean;
}

export function ResultsTable({ results, showAllColumns = true }: ResultsTableProps) {
  const getPositionChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp size={14} className="text-success" />;
    if (change < 0) return <ArrowDown size={14} className="text-danger" />;
    return <Minus size={14} className="text-muted-foreground" />;
  };

  const getPositionChangeText = (change: number) => {
    if (change > 0) return `+${change}`;
    if (change < 0) return change.toString();
    return '–';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="table-f1">
        <thead>
          <tr>
            <th className="w-16">Pos</th>
            <th>Piloto</th>
            <th className="hidden sm:table-cell">Equipe</th>
            {showAllColumns && (
              <>
                <th className="w-20 text-center">Grid</th>
                <th className="w-24 text-center">+/-</th>
              </>
            )}
            <th className="w-20 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.position}>
              <td>
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  result.position === 1 ? 'bg-warning text-warning-foreground' :
                  result.position === 2 ? 'bg-secondary text-secondary-foreground' :
                  result.position === 3 ? 'bg-orange-200 text-orange-800' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {result.position}
                </span>
              </td>
              <td className="font-medium text-foreground">{result.driver}</td>
              <td className="hidden sm:table-cell text-muted-foreground">{result.team}</td>
              {showAllColumns && (
                <>
                  <td className="text-center text-muted-foreground">{result.gridPosition}º</td>
                  <td className="text-center">
                    <div className={`inline-flex items-center gap-1 font-medium ${
                      result.positionChange > 0 ? 'position-gain' :
                      result.positionChange < 0 ? 'position-loss' : 'text-muted-foreground'
                    }`}>
                      {getPositionChangeIcon(result.positionChange)}
                      <span>{getPositionChangeText(result.positionChange)}</span>
                    </div>
                  </td>
                </>
              )}
              <td className="text-right font-semibold text-primary">{result.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
