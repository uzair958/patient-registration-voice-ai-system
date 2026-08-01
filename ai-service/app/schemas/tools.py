from typing import Any, List, Dict, Optional

from pydantic import BaseModel, Field

from app.schemas.patient import PatientCreate


class LookupPatientRequest(BaseModel):
    phone_number: str


class CreatePatientRequest(PatientCreate):
    pass


class UpdatePatientRequest(BaseModel):
    patient_id: str
    changes: dict[str, Any]


