import time
import logging
import httpx

from app.core.config import settings
from app.schemas.patient import PatientCreate

logger = logging.getLogger(__name__)


class PatientService:
    def __init__(self):
        self.base_url = settings.django_api_url.rstrip("/")
        # Configure robust timeouts resilient to Render cold starts.
        # 45s read timeout gives Django enough time to wake up.
        self.timeout = httpx.Timeout(
            connect=15.0,
            read=45.0,
            write=15.0,
            pool=15.0,
        )

    async def create_patient(self, patient: PatientCreate):
        start_time = time.time()
        logger.info("Django API request started: POST /patients")
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/patients",
                    json=patient.model_dump(mode="json"),
                )
                elapsed = time.time() - start_time
                logger.info("Django API response received in %.2fs: status=%s", elapsed, response.status_code)
                return response
            except Exception as e:
                elapsed = time.time() - start_time
                logger.error("Django API request failed after %.2fs: %s", elapsed, str(e))
                raise

    async def find_patient_by_phone(self, phone_number: str):
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            return await client.get(
                f"{self.base_url}/patients",
                params={"phone_number": phone_number},
            )

    async def update_patient(
        self,
        patient_id: str,
        patient_data: dict,
    ):
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            return await client.put(
                f"{self.base_url}/patients/{patient_id}",
                json=patient_data,
            )


patient_service = PatientService()