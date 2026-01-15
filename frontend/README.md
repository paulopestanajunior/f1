# GE F1 — Portal de Dados da Fórmula 1

Este projeto é um **portal de dados e análises da Fórmula 1**, inspirado em um estilo editorial semelhante ao jornalismo esportivo (ex.: GloboEsporte), com foco em **leitura de cenário, contexto e comparações**, e não em dados em tempo real.

O objetivo é oferecer uma interface clara e intuitiva para usuários que acompanham as corridas e querem **entender melhor o desempenho de pilotos, equipes e corridas**, a partir de dados históricos já disputados.

---

## 📐 Arquitetura do Projeto

O projeto é dividido em dois módulos principais:

```
frontend/   → Interface web (React + Vite)
backend/    → API de dados (FastAPI + FastF1 + OpenF1)
```

- O **frontend** consome dados via API REST.
- O **backend** faz ingestão, cache e agregação de dados públicos da F1.
- Não há dados em tempo real: as análises são baseadas em corridas já realizadas.

---

## 🖥️ Frontend

### Tecnologias utilizadas
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- React Query
- Recharts

### Estrutura principal
- `src/pages/` → páginas do portal (Panorama, Pilotos, Corridas, Comparações)
- `src/components/` → componentes reutilizáveis (cards, tabelas, gráficos)
- `src/lib/api/` → client HTTP e hooks de dados
- `src/lib/mockData.ts` → dados mock (fallback)

---

## ⚙️ Backend

### Tecnologias utilizadas
- FastAPI
- FastF1
- OpenF1 API
- Ergast-compatible API (fallback)
- Pydantic
- HTTPX

O backend expõe endpoints REST que fornecem:
- Panorama da temporada
- Lista de pilotos
- Lista de corridas
- Detalhes de uma corrida específica

Os dados são processados e **cacheados** para evitar downloads repetidos.

---

## 🚀 Como rodar o projeto localmente

### 1️⃣ Rodar o backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Endpoints principais:
- `GET /api/overview`
- `GET /api/drivers`
- `GET /api/races`
- `GET /api/races/{race_id}`
- `GET /healthz`

#### Variáveis de ambiente úteis
- `FASTF1_CACHE_DIR`: diretório do cache do FastF1 (padrão `.fastf1_cache`)
- `OPENF1_BASE_URL`: endpoint do OpenF1 (padrão `https://api.openf1.org/v1`)

---

### 2️⃣ Rodar o frontend

```bash
cd frontend
npm install
```

Crie um arquivo `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Depois inicie o servidor:

```bash
npm run dev
```

O frontend ficará disponível em:
```
http://localhost:5173
```

O frontend fará requisições para:
```
http://localhost:8000/api/...
```

---

## 📊 Funcionalidades principais

- **Panorama da temporada**
- **Pilotos**
- **Corridas**
- **Comparações**

---

## 📌 Observações importantes

- O projeto **não utiliza dados em tempo real**
- As análises são baseadas em corridas já disputadas
- Foco em **contexto e leitura de cenário**
- Ideal para projetos acadêmicos, MVPs e portfólio

---

## 📄 Licença

Projeto educacional e experimental.
Dados provenientes de APIs públicas de Fórmula 1.
