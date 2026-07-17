from datetime import datetime, timezone

from sqlalchemy.orm import Session

from alerts.schemas import AlertEventRead
from models import AlertEvent, AlertRule, EmailLog, NoiseReading, Notification, Station
from websocket_manager import alert_ws_manager


def build_alert_message(rule: AlertRule, station: Station | None, reading: NoiseReading) -> str:
    station_name = station.name if station else f"Station {reading.station_id}"
    if rule.message_template:
        return rule.message_template.format(
            station=station_name,
            noise_db=reading.noise_db,
            threshold_db=rule.threshold_db,
        )
    return f"{station_name} recorded {reading.noise_db} dB, crossing {rule.threshold_db} dB."


async def evaluate_reading_for_alerts(db: Session, reading: NoiseReading) -> list[AlertEvent]:
    station = db.get(Station, reading.station_id)
    rules = (
        db.query(AlertRule)
        .filter(AlertRule.is_active.is_(True))
        .filter(AlertRule.threshold_db <= reading.noise_db)
        .all()
    )

    created_events: list[AlertEvent] = []
    for rule in rules:
        if rule.station_id and rule.station_id != reading.station_id:
            continue
        message = build_alert_message(rule, station, reading)
        event = AlertEvent(
            rule_id=rule.id,
            station_id=reading.station_id,
            reading_id=reading.id,
            title=rule.name,
            message=message,
            severity=rule.severity,
            status="open",
        )
        notification = Notification(
            title=rule.name,
            message=message,
            severity=rule.severity,
            station_id=reading.station_id,
        )
        db.add(event)
        db.add(notification)
        created_events.append(event)

    if created_events:
        db.commit()
        for event in created_events:
            db.refresh(event)
            await alert_ws_manager.broadcast(
                {
                    "event": "alert.created",
                    "data": AlertEventRead.model_validate(event).model_dump(mode="json"),
                }
            )

    return created_events


def queue_email_alert(db: Session, recipient: str, subject: str, body: str) -> EmailLog:
    email = EmailLog(
        recipient=recipient,
        subject=subject,
        body=body,
        status="queued",
    )
    db.add(email)
    db.commit()
    db.refresh(email)
    return email


def mark_email_sent(db: Session, email: EmailLog) -> EmailLog:
    email.status = "sent"
    email.sent_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(email)
    return email
