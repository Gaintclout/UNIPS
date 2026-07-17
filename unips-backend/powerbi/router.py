from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from common import Message
from database import get_db
from models import AlertEvent, ForecastPrediction, PowerBIReport, Station, User
from powerbi.schemas import (
    PowerBIEmbedToken,
    PowerBIReportCreate,
    PowerBIReportRead,
    PowerBIReportUpdate,
    SecureDashboardSummary,
)
from powerbi.service import create_development_embed_token

router = APIRouter(prefix="/powerbi", tags=["powerbi"])


@router.get("/reports", response_model=list[PowerBIReportRead])
def list_reports(db: Session = Depends(get_db)) -> list[PowerBIReport]:
    return db.query(PowerBIReport).order_by(PowerBIReport.name).all()


@router.post(
    "/reports",
    response_model=PowerBIReportRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
def create_report(payload: PowerBIReportCreate, db: Session = Depends(get_db)) -> PowerBIReport:
    if db.query(PowerBIReport).filter(PowerBIReport.report_key == payload.report_key).first():
        raise HTTPException(status_code=409, detail="Report key already exists")
    report = PowerBIReport(**payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.patch(
    "/reports/{report_id}",
    response_model=PowerBIReportRead,
    dependencies=[Depends(get_current_user)],
)
def update_report(
    report_id: int, payload: PowerBIReportUpdate, db: Session = Depends(get_db)
) -> PowerBIReport:
    report = db.get(PowerBIReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Power BI report not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(report, field, value)
    db.commit()
    db.refresh(report)
    return report


@router.post("/reports/{report_id}/embed-token", response_model=PowerBIEmbedToken)
def generate_embed_token(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PowerBIEmbedToken:
    report = db.get(PowerBIReport, report_id)
    if not report or not report.is_active:
        raise HTTPException(status_code=404, detail="Active Power BI report not found")
    allowed_roles = report.allowed_roles or []
    if allowed_roles and current_user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="User role cannot access this report")
    return create_development_embed_token(report)


@router.delete(
    "/reports/{report_id}",
    response_model=Message,
    dependencies=[Depends(get_current_user)],
)
def delete_report(report_id: int, db: Session = Depends(get_db)) -> Message:
    report = db.get(PowerBIReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Power BI report not found")
    db.delete(report)
    db.commit()
    return Message(message="Power BI report deleted")


@router.get("/dashboard", response_model=SecureDashboardSummary)
def secure_dashboard(db: Session = Depends(get_db)) -> SecureDashboardSummary:
    return SecureDashboardSummary(
        active_reports=db.query(func.count(PowerBIReport.id)).filter(PowerBIReport.is_active.is_(True)).scalar() or 0,
        active_alerts=db.query(func.count(AlertEvent.id)).filter(AlertEvent.status == "open").scalar() or 0,
        stations=db.query(func.count(Station.id)).scalar() or 0,
        latest_predictions=db.query(func.count(ForecastPrediction.id)).scalar() or 0,
    )
