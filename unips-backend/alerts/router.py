from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from alerts.schemas import (
    AlertEventRead,
    AlertRuleCreate,
    AlertRuleRead,
    AlertRuleUpdate,
    EmailAlertCreate,
    EmailLogRead,
)
from alerts.service import evaluate_reading_for_alerts, queue_email_alert
from auth.deps import get_current_user
from common import Message
from database import get_db
from models import AlertEvent, AlertRule, EmailLog, NoiseReading, Station

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/rules", response_model=list[AlertRuleRead])
def list_alert_rules(db: Session = Depends(get_db)) -> list[AlertRule]:
    return db.query(AlertRule).order_by(AlertRule.created_at.desc()).all()


@router.post(
    "/rules",
    response_model=AlertRuleRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
def create_alert_rule(payload: AlertRuleCreate, db: Session = Depends(get_db)) -> AlertRule:
    if payload.station_id and not db.get(Station, payload.station_id):
        raise HTTPException(status_code=404, detail="Station not found")
    rule = AlertRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.patch(
    "/rules/{rule_id}",
    response_model=AlertRuleRead,
    dependencies=[Depends(get_current_user)],
)
def update_alert_rule(rule_id: int, payload: AlertRuleUpdate, db: Session = Depends(get_db)) -> AlertRule:
    rule = db.get(AlertRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Alert rule not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete(
    "/rules/{rule_id}",
    response_model=Message,
    dependencies=[Depends(get_current_user)],
)
def delete_alert_rule(rule_id: int, db: Session = Depends(get_db)) -> Message:
    rule = db.get(AlertRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Alert rule not found")
    db.delete(rule)
    db.commit()
    return Message(message="Alert rule deleted")


@router.get("/events", response_model=list[AlertEventRead])
def list_alert_events(
    status_filter: str | None = Query(default=None, alias="status"),
    severity: str | None = None,
    station_id: int | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[AlertEvent]:
    query = db.query(AlertEvent)
    if status_filter:
        query = query.filter(AlertEvent.status == status_filter)
    if severity:
        query = query.filter(AlertEvent.severity == severity)
    if station_id:
        query = query.filter(AlertEvent.station_id == station_id)
    return query.order_by(AlertEvent.created_at.desc()).limit(limit).all()


@router.patch(
    "/events/{event_id}/resolve",
    response_model=AlertEventRead,
    dependencies=[Depends(get_current_user)],
)
def resolve_alert_event(event_id: int, db: Session = Depends(get_db)) -> AlertEvent:
    event = db.get(AlertEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Alert event not found")
    event.status = "resolved"
    event.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(event)
    return event


@router.post(
    "/evaluate/{reading_id}",
    response_model=list[AlertEventRead],
    dependencies=[Depends(get_current_user)],
)
async def evaluate_reading(reading_id: int, db: Session = Depends(get_db)) -> list[AlertEvent]:
    reading = db.get(NoiseReading, reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")
    return await evaluate_reading_for_alerts(db, reading)


@router.post(
    "/email",
    response_model=EmailLogRead,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(get_current_user)],
)
def create_email_alert(payload: EmailAlertCreate, db: Session = Depends(get_db)) -> EmailLog:
    return queue_email_alert(db, str(payload.recipient), payload.subject, payload.body)


@router.get(
    "/email",
    response_model=list[EmailLogRead],
    dependencies=[Depends(get_current_user)],
)
def list_email_logs(db: Session = Depends(get_db)) -> list[EmailLog]:
    return db.query(EmailLog).order_by(EmailLog.created_at.desc()).all()
