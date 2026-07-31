import httpx

from app.core.config import settings
from app.schemas.patient import PatientCreate


class PatientService:
    def __init__(self):
        self.base_url = settings.django_api_url.rstrip("/")

    async def create_patient(self, patient: PatientCreate):
        async with httpx.AsyncClient() as client:
            return await client.post(
                f"{self.base_url}/patients",
                json=patient.model_dump(mode="json"),
                timeout=10.0,
            )

    async def find_patient_by_phone(self, phone_number: str):
        async with httpx.AsyncClient() as client:
            return await client.get(
                f"{self.base_url}/patients",
                params={"phone_number": phone_number},
                timeout=10.0,
            )

    async def update_patient(
        self,
        patient_id: str,
        patient_data: dict,
    ):
        async with httpx.AsyncClient() as client:
            return await client.put(
                f"{self.base_url}/patients/{patient_id}",
                json=patient_data,
                timeout=10.0,
            )


patient_service = PatientService()