// Mock data for F1 Portal - simulating API responses

export const seasons = [2025, 2024, 2023, 2022, 2021, 2020];

export interface Driver {
  id: string;
  name: string;
  shortName: string;
  team: string;
  teamColor: string;
  country: string;
  points: number;
  wins: number;
  podiums: number;
  avgPosition: number;
  consistency: number;
  trend: 'up' | 'down' | 'stable';
  lastRaces: number[];
  photo?: string;
}

export interface Race {
  id: string;
  name: string;
  circuit: string;
  country: string;
  date: string;
  round: number;
  results: RaceResult[];
  highlights: string[];
  fastestLap: string;
}

export interface RaceResult {
  position: number;
  driverId: string;
  driver: string;
  team: string;
  gridPosition: number;
  positionChange: number;
  points: number;
  avgLapTime?: string;
}

export interface SeasonOverview {
  leader: Driver;
  highlights: string[];
  topMomentum: Driver;
  fallingDriver: Driver;
  dominantTeam: string;
  lastRace: Race;
}

export const drivers: Driver[] = [
  {
    id: 'verstappen',
    name: 'Max Verstappen',
    shortName: 'VER',
    team: 'Red Bull Racing',
    teamColor: '#1E41FF',
    country: 'Holanda',
    points: 393,
    wins: 8,
    podiums: 14,
    avgPosition: 1.8,
    consistency: 94,
    trend: 'stable',
    lastRaces: [25, 25, 18, 25, 25, 18, 25, 25],
  },
  {
    id: 'norris',
    name: 'Lando Norris',
    shortName: 'NOR',
    team: 'McLaren',
    teamColor: '#FF8000',
    country: 'Reino Unido',
    points: 331,
    wins: 3,
    podiums: 12,
    avgPosition: 2.9,
    consistency: 88,
    trend: 'up',
    lastRaces: [18, 25, 25, 15, 18, 25, 18, 12],
  },
  {
    id: 'leclerc',
    name: 'Charles Leclerc',
    shortName: 'LEC',
    team: 'Ferrari',
    teamColor: '#DC0000',
    country: 'Mônaco',
    points: 307,
    wins: 3,
    podiums: 10,
    avgPosition: 3.2,
    consistency: 82,
    trend: 'stable',
    lastRaces: [15, 18, 12, 25, 15, 12, 25, 18],
  },
  {
    id: 'piastri',
    name: 'Oscar Piastri',
    shortName: 'PIA',
    team: 'McLaren',
    teamColor: '#FF8000',
    country: 'Austrália',
    points: 262,
    wins: 2,
    podiums: 8,
    avgPosition: 4.1,
    consistency: 79,
    trend: 'up',
    lastRaces: [12, 15, 18, 12, 25, 15, 12, 25],
  },
  {
    id: 'sainz',
    name: 'Carlos Sainz',
    shortName: 'SAI',
    team: 'Ferrari',
    teamColor: '#DC0000',
    country: 'Espanha',
    points: 244,
    wins: 2,
    podiums: 8,
    avgPosition: 4.3,
    consistency: 76,
    trend: 'stable',
    lastRaces: [10, 12, 15, 18, 12, 18, 10, 15],
  },
  {
    id: 'hamilton',
    name: 'Lewis Hamilton',
    shortName: 'HAM',
    team: 'Mercedes',
    teamColor: '#00D2BE',
    country: 'Reino Unido',
    points: 211,
    wins: 2,
    podiums: 6,
    avgPosition: 5.2,
    consistency: 72,
    trend: 'up',
    lastRaces: [8, 25, 18, 12, 10, 8, 25, 15],
  },
  {
    id: 'russell',
    name: 'George Russell',
    shortName: 'RUS',
    team: 'Mercedes',
    teamColor: '#00D2BE',
    country: 'Reino Unido',
    points: 192,
    wins: 1,
    podiums: 5,
    avgPosition: 5.8,
    consistency: 68,
    trend: 'down',
    lastRaces: [15, 10, 8, 10, 15, 10, 12, 8],
  },
  {
    id: 'perez',
    name: 'Sergio Pérez',
    shortName: 'PER',
    team: 'Red Bull Racing',
    teamColor: '#1E41FF',
    country: 'México',
    points: 151,
    wins: 0,
    podiums: 3,
    avgPosition: 7.2,
    consistency: 52,
    trend: 'down',
    lastRaces: [6, 8, 4, 10, 0, 8, 6, 10],
  },
];

export const races: Race[] = [
  {
    id: 'qatar-2024',
    name: 'GP do Qatar',
    circuit: 'Lusail International Circuit',
    country: 'Qatar',
    date: '2024-12-01',
    round: 23,
    highlights: [
      'Verstappen dominou do início ao fim',
      'McLaren garantiu o título de construtores',
      'Pérez fez boa recuperação após largada ruim',
    ],
    fastestLap: 'Max Verstappen - 1:24.319',
    results: [
      { position: 1, driverId: 'verstappen', driver: 'Max Verstappen', team: 'Red Bull Racing', gridPosition: 1, positionChange: 0, points: 25 },
      { position: 2, driverId: 'norris', driver: 'Lando Norris', team: 'McLaren', gridPosition: 2, positionChange: 0, points: 18 },
      { position: 3, driverId: 'piastri', driver: 'Oscar Piastri', team: 'McLaren', gridPosition: 4, positionChange: 1, points: 15 },
      { position: 4, driverId: 'leclerc', driver: 'Charles Leclerc', team: 'Ferrari', gridPosition: 3, positionChange: -1, points: 12 },
      { position: 5, driverId: 'hamilton', driver: 'Lewis Hamilton', team: 'Mercedes', gridPosition: 7, positionChange: 2, points: 10 },
    ],
  },
  {
    id: 'las-vegas-2024',
    name: 'GP de Las Vegas',
    circuit: 'Las Vegas Street Circuit',
    country: 'EUA',
    date: '2024-11-23',
    round: 22,
    highlights: [
      'Russell venceu em noite histórica',
      'Hamilton completou dobradinha da Mercedes',
      'Verstappen garantiu o tetracampeonato',
    ],
    fastestLap: 'Lewis Hamilton - 1:35.490',
    results: [
      { position: 1, driverId: 'russell', driver: 'George Russell', team: 'Mercedes', gridPosition: 1, positionChange: 0, points: 25 },
      { position: 2, driverId: 'hamilton', driver: 'Lewis Hamilton', team: 'Mercedes', gridPosition: 6, positionChange: 4, points: 18 },
      { position: 3, driverId: 'sainz', driver: 'Carlos Sainz', team: 'Ferrari', gridPosition: 3, positionChange: 0, points: 15 },
      { position: 4, driverId: 'leclerc', driver: 'Charles Leclerc', team: 'Ferrari', gridPosition: 2, positionChange: -2, points: 12 },
      { position: 5, driverId: 'verstappen', driver: 'Max Verstappen', team: 'Red Bull Racing', gridPosition: 5, positionChange: 0, points: 10 },
    ],
  },
  {
    id: 'brazil-2024',
    name: 'GP do Brasil',
    circuit: 'Autódromo José Carlos Pace',
    country: 'Brasil',
    date: '2024-11-03',
    round: 21,
    highlights: [
      'Verstappen venceu corrida caótica com chuva',
      'Norris perdeu chance de reduzir diferença',
      'Muitas bandeiras vermelhas e Safety Cars',
    ],
    fastestLap: 'Max Verstappen - 1:15.279',
    results: [
      { position: 1, driverId: 'verstappen', driver: 'Max Verstappen', team: 'Red Bull Racing', gridPosition: 17, positionChange: 16, points: 25 },
      { position: 2, driverId: 'leclerc', driver: 'Charles Leclerc', team: 'Ferrari', gridPosition: 5, positionChange: 3, points: 18 },
      { position: 3, driverId: 'norris', driver: 'Lando Norris', team: 'McLaren', gridPosition: 1, positionChange: -2, points: 15 },
      { position: 4, driverId: 'piastri', driver: 'Oscar Piastri', team: 'McLaren', gridPosition: 3, positionChange: -1, points: 12 },
      { position: 5, driverId: 'russell', driver: 'George Russell', team: 'Mercedes', gridPosition: 6, positionChange: 1, points: 10 },
    ],
  },
  {
    id: 'mexico-2024',
    name: 'GP do México',
    circuit: 'Autódromo Hermanos Rodríguez',
    country: 'México',
    date: '2024-10-27',
    round: 20,
    highlights: [
      'Sainz venceu em grande corrida',
      'Verstappen e Norris tiveram incidentes',
      'Pérez decepcionou a torcida local',
    ],
    fastestLap: 'Carlos Sainz - 1:18.632',
    results: [
      { position: 1, driverId: 'sainz', driver: 'Carlos Sainz', team: 'Ferrari', gridPosition: 1, positionChange: 0, points: 25 },
      { position: 2, driverId: 'norris', driver: 'Lando Norris', team: 'McLaren', gridPosition: 3, positionChange: 1, points: 18 },
      { position: 3, driverId: 'leclerc', driver: 'Charles Leclerc', team: 'Ferrari', gridPosition: 2, positionChange: -1, points: 15 },
      { position: 4, driverId: 'hamilton', driver: 'Lewis Hamilton', team: 'Mercedes', gridPosition: 4, positionChange: 0, points: 12 },
      { position: 5, driverId: 'verstappen', driver: 'Max Verstappen', team: 'Red Bull Racing', gridPosition: 5, positionChange: 0, points: 10 },
    ],
  },
];

export const getSeasonOverview = (): SeasonOverview => ({
  leader: drivers[0],
  highlights: [
    'Verstappen campeão com 3 corridas de antecedência',
    'McLaren conquista título de construtores após 26 anos',
    'Ferrari em ascensão na reta final',
    'Mercedes mostra recuperação consistente',
  ],
  topMomentum: drivers[1], // Norris
  fallingDriver: drivers[7], // Perez
  dominantTeam: 'McLaren',
  lastRace: races[0],
});

export const getDriverById = (id: string): Driver | undefined => 
  drivers.find(d => d.id === id);

export const getRaceById = (id: string): Race | undefined => 
  races.find(r => r.id === id);
