# Weathex

A full-stack weather dashboard built for the PM Accelerator AI Engineer Intern technical assessment. Weathex lets users look up current conditions and a 7-day forecast for any location (city, zip/postal code, landmark, or GPS coordinates), save weather lookups for a date range, and export saved records to JSON, CSV, XML, Markdown, or PDF.

Built by **Waqas Ahmad**.

**Live demo:** https://waqas392.github.io/weathex-app/

**Test account:**
- Email: `assessment1@gmail.com`
- Password: `Admin123`

## What this covers

- **Tech Assessment #1 (Frontend):** location search (city/zip/landmark/coordinates), current-location lookup via geolocation, current conditions with icons, hourly and 7-day forecast, air quality index, responsive layout (Tailwind breakpoints), graceful error handling (location not found, API failures).
- **Tech Assessment #2 (Backend):** full CRUD on saved weather records (create/read/update/delete), date-range validation, location validation with fuzzy fallback, export to JSON/CSV/XML/Markdown/PDF, plus extra API integrations (OpenStreetMap embed for location maps, Open-Meteo Air Quality API) and JWT-based auth so records are scoped per user.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** FastAPI, SQLAlchemy, SQLite, Pydantic
- **APIs:** Open-Meteo (weather, geocoding, air quality), Nominatim/OpenStreetMap (fallback geocoding for zip codes/addresses/landmarks, and the embedded map)

## Project structure

```
weathex-app/
├── backend/
│   ├── main.py                # FastAPI app, router registration, CORS
│   ├── models.py              # SQLAlchemy models (User, WeatherRecord)
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── database.py            # SQLite engine/session setup
│   ├── auth_utils.py          # Password hashing, JWT issuing/verification
│   ├── requirements.txt
│   ├── routers/
│   │   ├── weather.py         # /api/weather - current, forecast, air quality, search
│   │   ├── history.py         # /api/history - CRUD for saved records
│   │   ├── export.py          # /api/export - JSON/CSV/XML/MD/PDF export
│   │   └── auth.py            # /api/auth - register, login, me
│   └── services/
│       ├── weather_service.py     # Open-Meteo + Nominatim integration, weather code mapping
│       ├── history_service.py     # CRUD business logic
│       └── export_service.py      # format conversion for each export type
└── frontend/
    ├── src/
    │   ├── components/        # CurrentWeather, DailyForecast, AirQuality, LocationMap, etc.
    │   ├── context/           # WeatherContext, AuthContext
    │   ├── pages/              # TodayPage, HistoryPage, AddHistoryPage, EditHistoryPage, ExportPage, AirQualityPage
    │   └── services/api.js    # Axios client
    └── package.json
```

## Running it locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs on `http://localhost:8000`. Interactive docs are available at `http://localhost:8000/docs`. On first run, SQLAlchemy creates `weathex.db` (SQLite) automatically — no manual DB setup needed.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:8000` (see `vite.config.js`).

No API keys are required — Open-Meteo and Nominatim are both free, keyless APIs.

## Key features

- **Location search:** accepts city names, zip/postal codes, landmarks, and GPS coordinates. City-name lookups go through Open-Meteo's geocoder first; anything it can't resolve (zip codes, addresses, landmarks) falls back to Nominatim (OpenStreetMap).
- **Current location:** uses the browser's Geolocation API to fetch weather for wherever the user is.
- **7-day forecast + hourly breakdown**, plus a live Air Quality Index panel.
- **Saved records (CRUD):** signed-in users can save a location + date range, view saved records, edit them (which re-fetches weather data if the location or dates change), and delete them.
- **Validation:** end date can't precede start date (enforced both client-side and via a Pydantic validator server-side); unresolvable locations return a clear 404 instead of silently failing.
- **Export:** any saved record can be downloaded as JSON, CSV, XML, Markdown, or PDF.
- **Auth:** email/password registration and login with JWT, so saved records are private per account.