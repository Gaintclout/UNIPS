from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ReportGenerateRequest(BaseModel):
    report_type: str = "noise-summary"
    title: str = "UNIPS Noise Summary"
    parameters: dict[str, Any] | None = None


class ReportJobRead(BaseModel):
    id: int
    report_type: str
    title: str
    status: str
    requested_by_id: int | None = None
    parameters: dict[str, Any] | None = None
    payload: dict[str, Any] | None = None
    created_at: datetime
    generated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
