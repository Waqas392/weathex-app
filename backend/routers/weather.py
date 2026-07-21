from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from services import weather_service
from database import get_db

router = APIRouter()

@router.get("/current")
def get_current_weather_data(
    query: str = Query(None, description="City name, zip code, or landmark"),
    lat: float = Query(None, description="Latitude"),
    lon: float = Query(None, description="Longitude"),
    db: Session = Depends(get_db)
):
    if query:
        try:
            geo_data = weather_service.geocode_location(query)
            return weather_service.get_current_weather(geo_data["latitude"], geo_data["longitude"], geo_data["location_name"])
        except ValueError:
            raise HTTPException(status_code=404, detail=f"Location '{query}' not found.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    elif lat is not None and lon is not None:
        return weather_service.get_current_weather(lat, lon, "Current Location")
    else:
        raise HTTPException(status_code=400, detail="Either 'query' or 'lat'/'lon' parameters are required.")

@router.get("/forecast")
def get_forecast_data(lat: float = Query(...), lon: float = Query(...)):
    try:
        return weather_service.get_forecast(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/air-quality")
def get_air_quality_data(lat: float = Query(...), lon: float = Query(...)):
    try:
        return weather_service.get_air_quality(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
def search_locations(query: str = Query(..., min_length=2)):
    try:
        print(f"Backend received search for: {query}")
        return weather_service.search_cities(query)
    except Exception as e:
        print(f"Backend Search Error: {e}")
        return []