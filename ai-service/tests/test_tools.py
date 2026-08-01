import httpx
import json
import pytest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def mock_response(status_code: int, json_data: dict):
    return httpx.Response(
        status_code=status_code,
        json=json_data,
    )


def vapi_payload(name: str, arguments: dict):
    return {
        "message": {
            "type": "tool-calls",
            "toolWithToolCallList": [
                {
                    "tool": {},
                    "toolCall": {
                        "id": "call_123",
                        "type": "function",
                        "function": {
                            "name": name,
                            "arguments": arguments,
                        },
                    },
                }
            ],
        }
    }


class TestLookupPatient:

    @patch(
        "app.api.tools.patient_service.find_patient_by_phone",
        new_callable=AsyncMock,
    )
    def test_lookup_existing_patient(
        self,
        mock_lookup,
    ):
        mock_lookup.return_value = mock_response(
            200,
            {
                "data": [
                    {
                        "patient_id": "123",
                        "first_name": "John",
                        "last_name": "Smith",
                    }
                ],
                "error": None,
            },
        )

        response = client.post(
            "/tools/patient/lookup",
            json=vapi_payload("lookup_patient", {
                "phone_number": "4155551234",
            }),
        )

        assert response.status_code == 200

        result = response.json()["results"][0]["result"]

        assert "found: true" in result
        assert "patient_id: 123" in result
        assert "first_name: John" in result
        assert "last_name: Smith" in result

        mock_lookup.assert_awaited_once_with(
            "4155551234"
        )

    @patch(
        "app.api.tools.patient_service.find_patient_by_phone",
        new_callable=AsyncMock,
    )
    def test_lookup_nonexistent_patient(
        self,
        mock_lookup,
    ):
        mock_lookup.return_value = mock_response(
            200,
            {
                "data": [],
                "error": None,
            },
        )

        response = client.post(
            "/tools/patient/lookup",
            json=vapi_payload("lookup_patient", {
                "phone_number": "4155551234",
            }),
        )

        assert response.status_code == 200

        result = response.json()["results"][0]["result"]

        assert result == "found: false"

    @patch(
        "app.api.tools.patient_service.find_patient_by_phone",
        new_callable=AsyncMock,
    )
    def test_lookup_django_failure(
        self,
        mock_lookup,
    ):
        mock_lookup.return_value = mock_response(
            500,
            {
                "data": None,
                "error": "Internal server error",
            },
        )

        response = client.post(
            "/tools/patient/lookup",
            json=vapi_payload("lookup_patient", {
                "phone_number": "4155551234",
            }),
        )

        assert response.status_code == 200

        result = response.json()["results"][0]["result"]

        assert result == "error: Unable to query patient records."

    @patch(
        "app.api.tools.patient_service.find_patient_by_phone",
        new_callable=AsyncMock,
    )
    def test_lookup_service_unavailable(
        self,
        mock_lookup,
    ):
        mock_lookup.side_effect = httpx.RequestError(
            "Connection failed"
        )

        response = client.post(
            "/tools/patient/lookup",
            json=vapi_payload("lookup_patient", {
                "phone_number": "4155551234",
            }),
        )

        assert response.status_code == 200

        result = response.json()["results"][0]["result"]

        assert result == "error: Patient service temporarily unavailable."


class TestCreatePatient:

    @pytest.fixture
    def valid_patient(self):
        return {
            "first_name": "John",
            "last_name": "Smith",
            "date_of_birth": "1985-07-20",
            "sex": "Male",
            "phone_number": "4155551234",
            "email": "john@example.com",
            "address_line_1": "100 Market Street",
            "city": "San Francisco",
            "state": "CA",
            "zip_code": "94105",
        }

    @patch(
        "app.api.tools.patient_service.create_patient",
        new_callable=AsyncMock,
    )
    def test_create_patient_success(
        self,
        mock_create,
        valid_patient,
    ):
        mock_create.return_value = mock_response(
            201,
            {
                "data": {
                    "patient_id": "123",
                },
                "error": None,
            },
        )

        response = client.post(
            "/tools/patient/create",
            json=vapi_payload("create_patient", valid_patient),
        )

        assert response.status_code == 200

        result = response.json()["results"][0]["result"]

        assert result == "success: true, patient_id: 123"
        

    @patch(
        "app.api.tools.patient_service.create_patient",
        new_callable=AsyncMock,
    )
    def test_create_patient_django_validation_error(
        self,
        mock_create,
        valid_patient,
    ):
        mock_create.return_value = mock_response(
            400,
            {
                "data": None,
                "error": {
                    "phone_number": [
                        "An active patient with this phone number already exists."
                    ]
                },
            },
        )

        response = client.post(
            "/tools/patient/create",
            json=vapi_payload("create_patient", valid_patient),
        )

        assert response.status_code == 200

        result = response.json()["results"][0]["result"]

        assert result.startswith("error:")
        assert "phone_number" in result


class TestUpdatePatient:

    @patch(
        "app.api.tools.patient_service.update_patient",
        new_callable=AsyncMock,
    )
    def test_update_patient_success(
        self,
        mock_update,
    ):
        mock_update.return_value = mock_response(
            200,
            {
                "data": {
                    "patient_id": "123",
                },
                "error": None,
            },
        )

        response = client.post(
            "/tools/patient/update",
            json=vapi_payload("update_patient", {
                "patient_id": "123",
                "changes": {
                    "email": "updated@example.com",
                },
            }),
        )

        assert response.status_code == 200

        result = response.json()["results"][0]["result"]

        assert result == "success: true, patient_id: 123"
        

    @patch(
        "app.api.tools.patient_service.update_patient",
        new_callable=AsyncMock,
    )
    def test_update_patient_not_found(
        self,
        mock_update,
    ):
        mock_update.return_value = mock_response(
            404,
            {
                "data": None,
                "error": "Patient not found.",
            },
        )

        response = client.post(
            "/tools/patient/update",
            json=vapi_payload("update_patient", {
                "patient_id": "123",
                "changes": {
                    "email": "updated@example.com",
                },
            }),
        )

        assert response.status_code == 200

        result = response.json()["results"][0]["result"]

        assert result.startswith("error:")
        assert "Patient not found" in result
