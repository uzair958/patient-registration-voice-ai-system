import React from 'react';
import type { Patient } from '../types/patient';

interface PatientTableProps {
  patients: Patient[] | null;
  loading: boolean;
  error: string | null;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const getSexBadgeClass = (sex: string) => {
    switch (sex) {
      case 'Male':
        return 'badge-sex-male';
      case 'Female':
        return 'badge-sex-female';
      case 'Other':
        return 'badge-sex-other';
      default:
        return 'badge-sex-decline';
    }
  };

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p className="state-title" style={{ marginTop: '12px' }}>Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <div className="confirm-icon" style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-bg)', display: 'inline-flex', fontSize: '24px', width: '48px', height: '48px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>!</div>
        <p className="state-title" style={{ color: 'var(--danger)', marginTop: '12px' }}>{error}</p>
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="state-container">
        <p className="state-title">No patients found.</p>
        <p className="state-desc" style={{ marginTop: '4px' }}>Try modifying your search criteria or register a new patient.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="patient-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Phone</th>
            <th>Date of Birth</th>
            <th>Sex</th>
            <th>Email</th>
            <th>City</th>
            <th>State</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.patient_id}>
              <td>
                <div className="patient-cell-name">
                  {patient.first_name} {patient.last_name}
                </div>
              </td>
              <td>{patient.phone_number}</td>
              <td>{formatDate(patient.date_of_birth)}</td>
              <td>
                <span className={`badge ${getSexBadgeClass(patient.sex)}`}>
                  {patient.sex}
                </span>
              </td>
              <td>{patient.email || '-'}</td>
              <td>{patient.city}</td>
              <td>{patient.state}</td>
              <td>{formatDateTime(patient.created_at)}</td>
              <td>
                <div className="table-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onView(patient)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(patient)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(patient)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
