from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import WeatherRecordCreate, WeatherRecordUpdate, WeatherRecordResponse
from services import history_service
from database import get_db
import models
import auth_utils

router = APIRouter()

@router.get("/", response_model=list[WeatherRecordResponse])
def read_all_records(db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    return history_service.get_all_records(db, current_user.id)

@router.get("/{record_id}", response_model=WeatherRecordResponse)
def read_record(record_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    return history_service.get_record_by_id(db, record_id, current_user.id)

@router.post("/", response_model=WeatherRecordResponse)
def create_record(record: WeatherRecordCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    return history_service.create_record(db, record, current_user.id)

@router.put("/{record_id}", response_model=WeatherRecordResponse)
def update_record(record_id: int, record: WeatherRecordUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    return history_service.update_record(db, record_id, record, current_user.id)

@router.delete("/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    return history_service.delete_record(db, record_id, current_user.id)