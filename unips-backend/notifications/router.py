from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from common import Message
from database import get_db
from models import Notification
from notifications.schemas import NotificationCreate, NotificationRead
from websocket_manager import alert_ws_manager

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationRead])
def list_notifications(db: Session = Depends(get_db), unread_only: bool = False) -> list[Notification]:
    query = db.query(Notification)
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))
    return query.order_by(Notification.created_at.desc()).all()


@router.post(
    "",
    response_model=NotificationRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
async def create_notification(
    payload: NotificationCreate, db: Session = Depends(get_db)
) -> Notification:
    notification = Notification(**payload.model_dump())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    await alert_ws_manager.broadcast(
        {
            "event": "notification.created",
            "data": NotificationRead.model_validate(notification).model_dump(mode="json"),
        }
    )
    return notification


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationRead,
    dependencies=[Depends(get_current_user)],
)
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)) -> Notification:
    notification = db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.delete(
    "/{notification_id}",
    response_model=Message,
    dependencies=[Depends(get_current_user)],
)
def delete_notification(notification_id: int, db: Session = Depends(get_db)) -> Message:
    notification = db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notification)
    db.commit()
    return Message(message="Notification deleted")
