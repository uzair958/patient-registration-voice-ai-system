import type { ApiResponse, Patient, PatientCreateRequest, PatientUpdateRequest } from '../types/patient';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function getPatients(filters?: {
  last_name?: string;
  date_of_birth?: string;
  phone_number?: string;
}): Promise<ApiResponse<Patient[]>> {
  const url = new URL(`${BASE_URL}/patients`);
  
  if (filters) {
    if (filters.last_name) {
      url.searchParams.append('last_name', filters.last_name);
    }
    if (filters.date_of_birth) {
      url.searchParams.append('date_of_birth', filters.date_of_birth);
    }
    if (filters.phone_number) {
      url.searchParams.append('phone_number', filters.phone_number);
    }
  }

  try {
    const response = await fetch(url.toString());
    const result = await response.json();
    if (!response.ok) {
      return {
        data: null,
        error: result.error || 'Unable to load patient records. Please try again.',
      };
    }
    return {
      data: result.data || [],
      error: null,
    };
  } catch (err) {
    console.error('API Error in getPatients:', err);
    return {
      data: null,
      error: 'Unable to load patient records. Please try again.',
    };
  }
}

export async function getPatient(id: string): Promise<ApiResponse<Patient>> {
  try {
    const response = await fetch(`${BASE_URL}/patients/${id}`);
    const result = await response.json();
    if (!response.ok) {
      return {
        data: null,
        error: result.error || 'Failed to fetch patient details.',
      };
    }
    return {
      data: result.data,
      error: null,
    };
  } catch (err) {
    console.error('API Error in getPatient:', err);
    return {
      data: null,
      error: 'Failed to fetch patient details.',
    };
  }
}

export async function createPatient(patient: PatientCreateRequest): Promise<ApiResponse<Patient>> {
  try {
    const response = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patient),
    });
    const result = await response.json();
    if (!response.ok) {
      return {
        data: null,
        error: result.error || 'Failed to create patient.',
      };
    }
    return {
      data: result.data,
      error: null,
    };
  } catch (err) {
    console.error('API Error in createPatient:', err);
    return {
      data: null,
      error: 'Failed to create patient.',
    };
  }
}

export async function updatePatient(
  id: string,
  changes: PatientUpdateRequest
): Promise<ApiResponse<Patient>> {
  try {
    const response = await fetch(`${BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes),
    });
    const result = await response.json();
    if (!response.ok) {
      return {
        data: null,
        error: result.error || 'Failed to update patient.',
      };
    }
    return {
      data: result.data,
      error: null,
    };
  } catch (err) {
    console.error('API Error in updatePatient:', err);
    return {
      data: null,
      error: 'Failed to update patient.',
    };
  }
}

export async function deletePatient(
  id: string
): Promise<ApiResponse<{ patient_id: string; deleted: boolean }>> {
  try {
    const response = await fetch(`${BASE_URL}/patients/${id}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (!response.ok) {
      return {
        data: null,
        error: result.error || 'Failed to delete patient.',
      };
    }
    return {
      data: result.data,
      error: null,
    };
  } catch (err) {
    console.error('API Error in deletePatient:', err);
    return {
      data: null,
      error: 'Failed to delete patient.',
    };
  }
}
