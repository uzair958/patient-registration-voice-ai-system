import React from 'react';
import type { Patient } from '../types/patient';

interface PatientDetailsProps {
  patient: Patient;
  onClose: () => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, onClose }) => {
  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Patient Details</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            {/* Personal Information */}
            <div className="detail-section">
              <h3 className="detail-section-title">Personal Information</h3>
              <div className="detail-item-list">
                <div className="detail-item">
                  <span className="detail-label">First Name:</span>
                  <span className="detail-val">{patient.first_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name:</span>
                  <span className="detail-val">{patient.last_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date of Birth:</span>
                  <span className="detail-val">{formatDate(patient.date_of_birth)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sex:</span>
                  <span className="detail-val">{patient.sex}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-val">{patient.phone_number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-val">{patient.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="detail-section">
              <h3 className="detail-section-title">Address</h3>
              <div className="detail-item-list">
                <div className="detail-item">
                  <span className="detail-label">Address Line 1:</span>
                  <span className="detail-val">{patient.address_line_1}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address Line 2:</span>
                  <span className="detail-val">{patient.address_line_2 || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">City:</span>
                  <span className="detail-val">{patient.city}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">State:</span>
                  <span className="detail-val">{patient.state}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ZIP Code:</span>
                  <span className="detail-val">{patient.zip_code}</span>
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="detail-section">
              <h3 className="detail-section-title">Insurance</h3>
              <div className="detail-item-list">
                <div className="detail-item">
                  <span className="detail-label">Insurance Provider:</span>
                  <span className="detail-val">{patient.insurance_provider || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Member ID:</span>
                  <span className="detail-val">{patient.insurance_member_id || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="detail-section">
              <h3 className="detail-section-title">Additional Information</h3>
              <div className="detail-item-list">
                <div className="detail-item">
                  <span className="detail-label">Preferred Language:</span>
                  <span className="detail-val">{patient.preferred_language || 'English'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Emergency Contact:</span>
                  <span className="detail-val">{patient.emergency_contact_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Emergency Phone:</span>
                  <span className="detail-val">{patient.emergency_contact_phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="detail-section detail-section-full">
              <h3 className="detail-section-title">System Information</h3>
              <div className="detail-item-list">
                <div className="detail-item">
                  <span className="detail-label">Patient ID:</span>
                  <span className="detail-val">{patient.patient_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created At:</span>
                  <span className="detail-val">{formatDateTime(patient.created_at)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Updated At:</span>
                  <span className="detail-val">{formatDateTime(patient.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
