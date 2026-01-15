# Backend (FastAPI + FastF1 + OpenF1)

Bridge service que expõe dados de Fórmula 1 já no formato esperado pelo frontend (`Driver`, `Race`, `SeasonOverview`). Os dados de classificação vêm do **FastF1** e são enriquecidos com cores/headshots do **OpenF1**.

## Requisitos

- Python 3.10+
- Cache local habilitado (já configurado para `.fastf1_cache`)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Executar

```bash
uvicorn main:app --reload --port 8000
```

Variáveis úteis:

- `FASTF1_CACHE_DIR`: caminho para o cache (padrão `.fastf1_cache`)
- `OPENF1_BASE_URL`: override do endpoint do OpenF1 (padrão `https://api.openf1.org/v1`)

## Endpoints

- `GET /api/drivers?season=2024` → lista de `Driver`
- `GET /api/races?season=2024&limit=10` → últimas corridas
- `GET /api/races/{race_id}?season=2024` → detalhe de uma corrida (mesmo `id` usado no frontend)
- `GET /api/overview?season=2024` → resumo da temporada
- `GET /healthz` → status

> Dica: a primeira carga da temporada pode ser lenta (FastF1 baixa e processa sessões). O cache acelera as próximas chamadas.
