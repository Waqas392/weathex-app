# Weathex

Weathex is a full-stack weather dashboard built as part of the PM Accelerator AI Engineer Intern technical assessment. The goal was to create a weather application that goes beyond simply displaying today's forecast by combining real-time weather data, air quality information, location search, record management, and export functionality in a clean and user-friendly experience.

The application allows users to search for weather information using city names, postal codes, landmarks, or GPS coordinates. Users can also save weather lookups for specific date ranges, manage those records, and export them in multiple formats.

Built by **Waqas Ahmad**.

## Project Highlights

### Frontend Assessment Requirements

* Search weather by city, zip/postal code, landmark, or coordinates
* Get weather for the user's current location using browser geolocation
* View current weather conditions with weather icons
* Browse hourly and 7-day forecasts
* Check local air quality information
* Responsive design that works across desktop, tablet, and mobile devices
* Clear and user-friendly error handling for invalid locations and API failures

### Backend Assessment Requirements

* Complete CRUD operations for saved weather records
* Validation for locations and date ranges
* Export weather records in multiple formats
* Integration with additional external services
* User authentication with JWT-based authorization
* Private record management for each user account

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* React Router
* Axios

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* Pydantic

### External APIs

* Open-Meteo (Weather Forecasts, Geocoding, Air Quality)
* Nominatim / OpenStreetMap (Location Search and Maps)

## Project Structure

```text
weathex-app/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth_utils.py
│   ├── requirements.txt
│   ├── routers/
│   │   ├── weather.py
│   │   ├── history.py
│   │   ├── export.py
│   │   └── auth.py
│   └── services/
│       ├── weather_service.py
│       ├── history_service.py
│       └── export_service.py
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/api.js
    └── package.json
```

## Running the Project Locally

### Backend

```bash
cd backend

python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

The backend will start on:

```text
http://localhost:8000
```

Interactive API documentation is available at:

```text
http://localhost:8000/docs
```

A local SQLite database is created automatically when the application runs for the first time.

### Frontend

```bash
cd frontend

npm install

npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

API requests are proxied to the FastAPI backend through the Vite configuration.

No API keys are required since both Open-Meteo and Nominatim provide free public access.

## Features

### Smart Location Search

Users can search using:

* City names
* Zip or postal codes
* Famous landmarks
* GPS coordinates

The application first attempts to resolve locations through Open-Meteo's geocoding service. If a result isn't found, it automatically falls back to OpenStreetMap's Nominatim service, helping support a wider range of location inputs.

### Current Location Weather

Using the browser's Geolocation API, users can instantly view weather conditions for their current location without manually entering a search query.

### Forecasts and Air Quality

The dashboard provides:

* Current weather conditions
* Hourly forecast data
* 7-day forecast outlook
* Air Quality Index (AQI) information

This gives users a more complete picture of local weather conditions beyond temperature alone.

### Weather Record Management

Authenticated users can save weather lookups along with a custom date range.

Saved records can be:

* Created
* Viewed
* Updated
* Deleted

When a record is updated, the application automatically refreshes weather information if the location or date range changes.

### Data Validation

Several validation layers help prevent invalid data from being stored:

* End dates cannot occur before start dates
* Invalid or unknown locations return clear error messages
* Server-side validation is handled through Pydantic models

### Export Options

Weather records can be exported in multiple formats:

* JSON
* CSV
* XML
* Markdown
* PDF

This makes it easy to save, share, or use weather data outside the application.

### Authentication

Users can create accounts and log in using email and password authentication.

JWT-based authorization ensures that each user's saved records remain private and accessible only to their account.

## What I Learned

Building Weathex provided hands-on experience with full-stack development, API integration, authentication, data validation, and file generation. It was also a great opportunity to work with FastAPI and React together while designing a system that combines multiple external services into a single user experience.

The project demonstrates both frontend and backend development skills, including responsive UI design, REST API development, database management, authentication, and integration with third-party APIs.
