import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database.database import Base

class OrderRequest(Base):
    __tablename__ = "order_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True, index=True)
    service_types_json = Column(JSONB, nullable=True)
    about = Column(Text, nullable=True)
    estimate_deadline = Column(String, nullable=True)
    estimate_budget = Column(String, nullable=True)
    naming_help = Column(String, nullable=True)
    status = Column(String, nullable=False, default="new", index=True)
    cancellation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
