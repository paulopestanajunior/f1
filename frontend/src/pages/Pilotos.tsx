console.log("RENDER => Pilotos");

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DriverCard } from '@/components/cards/DriverCard';
import { useDrivers } from '@/lib/api/hooks';
import { useSeason } from '@/lib/season-context';

import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Pilotos() {
  const { season } = useSeason();

  const [searchTerm, setSearchTerm] = useState('');
  const { data: driverData, isLoading } = useDrivers();
  const driverList = driverData || [];

  const filteredDrivers = driverList.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Pilotos</h1>
          <p className="text-muted-foreground">
            Entenda quem está bem e quem não está na temporada {season}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Buscar piloto ou equipe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-editorial p-4 text-center">
            <p className="text-2xl font-bold text-primary">{driverList.length}</p>
            <p className="text-sm text-muted-foreground">Pilotos</p>
          </div>
          <div className="card-editorial p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {driverList.filter(d => d.trend === 'up').length}
            </p>
            <p className="text-sm text-muted-foreground">Em alta</p>
          </div>
          <div className="card-editorial p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {driverList.filter(d => d.trend === 'stable').length}
            </p>
            <p className="text-sm text-muted-foreground">Estáveis</p>
          </div>
          <div className="card-editorial p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {driverList.filter(d => d.trend === 'down').length}
            </p>
            <p className="text-sm text-muted-foreground">Em queda</p>
          </div>
        </div>

        {/* Drivers Grid */}
        {isLoading ? (
          <div className="card-editorial p-12 text-center text-muted-foreground">
            Carregando pilotos...
          </div>
        ) : filteredDrivers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDrivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        ) : (
          <div className="card-editorial p-12 text-center">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum piloto encontrado</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
