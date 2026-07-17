from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PowerBIReportCreate(BaseModel):
    report_key: str
    name: str
    workspace_id: str | None = None
    report_id: str | None = None
    dataset_id: str | None = None
    embed_url: str | None = None
    allowed_roles: list[str] = Field(default_factory=lambda: ["admin", "operator"])
    is_active: bool = True


class PowerBIReportUpdate(BaseModel):
    name: str | None = None
    workspace_id: str | None = None
    report_id: str | None = None
    dataset_id: str | None = None
    embed_url: str | None = None
    allowed_roles: list[str] | None = None
    is_active: bool | None = None


class PowerBIReportRead(PowerBIReportCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PowerBIEmbedToken(BaseModel):
    report_key: str
    report_id: str | None = None
    embed_url: str | None = None
    access_token: str
    token_type: str = "Embed"
    expires_at: datetime
    integration_status: str


class SecureDashboardSummary(BaseModel):
    active_reports: int
    active_alerts: int
    stations: int
    latest_predictions: int
