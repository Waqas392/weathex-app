from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from services import history_service, export_service
from database import get_db
from auth_utils import get_current_user
from models import User

router = APIRouter()

@router.get("/{record_id}")
def export_record(
    record_id: int,
    format: str = Query("json", enum=["json", "csv", "xml", "md", "pdf"]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = history_service.get_record_by_id(db, record_id, current_user.id)

    if format == "json":
        return export_service.format_json(record)
    elif format == "csv":
        return export_service.format_csv(record)
    elif format == "xml":
        return export_service.format_xml(record)
    elif format == "md":
        return export_service.format_markdown(record)
    elif format == "pdf":
        return export_service.format_pdf(record)
    else:
        raise HTTPException(status_code=400, detail="Invalid export format")