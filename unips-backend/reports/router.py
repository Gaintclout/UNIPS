from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from database import get_db
from models import ReportJob, User
from reports.schemas import ReportGenerateRequest, ReportJobRead
from reports.service import build_report_payload

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post(
    "/generate",
    response_model=ReportJobRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
def generate_report(
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportJob:
    report_payload = build_report_payload(db, payload.report_type, payload.parameters)
    job = ReportJob(
        report_type=payload.report_type,
        title=payload.title,
        status="completed",
        requested_by_id=current_user.id,
        parameters=payload.parameters,
        payload=report_payload,
        generated_at=datetime.now(timezone.utc),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("", response_model=list[ReportJobRead])
def list_report_jobs(
    report_type: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[ReportJob]:
    query = db.query(ReportJob)
    if report_type:
        query = query.filter(ReportJob.report_type == report_type)
    return query.order_by(ReportJob.created_at.desc()).limit(limit).all()


@router.get("/{job_id}", response_model=ReportJobRead)
def get_report_job(job_id: int, db: Session = Depends(get_db)) -> ReportJob:
    job = db.get(ReportJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Report job not found")
    return job
