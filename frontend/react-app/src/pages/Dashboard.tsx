import React, { useState, useEffect } from 'react';
import type { Patient } from '../types/patient';
import { getPatients, createPatient, updatePatient, deletePatient } from '../api/patients';
import { SearchFilters } from '../components/SearchFilters';
import { PatientTable } from '../components/PatientTable';
import { PatientForm } from '../components/PatientForm';
import { PatientDetails } from '../components/PatientDetails';
import { ToastContainer, type ToastMessage } from '../components/Toast';

export const Dashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    last_name: '',
    date_of_birth: '',
    phone_number: '',
  });

  // Modal & Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activePatient, setActivePatient] = useState<Patient | null>(null); // for editing/viewing
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  // Validation/Error states
  const [serverValidationErrors, setServerValidationErrors] = useState<Record<string, string[]> | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load patients list on mount or filter change
  const loadPatients = async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    const res = await getPatients(currentFilters);
    if (res.error) {
      setError(typeof res.error === 'string' ? res.error : 'Unable to load patient records. Please try again.');
      setPatients(null);
    } else {
      setPatients(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Toast actions
  const addToast = (text: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Search actions
  const handleSearch = (newFilters: typeof filters) => {
    setFilters(newFilters);
    loadPatients(newFilters);
  };

  const handleClearSearch = () => {
    const cleared = { last_name: '', date_of_birth: '', phone_number: '' };
    setFilters(cleared);
    loadPatients(cleared);
  };

  // Save/Edit action
  const handleSavePatient = async (payload: any): Promise<boolean> => {
    setServerValidationErrors(null);
    if (activePatient) {
      // Edit Mode
      const res = await updatePatient(activePatient.patient_id, payload);
      if (res.error) {
        if (typeof res.error === 'object') {
          setServerValidationErrors(res.error as Record<string, string[]>);
        } else {
          addToast(res.error as string, 'error');
        }
        return false;
      } else {
        addToast('Patient record updated successfully.', 'success');
        setIsFormOpen(false);
        setActivePatient(null);
        loadPatients();
        return true;
      }
    } else {
      // Create Mode
      const res = await createPatient(payload);
      if (res.error) {
        if (typeof res.error === 'object') {
          setServerValidationErrors(res.error as Record<string, string[]>);
        } else {
          addToast(res.error as string, 'error');
        }
        return false;
      } else {
        addToast(`Patient registered successfully. ID: ${res.data?.patient_id}`, 'success');
        setIsFormOpen(false);
        loadPatients();
        return true;
      }
    }
  };

  // Delete actions
  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    const res = await deletePatient(patientToDelete.patient_id);
    if (res.error) {
      addToast(typeof res.error === 'string' ? res.error : 'Failed to delete patient.', 'error');
    } else {
      addToast('Patient removed successfully.', 'success');
      setPatientToDelete(null);
      loadPatients();
    }
  };

  // Total active patients count
  const activeCount = patients ? patients.length : 0;

  return (
    <div className="app-container">
      {/* Header section */}
      <header className="header">
        <div className="header-title-section">
          <h1>AI Patient Registration System</h1>
          <p>Manage clinical patient files, demographic data, and contact logs.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="active-badge">
            <span>●</span> Active Records: {activeCount}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setActivePatient(null);
              setServerValidationErrors(null);
              setIsFormOpen(true);
            }}
          >
            + Add Patient
          </button>
        </div>
      </header>

      {/* Main dashboard body */}
      <main className="dashboard-card">
        {/* Search components */}
        <SearchFilters onSearch={handleSearch} onClear={handleClearSearch} />

        {/* Table list components */}
        <PatientTable
          patients={patients}
          loading={loading}
          error={error}
          onView={(p) => {
            setActivePatient(p);
            setIsDetailsOpen(true);
          }}
          onEdit={(p) => {
            setActivePatient(p);
            setServerValidationErrors(null);
            setIsFormOpen(true);
          }}
          onDelete={(p) => {
            setPatientToDelete(p);
          }}
        />
      </main>

      {/* Forms Modal (Create/Edit) */}
      {isFormOpen && (
        <PatientForm
          patient={activePatient}
          onSave={handleSavePatient}
          onClose={() => {
            setIsFormOpen(false);
            setActivePatient(null);
            setServerValidationErrors(null);
          }}
          serverValidationErrors={serverValidationErrors}
          clearServerErrors={() => setServerValidationErrors(null)}
        />
      )}

      {/* Details View Modal */}
      {isDetailsOpen && activePatient && (
        <PatientDetails
          patient={activePatient}
          onClose={() => {
            setIsDetailsOpen(false);
            setActivePatient(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {patientToDelete && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="modal-close-btn" onClick={() => setPatientToDelete(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body confirm-content">
              <div className="confirm-icon">⚠</div>
              <p style={{ fontWeight: '650', fontSize: '15px' }}>
                Are you sure you want to remove this patient?
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Removing <strong>{patientToDelete.first_name} {patientToDelete.last_name}</strong> will soft-delete their record from active registers.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setPatientToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts list */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
