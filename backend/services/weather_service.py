import requests
import json
from datetime import date

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_HEADERS = {"User-Agent": "WeathexApp/1.0 (technical-assessment-project)"}

WEATHER_CODE_MAP = {
    0: ("clear-day", "Clear sky"),
    1: ("clear-day", "Mainly clear"),
    2: ("partly-cloudy-day", "Partly cloudy"),
    3: ("overcast", "Overcast"),
    45: ("fog", "Foggy"),
    48: ("fog", "Depositing rime fog"),
    51: ("rain", "Light drizzle"),
    53: ("rain", "Moderate drizzle"),
    55: ("rain", "Dense drizzle"),
    56: ("rain", "Light freezing drizzle"),
    57: ("rain", "Dense freezing drizzle"),
    61: ("rain", "Slight rain"),
    63: ("rain", "Moderate rain"),
    65: ("rain", "Heavy rain"),
    66: ("rain", "Light freezing rain"),
    67: ("rain", "Heavy freezing rain"),
    71: ("snow", "Slight snow fall"),
    73: ("snow", "Moderate snow fall"),
    75: ("snow", "Heavy snow fall"),
    77: ("snow", "Snow grains"),
    80: ("rain", "Slight rain showers"),
    81: ("rain", "Moderate rain showers"),
    82: ("rain", "Violent rain showers"),
    85: ("snow", "Slight snow showers"),
    86: ("snow", "Heavy snow showers"),
    95: ("thunderstorm", "Thunderstorm"),
    96: ("thunderstorm", "Thunderstorm with slight hail"),
    99: ("thunderstorm", "Thunderstorm with heavy hail"),
}


def get_condition_from_code(code: int) -> tuple:
    return WEATHER_CODE_MAP.get(code, ("partly-cloudy-day", "Unknown"))


def _geocode_with_open_meteo(query: str) -> dict:
    search_term = query.split(",")[0].strip()

    params = {"name": search_term, "count": 1, "language": "en", "format": "json"}
    response = requests.get(GEOCODING_URL, params=params, timeout=8)
    response.raise_for_status()
    data = response.json()

    if not data.get("results"):
        raise ValueError("Location not found via Open-Meteo")

    result = data["results"][0]

    parts = []
    name = result.get("name")
    admin1 = result.get("admin1")
    country = result.get("country")

    if name:
        parts.append(name)
    if admin1 and admin1.lower() != name.lower():
        parts.append(admin1)
    if country and country.lower() not in [p.lower() for p in parts]:
        parts.append(country)

    full_location_name = ", ".join(parts) if parts else query

    return {
        "location_name": full_location_name,
        "latitude": result["latitude"],
        "longitude": result["longitude"],
        "country": result.get("country", ""),
    }


def _geocode_with_nominatim(query: str) -> dict:
    params = {"q": query, "format": "json", "limit": 1, "addressdetails": 1}
    response = requests.get(NOMINATIM_URL, params=params, headers=NOMINATIM_HEADERS, timeout=8)
    response.raise_for_status()
    results = response.json()

    if not results:
        raise ValueError("Location not found via Nominatim")

    result = results[0]
    address = result.get("address", {})

    parts = []
    place = (
        address.get("city") or address.get("town") or address.get("village")
        or address.get("attraction") or address.get("suburb")
        or result.get("name")
    )
    state = address.get("state")
    country = address.get("country")

    if place:
        parts.append(place)
    if state and (not place or state.lower() != place.lower()):
        parts.append(state)
    if country and country.lower() not in [p.lower() for p in parts]:
        parts.append(country)

    full_location_name = ", ".join(parts) if parts else result.get("display_name", query)

    return {
        "location_name": full_location_name,
        "latitude": float(result["lat"]),
        "longitude": float(result["lon"]),
        "country": country or "",
    }


def geocode_location(query: str) -> dict:
    try:
        return _geocode_with_open_meteo(query)
    except ValueError:
        return _geocode_with_nominatim(query)


def get_current_weather(lat: float, lon: float, location_name: str = None) -> dict:
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "precipitation", "weather_code"],
        "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_probability_max"],
        "timezone": "auto",
        "forecast_days": 1
    }
    response = requests.get(FORECAST_URL, params=params)
    response.raise_for_status()
    data = response.json()

    current = data.get("current", {})
    daily = data.get("daily", {})
    code = current.get("weather_code", 2)
    condition, description = get_condition_from_code(code)

    utc_offset_seconds = data.get("utc_offset_seconds", 0)

    return {
        "location_name": location_name or "Current Location",
        "latitude": lat,
        "longitude": lon,
        "temperature": current.get("temperature_2m", 0),
        "feels_like": current.get("apparent_temperature", 0),
        "temp_max": daily.get("temperature_2m_max", [0])[0],
        "temp_min": daily.get("temperature_2m_min", [0])[0],
        "condition": condition,
        "description": description,
        "rain_chance": daily.get("precipitation_probability_max", [0])[0],
        "precipitation": current.get("precipitation", 0),
        "utc_offset_seconds": utc_offset_seconds
    }


def get_forecast(lat: float, lon: float) -> dict:
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ["temperature_2m", "weather_code"],
        "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_max"],
        "timezone": "auto",
        "forecast_days": 7
    }
    response = requests.get(FORECAST_URL, params=params)
    response.raise_for_status()
    data = response.json()

    hourly_data = []
    times = data.get("hourly", {}).get("time", [])
    temps = data.get("hourly", {}).get("temperature_2m", [])
    codes = data.get("hourly", {}).get("weather_code", [])

    for i in range(len(times)):
        condition, _ = get_condition_from_code(codes[i] if i < len(codes) else 2)
        hourly_data.append({
            "time": times[i],
            "temperature": temps[i] if i < len(temps) else 0,
            "condition": condition
        })

    daily_data = []
    d_times = data.get("daily", {}).get("time", [])
    d_codes = data.get("daily", {}).get("weather_code", [])
    d_max = data.get("daily", {}).get("temperature_2m_max", [])
    d_min = data.get("daily", {}).get("temperature_2m_min", [])
    d_rain = data.get("daily", {}).get("precipitation_probability_max", [])

    for i in range(len(d_times)):
        condition, description = get_condition_from_code(d_codes[i] if i < len(d_codes) else 2)
        daily_data.append({
            "time": d_times[i],
            "condition": condition,
            "description": description,
            "temp_max": d_max[i] if i < len(d_max) else 0,
            "temp_min": d_min[i] if i < len(d_min) else 0,
            "rain_chance": d_rain[i] if i < len(d_rain) else 0
        })

    return {"hourly": hourly_data, "daily": daily_data}


def get_air_quality(lat: float, lon: float) -> dict:
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["us_aqi", "pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide", "sulphur_dioxide", "ozone"],
        "timezone": "auto"
    }
    response = requests.get(AIR_QUALITY_URL, params=params)
    response.raise_for_status()
    data = response.json()

    current = data.get("current", {})
    return {
        "aqi": current.get("us_aqi", 0),
        "pm10": current.get("pm10", 0),
        "pm2_5": current.get("pm2_5", 0),
        "co": current.get("carbon_monoxide", 0),
        "no2": current.get("nitrogen_dioxide", 0),
        "so2": current.get("sulphur_dioxide", 0),
        "ozone": current.get("ozone", 0)
    }


def fetch_and_format_weather_data(lat: float, lon: float, start_date: date, end_date: date) -> str:
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
        "timezone": "auto",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat()
    }
    response = requests.get(FORECAST_URL, params=params)
    response.raise_for_status()
    data = response.json()

    formatted_data = []
    d_times = data.get("daily", {}).get("time", [])
    d_codes = data.get("daily", {}).get("weather_code", [])
    d_max = data.get("daily", {}).get("temperature_2m_max", [])
    d_min = data.get("daily", {}).get("temperature_2m_min", [])
    d_prec = data.get("daily", {}).get("precipitation_sum", [])

    for i in range(len(d_times)):
        condition, description = get_condition_from_code(d_codes[i] if i < len(d_codes) else 2)
        formatted_data.append({
            "date": d_times[i],
            "condition": condition,
            "description": description,
            "temp_max": d_max[i] if i < len(d_max) else 0,
            "temp_min": d_min[i] if i < len(d_min) else 0,
            "precipitation": d_prec[i] if i < len(d_prec) else 0
        })

    return json.dumps(formatted_data)


def search_cities(query: str) -> list:
    if not query or len(query) < 2:
        return []
    params = {"name": query, "count": 5, "language": "en", "format": "json"}
    try:
        response = requests.get(GEOCODING_URL, params=params, timeout=8)
        response.raise_for_status()
        data = response.json()
    except Exception:
        data = {}

    results = data.get("results", [])
    formatted = []
    for r in results:
        parts = []
        name = r.get("name")
        admin1 = r.get("admin1")
        country = r.get("country")

        if name: parts.append(name)
        if admin1:
            if not name or admin1.lower() != name.lower():
                parts.append(admin1)
        if country:
            if (not name or country.lower() != name.lower()) and (not admin1 or country.lower() != admin1.lower()):
                parts.append(country)

        formatted.append({
            "name": ", ".join(parts) if parts else "Unknown",
            "latitude": r.get("latitude"),
            "longitude": r.get("longitude")
        })

    if not formatted:
        try:
            response = requests.get(
                NOMINATIM_URL,
                params={"q": query, "format": "json", "limit": 5, "addressdetails": 1},
                headers=NOMINATIM_HEADERS,
                timeout=8,
            )
            response.raise_for_status()
            for r in response.json():
                address = r.get("address", {})
                place = (
                    address.get("city") or address.get("town") or address.get("village")
                    or address.get("attraction") or r.get("name")
                )
                country = address.get("country")
                label_parts = [p for p in [place, country] if p]
                formatted.append({
                    "name": ", ".join(label_parts) if label_parts else r.get("display_name", query),
                    "latitude": float(r["lat"]),
                    "longitude": float(r["lon"]),
                })
        except Exception:
            pass

    return formatted