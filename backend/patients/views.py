from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Patient
from .serializers import PatientSerializer


class PatientListCreateView(APIView):
    """
    GET  /patients
    POST /patients
    """

    def get(self, request):
        patients = Patient.objects.filter(
            deleted_at__isnull=True
        )

        last_name = request.query_params.get("last_name")
        date_of_birth = request.query_params.get("date_of_birth")
        phone_number = request.query_params.get("phone_number")

        if last_name:
            patients = patients.filter(
                last_name__iexact=last_name
            )

        if date_of_birth:
            patients = patients.filter(
                date_of_birth=date_of_birth
            )

        if phone_number:
            patients = patients.filter(
                phone_number=phone_number
            )

        serializer = PatientSerializer(
            patients,
            many=True,
        )

        return Response(
            {
                "data": serializer.data,
                "error": None,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = PatientSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                {
                    "data": None,
                    "error": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        patient = serializer.save()

        return Response(
            {
                "data": PatientSerializer(patient).data,
                "error": None,
            },
            status=status.HTTP_201_CREATED,
        )


class PatientDetailView(APIView):
    """
    GET    /patients/<uuid>
    PUT    /patients/<uuid>
    DELETE /patients/<uuid>
    """

    def get_patient(self, patient_id):
        try:
            return Patient.objects.get(
                patient_id=patient_id,
                deleted_at__isnull=True,
            )
        except Patient.DoesNotExist:
            return None

    def get(self, request, patient_id):
        patient = self.get_patient(patient_id)

        if patient is None:
            return Response(
                {
                    "data": None,
                    "error": "Patient not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PatientSerializer(patient)

        return Response(
            {
                "data": serializer.data,
                "error": None,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, patient_id):
        patient = self.get_patient(patient_id)

        if patient is None:
            return Response(
                {
                    "data": None,
                    "error": "Patient not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PatientSerializer(
            patient,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                {
                    "data": None,
                    "error": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        patient = serializer.save()

        return Response(
            {
                "data": PatientSerializer(patient).data,
                "error": None,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, patient_id):
        patient = self.get_patient(patient_id)

        if patient is None:
            return Response(
                {
                    "data": None,
                    "error": "Patient not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        patient.deleted_at = timezone.now()

        patient.save(
            update_fields=[
                "deleted_at",
                "updated_at",
            ]
        )

        return Response(
            {
                "data": {
                    "patient_id": str(patient.patient_id),
                    "deleted": True,
                },
                "error": None,
            },
            status=status.HTTP_200_OK,
        )
