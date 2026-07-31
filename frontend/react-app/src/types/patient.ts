export interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
  sex: 'Male' | 'Female' | 'Other' | 'Decline to Answer';
  phone_number: string;
  email?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  insurance_provider?: string | null;
  insurance_member_id?: string | null;
  preferred_language: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type PatientCreateRequest = Omit<
  Patient,
  'patient_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type PatientUpdateRequest = Partial<PatientCreateRequest>;

export interface ApiResponse<T> {
  data: T | null;
  error: string | Record<string, string[]> | null;
}
