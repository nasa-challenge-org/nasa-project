# LunarEdge API

FastAPI service. Scientific Horizons/LOLA adapters are stubs for Member 4.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
pytest
```

Production start (Render or similar):

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Health check path: `/api/v1/health`
