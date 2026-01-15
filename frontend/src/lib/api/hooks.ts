import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Driver, Race, SeasonOverview } from "./types";
import { useSeason } from "@/lib/season-context";

/**
 * Pilotos da temporada
 */
export function useDrivers() {
  const { season } = useSeason();

  return useQuery<Driver[]>({
    queryKey: ["drivers", season],
    queryFn: () =>
      apiClient.getJson<Driver[]>("/drivers", { season }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Lista de corridas da temporada
 */
export function useRaces() {
  const { season } = useSeason();

  return useQuery<Race[]>({
    queryKey: ["races", season],
    queryFn: () =>
      apiClient.getJson<Race[]>("/races", { season }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Detalhe de uma corrida
 */
export function useRace(id?: string) {
  const { season } = useSeason();

  return useQuery<Race>({
    enabled: Boolean(id),
    queryKey: ["race", id, season],
    queryFn: () =>
      apiClient.getJson<Race>(`/races/${id}`, { season }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Panorama da temporada
 */
export function useSeasonOverview() {
  const { season } = useSeason();

  return useQuery<SeasonOverview>({
    queryKey: ["overview", season],
    queryFn: () =>
      apiClient.getJson<SeasonOverview>("/overview", { season }),
    staleTime: 5 * 60 * 1000,
  });
}
