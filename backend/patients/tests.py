
import uuid
from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Patient


class PatientAPITests(APITestCase):

    def setUp(self):
        self.patient_data = {
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

    def create_patient(self):
        url = reverse("patient-list-create")

        response = self.client.post(
            url,
            self.patient_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        return response

    def test_create_patient(self):
        response = self.create_patient()

        self.assertEqual(
            response.data["error"],
            None,
        )

        self.assertIn(
            "patient_id",
            response.data["data"],
        )

        self.assertEqual(
            Patient.objects.count(),
            1,
        )

    def test_get_patients(self):
        self.create_patient()

        url = reverse("patient-list-create")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["data"]),
            1,
        )

    def test_lookup_patient_by_phone(self):
        self.create_patient()

        url = reverse("patient-list-create")

        response = self.client.get(
            url,
            {"phone_number": "4155551234"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["data"]),
            1,
        )

    def test_duplicate_active_phone_rejected(self):
        self.create_patient()

        url = reverse("patient-list-create")

        response = self.client.post(
            url,
            self.patient_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "phone_number",
            response.data["error"],
        )

    def test_update_patient(self):
        response = self.create_patient()

        patient_id = response.data["data"]["patient_id"]

        url = reverse(
            "patient-detail",
            kwargs={"patient_id": patient_id},
        )

        response = self.client.put(
            url,
            {
                "email": "updated@example.com",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["data"]["email"],
            "updated@example.com",
        )

    def test_soft_delete_patient(self):
        response = self.create_patient()

        patient_id = response.data["data"]["patient_id"]

        url = reverse(
            "patient-detail",
            kwargs={"patient_id": patient_id},
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(
            response.data["data"]["deleted"]
        )

        patient = Patient.objects.get(
            patient_id=patient_id
        )

        self.assertIsNotNone(
            patient.deleted_at
        )

    def test_deleted_patient_not_returned(self):
        response = self.create_patient()

        patient_id = response.data["data"]["patient_id"]

        url = reverse(
            "patient-detail",
            kwargs={"patient_id": patient_id},
        )

        self.client.delete(url)

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_deleted_patient_not_in_list(self):
        response = self.create_patient()

        patient_id = response.data["data"]["patient_id"]

        detail_url = reverse(
            "patient-detail",
            kwargs={"patient_id": patient_id},
        )

        list_url = reverse("patient-list-create")

        self.client.delete(detail_url)

        response = self.client.get(list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["data"],
            [],
     
        )