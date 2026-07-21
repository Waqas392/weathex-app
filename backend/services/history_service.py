from sqlalchemy.orm import Session
from models import WeatherRecord
from schemas import WeatherRecordCreate, WeatherRecordUpdate
from services.weather_service import geocode_location, fetch_and_format_weather_data
from fastapi import HTTPException

def get_all_records(db: Session, user_id: int) -> list[WeatherRecord]:
    return db.query(WeatherRecord).filter(WeatherRecord.user_id == user_id).order_by(WeatherRecord.created_at.desc()).all()

def get_record_by_id(db: Session, record_id: int, user_id: int) -> WeatherRecord:
    record = db.query(WeatherRecord).filter(WeatherRecord.id == record_id, WeatherRecord.user_id == user_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Weather record not found")
    return record

def create_record(db: Session, record: WeatherRecordCreate, user_id: int) -> WeatherRecord:
    try:
        geo_data = geocode_location(record.location_name)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Location '{record.location_name}' not found. Please try a different name or zip code.")
    except Exception:
        raise HTTPException(status_code=503, detail="Geocoding service unavailable. Please try again later.")

    try:
        weather_data_str = fetch_and_format_weather_data(
            geo_data["latitude"],
            geo_data["longitude"],
            record.start_date,
            record.end_date
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Weather data service unavailable. Please try again later.")

    db_record = WeatherRecord(
        user_id=user_id,
        location_name=geo_data["location_name"],
        latitude=geo_data["latitude"],
        longitude=geo_data["longitude"],
        start_date=record.start_date,
        end_date=record.end_date,
        temperature_data=weather_data_str
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def update_record(db: Session, record_id: int, record_update: WeatherRecordUpdate, user_id: int) -> WeatherRecord:
    db_record = get_record_by_id(db, record_id, user_id)

    update_data = record_update.dict(exclude_unset=True)

    new_location = update_data.get("location_name")
    if new_location and new_location != db_record.location_name:
        try:
            geo_data = geocode_location(new_location)
            db_record.location_name = geo_data["location_name"]
            db_record.latitude = geo_data["latitude"]
            db_record.longitude = geo_data["longitude"]
        except ValueError:
            raise HTTPException(status_code=404, detail=f"Location '{new_location}' not found.")
        except Exception:
            raise HTTPException(status_code=503, detail="Geocoding service unavailable.")

    if "start_date" in update_data:
        db_record.start_date = update_data["start_date"]
    if "end_date" in update_data:
        db_record.end_date = update_data["end_date"]

    if db_record.start_date > db_record.end_date:
        raise HTTPException(status_code=422, detail="End date cannot be before start date")

    if new_location or "start_date" in update_data or "end_date" in update_data:
        try:
            weather_data_str = fetch_and_format_weather_data(
                db_record.latitude,
                db_record.longitude,
                db_record.start_date,
                db_record.end_date
            )
            db_record.temperature_data = weather_data_str
        except Exception:
            raise HTTPException(status_code=503, detail="Weather data service unavailable.")

    db.commit()
    db.refresh(db_record)
    return db_record

def delete_record(db: Session, record_id: int, user_id: int) -> dict:
    db_record = get_record_by_id(db, record_id, user_id)
    db.delete(db_record)
    db.commit()
    return {"message": "Record deleted successfully"}