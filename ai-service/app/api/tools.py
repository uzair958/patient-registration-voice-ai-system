from fastapi import APIRouter, HTTPException

from app.schemas.tools import (
    CreatePatientRequest,
    LookupPatientRequest,
    UpdatePatientRequest,
)
from app.services.patient_service import patient_service
import json
import logging
import httpx

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/tools/patient",
    tags=["Patient Tools"],
)


async def handle_lookup(request: LookupPatientRequest) -> str:
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
        return "error: Patient service temporarily unavailable."

    except httpx.RequestError:
        logger.exception("Django API request failed")
        return "error: Patient service temporarily unavailable."

    if response.status_code != 200:
        logger.warning(
            "Patient lookup failed: status=%s",
            response.status_code,
        )
        return "error: Unable to query patient records."

    payload = response.json()
    patients = payload.get("data", [])

    if not patients:
        logger.info("No patient found")
        return "found: false"

    patient = patients[0]

    logger.info(
        "Patient found: patient_id=%s",
        patient["patient_id"],
    )

    return (
        f"found: true, "
        f"patient_id: {patient['patient_id']}, "
        f"first_name: {patient['first_name']}, "
        f"last_name: {patient['last_name']}"
    )


from fastapi import Request

@router.post("/lookup")
async def lookup_patient(request: Request):
    payload = await request.json()
    results = []
    
    tool_calls = payload.get("message", {}).get("toolWithToolCallList", [])
    for item in tool_calls:
        tool_call = item.get("toolCall", {})
        tool_call_id = tool_call.get("id")
        func = tool_call.get("function", {})
        args = func.get("arguments", {})
        
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                args = {}

        try:
            req_model = LookupPatientRequest(**args)
            result = await handle_lookup(req_model)
            results.append({"toolCallId": tool_call_id, "result": result})
        except Exception as e:
            results.append({"toolCallId": tool_call_id, "result": f"error: {e}"})
            
    return {"results": results}


@router.post("/create-debug")
async def create_patient_debug(request: Request):
    payload = await request.json()

    logger.info("RAW CREATE PAYLOAD: %s", payload)

    return {
        "received": True,
        "payload": payload,
    }


async def handle_create(request: CreatePatientRequest) -> str:
    logger.info("Create patient payload received: %s", request.model_dump(mode="json"))

    try:
        response = await patient_service.create_patient(request)

    except httpx.TimeoutException:
        logger.exception("Django API timeout during patient creation")
        return "error: Patient service temporarily unavailable."

    except httpx.RequestError:
        logger.exception("Django API request failed")
        return "error: Patient service temporarily unavailable."

    if response.status_code != 201:
        logger.warning(
            "Patient creation failed: status=%s",
            response.status_code,
        )
        error_detail = response.json()
        return f"error: {error_detail}"

    payload = response.json()
    patient_id = payload["data"]["patient_id"]

    logger.info(
        "Patient created successfully: patient_id=%s",
        patient_id,
    )

    return f"success: true, patient_id: {patient_id}"


@router.post("/create")
async def create_patient(request: Request):
    payload = await request.json()
    results = []
    
    tool_calls = payload.get("message", {}).get("toolWithToolCallList", [])
    for item in tool_calls:
        tool_call = item.get("toolCall", {})
        tool_call_id = tool_call.get("id")
        func = tool_call.get("function", {})
        args = func.get("arguments", {})
        
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                args = {}

        try:
            req_model = CreatePatientRequest(**args)
            result = await handle_create(req_model)
            results.append({"toolCallId": tool_call_id, "result": result})
        except Exception as e:
            results.append({"toolCallId": tool_call_id, "result": f"error: {e}"})
            
    return {"results": results}


async def handle_update(request: UpdatePatientRequest) -> str:
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
        return "error: Patient service temporarily unavailable."

    except httpx.RequestError:
        logger.exception("Django API request failed")
        return "error: Patient service temporarily unavailable."

    if response.status_code != 200:
        logger.warning(
            "Patient update failed: status=%s",
            response.status_code,
        )
        error_detail = response.json()
        return f"error: {error_detail}"

    payload = response.json()
    patient_id = payload["data"]["patient_id"]

    logger.info(
        "Patient updated successfully: patient_id=%s",
        patient_id,
    )

    return f"success: true, patient_id: {patient_id}"


@router.post("/update")
async def update_patient(request: Request):
    payload = await request.json()
    results = []
    
    tool_calls = payload.get("message", {}).get("toolWithToolCallList", [])
    for item in tool_calls:
        tool_call = item.get("toolCall", {})
        tool_call_id = tool_call.get("id")
        func = tool_call.get("function", {})
        args = func.get("arguments", {})
        
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                args = {}

        try:
            req_model = UpdatePatientRequest(**args)
            result = await handle_update(req_model)
            results.append({"toolCallId": tool_call_id, "result": result})
        except Exception as e:
            results.append({"toolCallId": tool_call_id, "result": f"error: {e}"})
            
    return {"results": results}