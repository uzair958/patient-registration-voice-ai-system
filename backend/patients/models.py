import uuid

from django.core.validators import RegexValidator
from django.db import models


class Patient(models.Model):
    class SexChoices(models.TextChoices):
        MALE = "Male", "Male"
        FEMALE = "Female", "Female"
        OTHER = "Other", "Other"
        DECLINE = "Decline to Answer", "Decline to Answer"

    patient_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    date_of_birth = models.DateField()

    sex = models.CharField(
        max_length=20,
        choices=SexChoices.choices,
    )

    phone_number = models.CharField(
        max_length=10,
    )

    email = models.EmailField(
        blank=True,
        null=True,
    )

    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    city = models.CharField(max_length=100)

    state = models.CharField(
        max_length=2,
    )

    zip_code = models.CharField(
        max_length=10,
    )

    insurance_provider = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    insurance_member_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    preferred_language = models.CharField(
        max_length=100,
        default="English",
    )

    emergency_contact_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    emergency_contact_phone = models.CharField(
        max_length=10,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    deleted_at = models.DateTimeField(
    null=True,
    blank=True,
)

    class Meta:
        db_table = "patients"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"