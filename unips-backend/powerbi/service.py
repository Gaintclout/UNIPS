from datetime import datetime, timedelta, timezone
from uuid import uuid4

from powerbi.schemas import PowerBIEmbedToken
from models import PowerBIReport


def create_development_embed_token(report: PowerBIReport) -> PowerBIEmbedToken:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    return PowerBIEmbedToken(
        report_key=report.report_key,
        report_id=report.report_id,
        embed_url=report.embed_url,
        access_token=f"dev-embed-token-{uuid4()}",
        expires_at=expires_at,
        integration_status="placeholder_until_powerbi_service_principal_is_configured",
    )
