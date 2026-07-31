from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class PatientCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)

    date_of_birth: date

    sex: str

    phone_number: str

    email: Optional[EmailStr] = None

    address_line_1: str
    address_line_2: Optional[str] = None

    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=2, max_length=2)
    zip_code: str

    insurance_provider: Optional[str] = None
    insurance_member_id: Optional[str] = None

    preferred_language: str = "English"

    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None