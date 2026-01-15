import { createContext, useContext, useState, ReactNode } from 'react';

type SeasonContextType = {
  season: number;
  setSeason: (season: number) => void;
};

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState(2025);

  return (
    <SeasonContext.Provider value={{ season, setSeason }}>
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx) {
    throw new Error('useSeason must be used inside SeasonProvider');
  }
  return ctx;
}
