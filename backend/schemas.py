from pydantic import BaseModel, Field, EmailStr, validator
from datetime import date, datetime
from typing import Optional, Any, List

class WeatherRecordBase(BaseModel):
    location_name: str = Field(..., min_length=2, description="Name of the city, zip code, or landmark")
    start_date: date
    end_date: date

    @validator('end_date')
    def validate_date_range(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError("End date cannot be before start date")
        return v

class WeatherRecordCreate(WeatherRecordBase):
    pass

class WeatherRecordUpdate(BaseModel):
    location_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class WeatherRecordResponse(WeatherRecordBase):
    id: int
    latitude: float
    longitude: float
    temperature_data: Optional[Any] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LocationResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    country: Optional[str] = None

class WeatherDataResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    temperature: float
    feels_like: float
    temp_min: float
    temp_max: float
    condition: str
    description: str
    rain_chance: int
    precipitation: float

class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse