# Weathex

A weather dashboard I built for the PM Accelerator AI Engineer Intern technical assessment. You can look up a location — a city, a zip code, a landmark, whatever — and get current conditions plus a 7-day forecast. Signed-in users can save a location and date range, come back and edit or delete it later, and export any saved record to JSON, CSV, XML, Markdown, or PDF.

Built by **Waqas Ahmad**.

## What this covers

For the frontend side of the assessment, location search handles city names, zip codes, landmarks, and coordinates. There's a button to grab weather for wherever you currently are, current conditions with icons, an hourly view, a 7-day forecast, and an air quality panel. Search for something that doesn't exist and you get a real error message instead of the app just breaking. The layout holds up on a phone screen too, since everything's built with Tailwind's responsive breakpoints.

On the backend side, saved weather records support full CRUD — create, read, update, delete. Date ranges get validated (you can't save an end date before a start date), and locations get checked against the geocoder before anything's written to the database, with a fallback lookup for things the primary geocoder can't resolve, like zip codes or landmarks. Export works for JSON, CSV, XML, Markdown, and PDF. Beyond what's asked for, I added a map view using OpenStreetMap and pulled in the Open-Meteo Air Quality API, plus a basic JWT auth system so people's saved records stay private to their account.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** FastAPI, SQLAlchemy, SQLite, Pydantic
- **APIs:** Open-Meteo for weather, geocoding, and air quality; Nominatim/OpenStreetMap as a geocoding fallback and for the embedded map

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

The API comes up on `http://localhost:8000`, and you can poke around the endpoints at `http://localhost:8000/docs`. SQLAlchemy creates `weathex.db` on first run, so there's no database setup step.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` calls to the backend (check `vite.config.js` if you need to change the port). No API keys needed anywhere — both Open-Meteo and Nominatim are free and keyless.

## A few implementation notes

City-name searches go through Open-Meteo's geocoder first. If that comes back empty — say someone typed a zip code or a landmark name — it falls back to Nominatim automatically, so the search bar can handle more than just "type a city name."

Editing a saved record re-fetches the weather data if you changed the location or the dates, rather than just updating the text fields and leaving stale numbers behind.

`SECRET_KEY` in `auth_utils.py` is hardcoded for now, which is fine for running this locally but would move to an environment variable for anything beyond a demo.