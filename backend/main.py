import os
import pathlib
from collections import Counter, defaultdict
from typing import Any, Dict, List, Optional

import fastf1
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils.cache import get_or_set_cache


# Enable FastF1 cache to avoid re-downloading the same sessions
cache_dir = pathlib.Path(os.getenv("FASTF1_CACHE_DIR", ".fastf1_cache"))
cache_dir.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(cache_dir))

OPENF1_BASE_URL = os.getenv("OPENF1_BASE_URL", "https://api.openf1.org/v1")


class RaceResult(BaseModel):
    position: int
    driverId: str
    driver: str
    team: str
    gridPosition: Optional[int] = None
    positionChange: int = 0
    points: float = 0
    avgLapTime: Optional[str] = None


class Race(BaseModel):
    id: str
    name: str
    circuit: str
    country: Optional[str]
    date: str
    round: int
    results: List[RaceResult]
    highlights: List[str] = []
    fastestLap: Optional[str] = None

class Driver(BaseModel):
    id: str
    name: str
    shortName: str
    team: str
    teamColor: str
    country: Optional[str]
    points: float
    wins: int
    podiums: int
    avgPosition: float
    consistency: float
    trend: str
    pointsHistory: List[float]
    lastRaces: List[float]
    lastRacesRounds: List[int]
    photo: Optional[str] = None



class SeasonOverview(BaseModel):
    leader: Driver
    highlights: List[str]
    topMomentum: Driver
    fallingDriver: Driver
    dominantTeam: str
    lastRace: Race
    racesCount: int
    winnersCount: int
    podiumTeamsCount: int
    totalRoundsInSeason: int | None = None


app = FastAPI(title="F1 Data Bridge", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://f1-three-chi.vercel.app",

    ],
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def slugify(value: str) -> str:
    return (
        value.lower()
        .replace(" ", "-")
        .replace("'", "")
        .replace(".", "")
        .replace(",", "")
    )


def _safe_iso_date(date_value: Any) -> str:
    try:
        return date_value.isoformat()
    except AttributeError:
        return str(date_value)


def _safe_int(value: Any, default: int = 0) -> int:
    """Convert to int, handling None/NaN/float('nan')."""
    try:
        if value is None:
            return default
        if isinstance(value, float) and (value != value):  # NaN check
            return default
        return int(value)
    except (TypeError, ValueError):
        return default
    
def _normalize_hex_color(value: Any, default: str = "#71717a") -> str:
    if not value:
        return default
    s = str(value).strip()
    if not s:
        return default
    if not s.startswith("#"):
        s = f"#{s}"
    return s



def _safe_float(value: Any, default: float = 0.0) -> float:
    """Convert to float, handling None/NaN/float('nan')."""
    try:
        if value is None:
            return default
        if isinstance(value, float) and (value != value):  # NaN
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _fetch_ergast_results(season: int) -> List[Dict[str, Any]]:
    """Fetch full season results from Ergast API."""
    # Use HTTPS to avoid 403 blocks
    url = f"https://api.jolpi.ca/ergast/f1/{season}/results.json"

    params = {"limit": 1200}
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        return data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
    except Exception as exc:  # pragma: no cover - defensive
        print(f"[ergast] Failed to fetch results for {season}: {exc}")
        return []

def _fetch_ergast_round(season: int, round_number: int) -> Optional[Dict[str, Any]]:
    url = f"https://api.jolpi.ca/ergast/f1/{season}/{round_number}/results.json"
    params = {"limit": 500}
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        return races[0] if races else None
    except Exception as exc:
        print(f"[ergast] Failed round {season} r{round_number}: {exc}")
        return None


def _fetch_ergast_results_full(season: int) -> List[Dict[str, Any]]:
    # pega lista de corridas do ano (rodadas)
    url = f"https://api.jolpi.ca/ergast/f1/{season}.json"
    params = {"limit": 100}
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        rounds = sorted({_safe_int(r.get("round"), 0) for r in races if r.get("round")},)
        rounds = [r for r in rounds if r > 0]
    except Exception as exc:
        print(f"[ergast] Failed schedule list {season}: {exc}")
        return []

    out: List[Dict[str, Any]] = []
    for rnd in rounds:
        race = _fetch_ergast_round(season, rnd)
        if race and race.get("Results"):
            out.append(race)
    return out

    
def _race_highlights(results: List[RaceResult], fastest_lap: Optional[str] = None) -> List[str]:
    if not results:
        return ["Sem resultados disponíveis para esta corrida."]

    winner = next((r for r in results if r.position == 1), results[0])
    highlights = [f"{winner.driver} venceu pela {winner.team}."]

    best = max(results, key=lambda r: (r.positionChange or 0))
    best_gain = best.positionChange or 0
    if best_gain > 0:
        highlights.append(f"{best.driver} foi o destaque em ultrapassagens: +{best_gain} posições.")
    else:
        highlights.append("Corrida de poucas mudanças no pelotão (baixo ganho de posições).")

    podium = [r.driver for r in results if r.position <= 3]
    if len(podium) == 3:
        highlights.append(f"Pódio: {podium[0]}, {podium[1]} e {podium[2]}.")

    if fastest_lap:
        highlights.append(f"Volta mais rápida: {fastest_lap}.")

    return highlights




def _build_snapshot_from_openf1_only(openf1_lookup: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Fallback when we have zero race data: build driver list only with OpenF1 metadata."""
    drivers: List[Driver] = []
    for num, meta in openf1_lookup.items():
        driver_id = (meta.get("name_acronym") or meta.get("broadcast_name") or num).lower()
        team_color = _normalize_hex_color(meta.get("team_colour"))

        drivers.append(
            Driver(
                id=driver_id,
                name=meta.get("full_name") or meta.get("broadcast_name") or driver_id.upper(),
                shortName=meta.get("name_acronym") or driver_id.upper(),
                team=meta.get("team_name") or "Desconhecido",
                teamColor=team_color,
                country=meta.get("country_code"),
                points=0.0,
                wins=0,
                podiums=0,
                avgPosition=0.0,
                consistency=0.0,
                trend="stable",
                pointsHistory=[],
                lastRaces=[],
                photo=meta.get("headshot_url"),
            )
        )

    drivers_sorted = sorted(drivers, key=lambda d: d.name)
    dummy_race = Race(
        id="no-data",
        name="Dados indisponíveis",
        circuit="",
        country="",
        date="",
        round=0,
        results=[],
        highlights=["Sem resultados disponíveis no momento."],
        fastestLap=None,
    )

    return {
        "drivers": drivers_sorted,
        "races": [],
        "dominant_team": "N/A",
        "overview_dummy_race": dummy_race,
    }


def _fetch_openf1_drivers() -> Dict[str, Dict[str, Any]]:
    """Return latest OpenF1 driver metadata keyed by driver_number."""
    with httpx.Client(timeout=20.0) as client:
        resp = client.get(f"{OPENF1_BASE_URL}/drivers")
        resp.raise_for_status()
        data = resp.json()

    latest: Dict[str, Dict[str, Any]] = {}
    for entry in data:
        num = entry.get("driver_number")
        if num is None:
            continue
        num = str(num)
        existing = latest.get(num)
        if not existing or entry.get("session_key", 0) > existing.get("session_key", 0):
            latest[num] = entry
    return latest


def _build_snapshot_from_ergast(season: int, openf1_lookup: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    races: List[Race] = []
    driver_stats: Dict[str, Dict[str, Any]] = defaultdict(
        lambda: {
            "points": 0.0,
            "wins": 0,
            "podiums": 0,
            "positions": [],
            "points_by_round": {},
            "team": None,
            "teamColor": "#71717a",
            "country": None,
            "name": None,
            "shortName": None,
            "photo": None,
            "driver_number": None,
        }
    )
    team_points: Counter[str] = Counter()

    ergast_races = _fetch_ergast_results_full(season)

    for race_data in ergast_races:
        round_number = _safe_int(race_data.get("round"), 0)
        event_name = race_data.get("raceName") or "Corrida"
        circuit = race_data.get("Circuit", {}).get("circuitName", "Circuito")
        country = race_data.get("Circuit", {}).get("Location", {}).get("country")
        date = race_data.get("date") or ""
        results_list: List[RaceResult] = []

        for res in race_data.get("Results", []):
            pos = _safe_int(res.get("position"), 0)
            if pos <= 0:
                continue
            driver_info = res.get("Driver", {}) or {}
            constructor = res.get("Constructor", {}) or {}
            driver_id = (driver_info.get("code") or driver_info.get("driverId") or "").lower()
            driver_number = driver_info.get("permanentNumber")
            team_color = openf1_lookup.get(str(driver_number), {}).get("team_colour") if driver_number else None

            points = _safe_float(res.get("points"), 0.0)
            grid = _safe_int(res.get("grid"), None)
            position_change = grid - pos if grid is not None else 0
            fastest_lap = None
            fastest = res.get("FastestLap")
            if fastest:
                time_data = fastest.get("Time")
                if time_data:
                    fastest_lap = time_data.get("time")

            rr = RaceResult(
                position=pos,
                driverId=driver_id,
                driver=f"{driver_info.get('givenName', '')} {driver_info.get('familyName', '')}".strip() or driver_info.get("driverId", ""),
                team=constructor.get("name") or "Desconhecido",
                gridPosition=grid,
                positionChange=position_change,
                points=points,
                avgLapTime=fastest_lap,
            )
            results_list.append(rr)

            stats = driver_stats[driver_id]
            stats["points"] += points
            stats["wins"] += 1 if pos == 1 else 0
            stats["podiums"] += 1 if pos <= 3 else 0
            stats["positions"].append(pos)
            stats["points_by_round"][round_number] = points
            stats["team"] = rr.team
            if team_color:
                stats["teamColor"] = team_color
            stats["driver_number"] = driver_number or stats["driver_number"]
            stats["name"] = stats["name"] or rr.driver
            stats["shortName"] = stats["shortName"] or driver_info.get("code") or driver_info.get("driverId")
            open_meta = openf1_lookup.get(str(driver_number)) if driver_number else None
            if open_meta:
                stats["teamColor"] = open_meta.get("team_colour") or stats["teamColor"]
                stats["country"] = open_meta.get("country_code") or stats["country"]
                stats["photo"] = open_meta.get("headshot_url") or stats["photo"]

                # só preenche se ainda não tiver
                if not stats["name"]:
                    stats["name"] = open_meta.get("full_name")
                if not stats["shortName"]:
                    stats["shortName"] = open_meta.get("name_acronym")


            team_points[rr.team] += points

        if results_list:
            results_sorted = sorted(results_list, key=lambda r: r.position)
            fastest = min(
                (r for r in results_sorted if r.avgLapTime),
                key=lambda r: r.avgLapTime,
                default=None,
            )
            fastest_lap_str = f"{fastest.driver} - {fastest.avgLapTime}" if fastest else None
            races.append(
                Race(
                    id=f"{season}-{round_number:02d}-{slugify(event_name)}",
                    name=event_name,
                    circuit=circuit,
                    country=country,
                    date=date,
                    round=round_number,
                    results=results_sorted,
                    highlights=_race_highlights(results_sorted, fastest_lap_str),
                    fastestLap=fastest_lap_str,
                )
            )

    drivers: List[Driver] = []
    for driver_id, stats in driver_stats.items():
        positions = stats["positions"]
        avg_pos = sum(positions) / len(positions) if positions else 0
        top10 = len([p for p in positions if p <= 10]) if positions else 0
        consistency = round((top10 / len(positions)) * 100) if positions else 0
        team_color = _normalize_hex_color(stats["teamColor"])

        ordered = sorted(stats["points_by_round"].items())  # [(round, points), ...]
        points_history = [pts for _, pts in ordered]

        last8 = ordered[-8:]
        last_races = [pts for _, pts in last8]
        last_rounds = [rnd for rnd, _ in last8]

        drivers.append(
            Driver(
                id=driver_id,
                name=stats["name"] or driver_id.upper(),
                shortName=stats["shortName"] or driver_id.upper(),
                team=stats["team"] or "Desconhecido",
                teamColor=team_color,
                country=stats["country"],
                points=round(stats["points"], 1),
                wins=stats["wins"],
                podiums=stats["podiums"],
                avgPosition=round(avg_pos, 2),
                consistency=consistency,
                trend=_trend_from_points(points_history),
                pointsHistory=points_history,
                lastRaces=last_races,
                lastRacesRounds=last_rounds,
                photo=stats["photo"],
            )
        )


    drivers_sorted = sorted(drivers, key=lambda d: d.points, reverse=True)
    races_sorted = sorted(races, key=lambda r: r.round)
    dominant_team = team_points.most_common(1)[0][0] if team_points else "N/A"

    return {
        "drivers": drivers_sorted,
        "races": races_sorted,
        "dominant_team": dominant_team,
    }


def _build_race_result(row: Dict[str, Any], openf1_lookup: Dict[str, Dict[str, Any]]) -> RaceResult:
    driver_number = row.get("DriverNumber")
    if driver_number is None:
        # Without driver number we can't reconcile colors/metadata; skip
        raise ValueError("Missing driver_number")
    team_color = row.get("TeamColor")
    open_meta = openf1_lookup.get(str(driver_number)) if driver_number is not None else None

    team_color = _normalize_hex_color(
        open_meta.get("team_colour") if open_meta else None,
        default=_normalize_hex_color(team_color),
    )



    grid_pos = row.get("GridPosition")
    position = _safe_int(row.get("Position"), default=0)
    if position <= 0:
        # No valid classification for this driver; skip
        raise ValueError("Invalid position")
    grid_position = _safe_int(grid_pos, default=None) if grid_pos is not None else None
    points = _safe_float(row.get("Points"), default=0.0)
    # If no points were returned, approximate by FIA points table for top 10
    if points == 0 and position <= 10:
        FIA_POINTS = {1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1}
        points = FIA_POINTS.get(position, 0)
    fastest_lap = row.get("FastestLapTime")
    if isinstance(fastest_lap, float) and fastest_lap != fastest_lap:  # NaN
        fastest_lap = None
    position_change = 0
    if grid_position is not None:
        position_change = grid_position - position

    return RaceResult(
        position=position,
        driverId=(row.get("Abbreviation") or str(driver_number) or "").lower(),
        driver=row.get("FullName") or row.get("BroadcastName") or f"Driver {driver_number}",
        team=row.get("TeamName") or "Desconhecido",
        gridPosition=grid_position,
        positionChange=position_change,
        points=points,
        avgLapTime=fastest_lap,
    )


def _trend_from_points(points_history: List[float]) -> str:
    if len(points_history) < 3:
        return "stable"
    recent = sum(points_history[-3:]) / 3
    season_avg = sum(points_history) / len(points_history)
    if recent - season_avg > 2:
        return "up"
    if season_avg - recent > 2:
        return "down"
    return "stable"

def _hydrate_snapshot(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    # drivers
    snapshot["drivers"] = [Driver(**d) if isinstance(d, dict) else d for d in snapshot.get("drivers", [])]
    # races
    snapshot["races"] = [Race(**r) if isinstance(r, dict) else r for r in snapshot.get("races", [])]
    return snapshot

def _season_snapshot(season: int) -> Dict[str, Any]:
    snap = get_or_set_cache(
        key=f"season_{season}",
        builder_fn=lambda: _season_snapshot_compute(season),
    )
    return _hydrate_snapshot(snap)

def _season_snapshot_compute(season: int) -> Dict[str, Any]:
    """
    Pre-compute season data (drivers + races) to serve to the frontend.
    This runs in a threadpool when called by FastAPI (sync route).
    """
    openf1_lookup = _fetch_openf1_drivers()
    schedule = fastf1.get_event_schedule(season, include_testing=False)

    races: List[Race] = []

    driver_stats: Dict[str, Dict[str, Any]] = defaultdict(
        lambda: {
            "points": 0.0,
            "wins": 0,
            "podiums": 0,
            "positions": [],
            "points_by_round": {},  # round_number -> points
            "team": None,
            "teamColor": "#71717a",
            "country": None,
            "name": None,
            "shortName": None,
            "photo": None,
            "driver_number": None,
        }
    )

    team_points: Counter[str] = Counter()

    for _, event in schedule.iterrows():
        round_number = _safe_int(event.get("RoundNumber"), 0)
        if round_number <= 0:
            continue

        event_name = event.get("EventName") or event.get("OfficialEventName") or "Corrida"
        country = event.get("Country")
        circuit = event.get("Location") or event.get("Circuit", "Circuito")
        date = _safe_iso_date(event.get("EventDate"))

        try:
            session = fastf1.get_session(season, round_number, "R")
            session.load(laps=False, telemetry=False)
            classification = session.results.to_dict(orient="records")
        except Exception as exc:
            print(f"[fastf1] round {round_number} failed: {exc}")
            continue

        results: List[RaceResult] = []

        for row in classification:
            try:
                result = _build_race_result(row, openf1_lookup)
            except ValueError:
                continue

            results.append(result)

            driver_id = result.driverId
            stats = driver_stats[driver_id]

            # --------- dados base ----------
            points = _safe_float(result.points, 0.0)

            stats["points"] += points
            stats["wins"] += 1 if result.position == 1 else 0
            stats["podiums"] += 1 if result.position <= 3 else 0
            stats["positions"].append(result.position)

            # round -> points (serve para pointsHistory/lastRaces corretos)
            stats["points_by_round"][round_number] = points

            stats["team"] = result.team
            stats["driver_number"] = row.get("DriverNumber") or stats["driver_number"]
            stats["name"] = row.get("FullName") or stats["name"]
            stats["shortName"] = row.get("Abbreviation") or row.get("BroadcastName") or stats["shortName"]

            team_points[result.team] += points

            # --------- enriquecimento (OpenF1) ----------
            driver_number = stats["driver_number"]
            open_meta = openf1_lookup.get(str(driver_number)) if driver_number else None

            if open_meta:
                stats["teamColor"] = _normalize_hex_color(
                    open_meta.get("team_colour"),
                    default=stats["teamColor"],
                )
                stats["country"] = open_meta.get("country_code") or stats["country"]
                stats["photo"] = open_meta.get("headshot_url") or stats["photo"]
                stats["name"] = open_meta.get("full_name") or stats["name"]
                stats["shortName"] = open_meta.get("name_acronym") or stats["shortName"]

        if not results:
            continue

        results_sorted = sorted(results, key=lambda r: r.position)

        fastest = min(
            (r for r in results_sorted if r.avgLapTime),
            key=lambda r: r.avgLapTime,
            default=None,
        )
        fastest_str = f"{fastest.driver} - {fastest.avgLapTime}" if fastest else None

        races.append(
            Race(
                id=f"{season}-{round_number:02d}-{slugify(event_name)}",
                name=event_name,
                circuit=circuit,
                country=country,
                date=date,
                round=round_number,
                results=results_sorted,
                highlights=_race_highlights(results_sorted, fastest_str),
                fastestLap=fastest_str,
            )
        )

    # --------- fallback ----------
    if not races:
        print(f"[snapshot] FastF1 não retornou corridas para {season}. Tentando Ergast...")

        ergast_snapshot = _build_snapshot_from_ergast(season, openf1_lookup)
        if ergast_snapshot.get("races"):
            print(f"[snapshot] Ergast retornou {len(ergast_snapshot['races'])} corridas para {season}.")
            return ergast_snapshot

        print(f"[snapshot] Ergast falhou/sem corridas. Usando OpenF1 (metadados apenas).")
        return _build_snapshot_from_openf1_only(openf1_lookup)

    # --------- build drivers ----------
    drivers: List[Driver] = []

    for driver_id, stats in driver_stats.items():
        positions = stats["positions"]
        avg_position = (sum(positions) / len(positions)) if positions else 0.0

        finishes = len([p for p in positions if p is not None])
        consistency = 0
        if finishes:
            top10 = len([p for p in positions if p and p <= 10])
            consistency = round((top10 / finishes) * 100)

        # pointsHistory (ordenado por round)
        ordered = sorted(stats["points_by_round"].items())  # [(round, points), ...]
        points_history = [pts for _, pts in ordered]

        last8 = ordered[-8:]
        last_races = [pts for _, pts in last8]
        last_rounds = [rnd for rnd, _ in last8]

        team_color = _normalize_hex_color(stats["teamColor"])

        # proteção extra: se vier algo estranho
        if not team_color or ":" in str(team_color):
            open_meta = openf1_lookup.get(str(stats["driver_number"] or ""))
            team_color = _normalize_hex_color(open_meta.get("team_colour") if open_meta else None)

        drivers.append(
            Driver(
                id=driver_id,
                name=stats["name"] or driver_id.upper(),
                shortName=stats["shortName"] or driver_id.upper(),
                team=stats["team"] or "Desconhecido",
                teamColor=team_color,
                country=stats["country"],
                points=round(_safe_float(stats["points"], 0.0), 1),
                wins=stats["wins"],
                podiums=stats["podiums"],
                avgPosition=round(avg_position, 2),
                consistency=consistency,
                trend=_trend_from_points(points_history),
                pointsHistory=points_history,
                lastRaces=last_races,
                lastRacesRounds=last_rounds,
                photo=stats["photo"],
            )
        )

    drivers_sorted = sorted(drivers, key=lambda d: d.points, reverse=True)
    races_sorted = sorted(races, key=lambda r: r.round)

    dominant_team = team_points.most_common(1)[0][0] if team_points else "N/A"

    return {
        "drivers": drivers_sorted,
        "races": races_sorted,
        "dominant_team": dominant_team,
    }


def _build_overview(snapshot: Dict[str, Any], season: int) -> SeasonOverview:
    drivers: List[Driver] = snapshot.get("drivers", [])
    races: List[Race] = snapshot.get("races", [])
    dominant_team: str = snapshot.get("dominant_team", "N/A")

    if not drivers:
        raise HTTPException(status_code=404, detail="Sem dados de temporada disponíveis.")

    # Se não tem corrida, tenta usar dummy (se existir)
    if not races and snapshot.get("overview_dummy_race"):
        races = [snapshot["overview_dummy_race"]]

    leader = drivers[0]
    last_race = races[-1]

    # ---------- STATS (somente corridas com resultado) ----------
    races_with_results = [r for r in races if getattr(r, "results", None)]
    races_count = len(races_with_results)

    winners: set[str] = set()
    podium_teams: set[str] = set()

    for r in races_with_results:
        # winner
        winner_row = next((x for x in r.results if x.position == 1), None)
        if winner_row:
            winners.add(winner_row.driverId)

        # podium teams
        for x in r.results:
            if x.position <= 3:
                podium_teams.add(x.team)

    winners_count = len(winners)
    podium_teams_count = len(podium_teams)

    # total "realizadas com resultado" (incremental/dinâmico)
    total_rounds_in_season = races_count

    # momentum
    def _recent_avg(d: Driver) -> float:
        recent = d.lastRaces[-3:] if d.lastRaces else []
        return (sum(recent) / len(recent)) if recent else 0.0

    top_momentum = max(drivers, key=_recent_avg)
    falling_driver = min(drivers, key=_recent_avg)

    highlights = [
        f"{leader.name} lidera o campeonato com {leader.points} pontos",
        f"{dominant_team} é a equipe com mais pontos somados",
        f"Última corrida: {last_race.name} (Etapa {last_race.round})",
    ]

    return SeasonOverview(
        season=season,

        leader=leader,
        highlights=highlights,
        topMomentum=top_momentum,
        fallingDriver=falling_driver,
        dominantTeam=dominant_team,
        lastRace=last_race,

        racesCount=races_count,
        winnersCount=winners_count,
        podiumTeamsCount=podium_teams_count,
        totalRoundsInSeason=total_rounds_in_season,
    )



@app.get("/api/drivers", response_model=List[Driver])
def get_drivers(season: int = Query(default=2024, ge=1950)) -> List[Driver]:
    snapshot = _season_snapshot(season)
    return snapshot["drivers"]


@app.get("/api/races", response_model=List[Race])
def get_races(
    season: int = Query(default=2024, ge=1950),
    limit: Optional[int] = Query(default=None, ge=1, le=24),
) -> List[Race]:
    snapshot = _season_snapshot(season)
    races: List[Race] = snapshot["races"]
    if limit is not None:
        return races[-limit:]
    return races


@app.get("/api/races/{race_id}", response_model=Race)
def get_race_detail(race_id: str, season: int = Query(default=2024, ge=1950)) -> Race:
    snapshot = _season_snapshot(season)
    for race in snapshot["races"]:
        if race.id == race_id:
            return race
    raise HTTPException(status_code=404, detail="Corrida não encontrada")


@app.get("/api/overview", response_model=SeasonOverview)
def get_overview(season: int = Query(default=2024, ge=1950)) -> SeasonOverview:
    snapshot = _season_snapshot(season)
    return _build_overview(snapshot, season)


@app.get("/healthz")
def healthcheck():
    return {"status": "ok"}

@app.get("/api/v1/overview", response_model=SeasonOverview)
def get_overview_v1(season: int = Query(default=2024, ge=1950)) -> SeasonOverview:
    return get_overview(season)


@app.get("/api/v1/drivers", response_model=List[Driver])
def get_drivers_v1(season: int = Query(default=2024, ge=1950)) -> List[Driver]:
    return get_drivers(season)

@app.get("/api/v1/races", response_model=List[Race])
def get_races_v1(
    season: int = Query(default=2024, ge=1950),
    limit: Optional[int] = Query(default=10, ge=1, le=24),
) -> List[Race]:
    return get_races(season, limit)

