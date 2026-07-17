from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AlertRuleCreate(BaseModel):
    name: str
    station_id: int | None = None
    threshold_db: float = 75.0
    severity: str = "high"
    message_template: str | None = None
    channels: list[str] = Field(default_factory=lambda: ["dashboard"])
    is_active: bool = True


class AlertRuleUpdate(BaseModel):
    name: str | None = None
    station_id: int | None = None
    threshold_db: float | None = None
    severity: str | None = None
    message_template: str | None = None
    channels: list[str] | None = None
    is_active: bool | None = None


class AlertRuleRead(AlertRuleCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertEventRead(BaseModel):
    id: int
    rule_id: int | None = None
    station_id: int | None = None
    reading_id: int | None = None
    title: str
    message: str
    severity: str
    status: str
    created_at: datetime
    resolved_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class EmailAlertCreate(BaseModel):
    recipient: EmailStr
    subject: str
    body: str


class EmailLogRead(BaseModel):
    id: int
    recipient: EmailStr
    subject: str
    body: str
    status: str
    error_message: str | None = None
    created_at: datetime
    sent_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
