from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy import or_
import phonenumbers
import logging
from app.models.client import Client
from app.models.order_request import OrderRequest
from database.database import get_db
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/consult", tags=["consult"])
ALLOWED_REGIONS = ["RU", "US", "BY", "KZ", "UZ", "TJ", "KG", "AE", "CN"]
class ConsultIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=40)
    telegram: str | None = Field(None, max_length=80)
    description: str | None = Field(None, max_length=4000)
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        try:
            cleaned = v.strip()
            if cleaned.startswith("8") and len(cleaned) == 11:
                cleaned = "+7" + cleaned[1:]
            elif not cleaned.startswith("+"):
                cleaned = "+" + cleaned
            parsed = phonenumbers.parse(cleaned, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("Invalid phone number format")
            region = phonenumbers.region_code_for_number(parsed)
            if region not in ALLOWED_REGIONS:
                raise ValueError(f"Region {region} not supported")
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        except Exception as e:
            raise ValueError(str(e))
@router.post("")
async def create_consult_request(data: ConsultIn, db: Session = Depends(get_db)):
    lookup_conditions = []
    if data.telegram:
        lookup_conditions.append(Client.telegram_username == data.telegram)
    if data.phone:
        lookup_conditions.append(Client.phone == data.phone)
    if data.email:
        lookup_conditions.append(Client.email == data.email)
    client = None
    if lookup_conditions:
        client = db.query(Client).filter(or_(*lookup_conditions)).first()
    if not client:
        client = Client(
            phone=data.phone,
            email=data.email,
            telegram_username=data.telegram,
            name=data.name,
            role_title="Consultation",
        )
        db.add(client)
        db.flush()
    order = OrderRequest(
        client_id=client.id,
        service_types_json=["Консультация"],
        about=data.description or "",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    logger.info("Consult request created: %s", order.id)
    return {"status": "ok", "id": str(order.id)}
