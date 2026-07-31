import re
from datetime import date

from rest_framework import serializers

from .models import Patient


US_STATE_ABBREVIATIONS = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL",
    "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
    "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE",
    "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
    "VA", "WA", "WV", "WI", "WY",
}


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "patient_id",
            "first_name",
            "last_name",
            "date_of_birth",
            "sex",
            "phone_number",
            "email",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "zip_code",
            "insurance_provider",
            "insurance_member_id",
            "preferred_language",
            "emergency_contact_name",
            "emergency_contact_phone",
            "created_at",
            "updated_at",
            "deleted_at",
        ]
        read_only_fields = [
            "patient_id",
            "created_at",
            "updated_at",
            "deleted_at",
        ]

    def validate_first_name(self, value):
        if not re.fullmatch(r"[A-Za-z]+(?:[-'][A-Za-z]+)*", value):
            raise serializers.ValidationError(
                "First name may only contain letters, hyphens, and apostrophes."
            )

        return value

    def validate_last_name(self, value):
        if not re.fullmatch(r"[A-Za-z]+(?:[-'][A-Za-z]+)*", value):
            raise serializers.ValidationError(
                "Last name may only contain letters, hyphens, and apostrophes."
            )

        return value

    def validate_date_of_birth(self, value):
        if value > date.today():
            raise serializers.ValidationError(
                "Date of birth cannot be in the future."
            )

        return value

    def validate_phone_number(self, value):
        if not re.fullmatch(r"\d{10}", value):
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        return value

    def validate_emergency_contact_phone(self, value):
     if value is None:
        return value

     if not re.fullmatch(r"\d{10}", value):
        raise serializers.ValidationError(
            "Emergency contact phone must contain exactly 10 digits."
        )

     return value

    def validate_state(self, value):
        value = value.upper()

        if value not in US_STATE_ABBREVIATIONS:
            raise serializers.ValidationError(
                "State must be a valid 2-letter US state abbreviation."
            )

        return value

    def validate_zip_code(self, value):
        if not re.fullmatch(r"\d{5}(?:-\d{4})?", value):
            raise serializers.ValidationError(
                "ZIP code must be 5 digits or ZIP+4 format."
            )

        return value

    def validate_phone_number(self, value):
       queryset = Patient.objects.filter(
        phone_number=value,
        deleted_at__isnull=True,
    )

       if self.instance:
        queryset = queryset.exclude(
            patient_id=self.instance.patient_id
        )

       if queryset.exists():
        raise serializers.ValidationError(
            "An active patient with this phone number already exists."
        )

       return value