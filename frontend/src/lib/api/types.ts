export interface Driver {
  id: string;
  name: string;
  shortName: string;
  team: string;
  teamColor: string;
  country?: string;
  points: number;
  wins: number;
  podiums: number;
  avgPosition: number;
  consistency: number;
  trend: 'up' | 'down' | 'stable';
  pointsHistory: number[];
  lastRaces: number[];
  photo?: string;
}

export interface RaceResult {
  position: number;
  driverId: string;
  driver: string;
  team: string;
  gridPosition?: number;
  positionChange: number;
  points: number;
  avgLapTime?: string;
}

export interface Race {
  id: string;
  name: string;
  circuit: string;
  country?: string;
  date: string;
  round: number;
  results: RaceResult[];
  highlights: string[];
  fastestLap?: string;
}

export interface SeasonOverview {
  leader: Driver;
  highlights: string[];
  topMomentum: Driver;
  fallingDriver: Driver;
  dominantTeam: string;
  lastRace: Race;
}
