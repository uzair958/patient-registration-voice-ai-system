from fastapi import APIRouter, HTTPException

from app.schemas.tools import (
    CreatePatientRequest,
    LookupPatientRequest,
    UpdatePatientRequest,
)
from app.services.patient_service import patient_service
import logging
import httpx

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/tools/patient",
    tags=["Patient Tools"],
)


@router.post("/lookup")
async def lookup_patient(request: LookupPatientRequest):
    logger.info(
        "Looking up patient by phone=%s",
        request.phone_number,
    )

    try:
        response = await patient_service.find_patient_by_phone(
            request.phone_number
        )

    except httpx.TimeoutException:
        logger.exception("Django API timeout during patient lookup")

        return {
            "found": False,
            "patient": None,
            "error": "Patient service temporarily unavailable.",
        }

    except httpx.RequestError:
        logger.exception("Django API request failed")

        return {
            "found": False,
            "patient": None,
            "error": "Patient service temporarily unavailable.",
        }

    if response.status_code != 200:
        logger.warning(
            "Patient lookup failed: status=%s",
            response.status_code,
        )

        return {
            "found": False,
            "patient": None,
            "error": "Unable to query patient records.",
        }

    payload = response.json()
    patients = payload.get("data", [])

    if not patients:
        logger.info("No patient found")

        return {
            "found": False,
            "patient": None,
            "error": None,
        }

    patient = patients[0]

    logger.info(
        "Patient found: patient_id=%s",
        patient["patient_id"],
    )

    return {
        "found": True,
        "patient": {
            "patient_id": patient["patient_id"],
            "first_name": patient["first_name"],
            "last_name": patient["last_name"],
        },
        "error": None,
    }


@router.post("/create")
async def create_patient(request: CreatePatientRequest):
    logger.info(
        "Creating patient with phone=%s",
        request.phone_number,
    )

    try:
        response = await patient_service.create_patient(request)

    except httpx.TimeoutException:
        logger.exception("Django API timeout during patient creation")

        return {
            "success": False,
            "error": "Patient service temporarily unavailable.",
        }

    except httpx.RequestError:
        logger.exception("Django API request failed")

        return {
            "success": False,
            "error": "Patient service temporarily unavailable.",
        }

    if response.status_code != 201:
        logger.warning(
            "Patient creation failed: status=%s",
            response.status_code,
        )

        return {
            "success": False,
            "error": response.json(),
        }

    payload = response.json()

    logger.info(
        "Patient created successfully: patient_id=%s",
        payload["data"]["patient_id"],
    )

    return {
        "success": True,
        "patient_id": payload["data"]["patient_id"],
    }


@router.post("/update")
async def update_patient(request: UpdatePatientRequest):
    logger.info(
        "Updating patient: patient_id=%s",
        request.patient_id,
    )

    try:
        response = await patient_service.update_patient(
            request.patient_id,
            request.changes,
        )

    except httpx.TimeoutException:
        logger.exception("Django API timeout during patient update")

        return {
            "success": False,
            "error": "Patient service temporarily unavailable.",
        }

    except httpx.RequestError:
        logger.exception("Django API request failed")

        return {
            "success": False,
            "error": "Patient service temporarily unavailable.",
        }

    if response.status_code != 200:
        logger.warning(
            "Patient update failed: status=%s",
            response.status_code,
        )

        return {
            "success": False,
            "error": response.json(),
        }

    payload = response.json()

    logger.info(
        "Patient updated successfully: patient_id=%s",
        payload["data"]["patient_id"],
    )

    return {
        "success": True,
        "patient_id": payload["data"]["patient_id"],
    }