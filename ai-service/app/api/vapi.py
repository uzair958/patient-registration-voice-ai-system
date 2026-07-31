from fastapi import APIRouter, HTTPException

from app.schemas.patient import PatientCreate
from app.services.patient_service import patient_service
from typing import Any

router = APIRouter(prefix="/internal", tags=["Internal"])


@router.post("/patients")
async def create_patient(patient: PatientCreate):
    response = await patient_service.create_patient(patient)

    if response.status_code != 201:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json(),
        )

    return response.json()

@router.get("/patients/by-phone")
async def find_patient_by_phone(phone_number: str):
    response = await patient_service.find_patient_by_phone(phone_number)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json(),
        )

    return response.json()

@router.put("/patients/{patient_id}")
async def update_patient(
    patient_id: str,
    patient_data: dict[str, Any],
):
    response = await patient_service.update_patient(
        patient_id,
        patient_data,
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.json(),
        )

    return response.json()