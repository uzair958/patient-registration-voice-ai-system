from typing import Any

from pydantic import BaseModel

from app.schemas.patient import PatientCreate


class LookupPatientRequest(BaseModel):
    phone_number: str


class CreatePatientRequest(PatientCreate):
    pass


class UpdatePatientRequest(BaseModel):
    patient_id: str
    changes: dict[str, Any]