import React, { useState, useEffect } from 'react';
import type { Patient } from '../types/patient';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const SEX_CHOICES = ['Male', 'Female', 'Other', 'Decline to Answer'];

interface PatientFormProps {
  patient?: Patient | null;
  onSave: (payload: any) => Promise<boolean>;
  onClose: () => void;
  serverValidationErrors?: Record<string, string[]> | null;
  clearServerErrors?: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSave,
  onClose,
  serverValidationErrors,
  clearServerErrors,
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    sex: '',
    phone_number: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    insurance_provider: '',
    insurance_member_id: '',
    preferred_language: 'English',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        date_of_birth: patient.date_of_birth || '',
        sex: patient.sex || '',
        phone_number: patient.phone_number || '',
        email: patient.email || '',
        address_line_1: patient.address_line_1 || '',
        address_line_2: patient.address_line_2 || '',
        city: patient.city || '',
        state: patient.state || '',
        zip_code: patient.zip_code || '',
        insurance_provider: patient.insurance_provider || '',
        insurance_member_id: patient.insurance_member_id || '',
        preferred_language: patient.preferred_language || 'English',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        sex: '',
        phone_number: '',
        email: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        zip_code: '',
        insurance_provider: '',
        insurance_member_id: '',
        preferred_language: 'English',
        emergency_contact_name: '',
        emergency_contact_phone: '',
      });
    }
    setClientErrors({});
  }, [patient]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors for this field as user types
    if (clientErrors[name]) {
      setClientErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
    if (clearServerErrors) {
      clearServerErrors();
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    const requiredFields = [
      'first_name',
      'last_name',
      'date_of_birth',
      'sex',
      'phone_number',
      'address_line_1',
      'city',
      'state',
      'zip_code',
    ];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData].trim() === '') {
        const label = field
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        errors[field] = `${label} is required.`;
      }
    });

    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    if (formData.phone_number) {
      const phoneClean = formData.phone_number.trim();
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phoneClean)) {
        errors.phone_number = 'Phone number must contain exactly 10 digits.';
      }
    }

    if (formData.emergency_contact_phone && formData.emergency_contact_phone.trim() !== '') {
      const phoneClean = formData.emergency_contact_phone.trim();
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phoneClean)) {
        errors.emergency_contact_phone = 'Emergency phone must contain exactly 10 digits.';
      }
    }

    if (formData.zip_code) {
      const zipClean = formData.zip_code.trim();
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(zipClean)) {
        errors.zip_code = 'ZIP code must be 5 digits (e.g. 12345) or ZIP+4 (e.g. 12345-6789).';
      }
    }

    if (formData.state) {
      const stateClean = formData.state.trim().toUpperCase();
      const validStates = US_STATES.map((s) => s.value);
      if (!validStates.includes(stateClean)) {
        errors.state = 'State must be a valid 2-letter U.S. abbreviation.';
      }
    }

    if (formData.date_of_birth) {
      const dobDate = new Date(formData.date_of_birth);
      const today = new Date();
      dobDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (dobDate > today) {
        errors.date_of_birth = 'Date of birth cannot be in the future.';
      }
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {};
      if (patient) {
        // Edit mode: Send only changed fields (partial updates)
        Object.keys(formData).forEach((key) => {
          const val = formData[key as keyof typeof formData] === '' ? null : formData[key as keyof typeof formData];
          const origVal = (patient as any)[key] === '' ? null : (patient as any)[key];
          if (val !== origVal) {
            payload[key] = val;
          }
        });
      } else {
        // Create mode: Send all fields (convert empty to null for optional)
        Object.keys(formData).forEach((key) => {
          const val = formData[key as keyof typeof formData];
          payload[key] = val === '' ? null : val;
        });
      }

      await onSave(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    if (clientErrors[fieldName]) {
      return clientErrors[fieldName];
    }
    if (serverValidationErrors && serverValidationErrors[fieldName]) {
      return serverValidationErrors[fieldName].join(' ');
    }
    return null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{patient ? 'Edit Patient Record' : 'Register New Patient'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Personal Information */}
            <div className="form-section">
              <h3 className="form-section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="first_name">First Name <span className="required">*</span></label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    className={`form-control ${getFieldError('first_name') ? 'is-invalid' : ''}`}
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  {getFieldError('first_name') && (
                    <div className="invalid-feedback">{getFieldError('first_name')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name <span className="required">*</span></label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    className={`form-control ${getFieldError('last_name') ? 'is-invalid' : ''}`}
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                  {getFieldError('last_name') && (
                    <div className="invalid-feedback">{getFieldError('last_name')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth <span className="required">*</span></label>
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    className={`form-control ${getFieldError('date_of_birth') ? 'is-invalid' : ''}`}
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                  />
                  {getFieldError('date_of_birth') && (
                    <div className="invalid-feedback">{getFieldError('date_of_birth')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="sex">Sex <span className="required">*</span></label>
                  <select
                    id="sex"
                    name="sex"
                    className={`form-control ${getFieldError('sex') ? 'is-invalid' : ''}`}
                    value={formData.sex}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Sex --</option>
                    {SEX_CHOICES.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                  {getFieldError('sex') && (
                    <div className="invalid-feedback">{getFieldError('sex')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone_number">Phone Number <span className="required">*</span></label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    className={`form-control ${getFieldError('phone_number') ? 'is-invalid' : ''}`}
                    placeholder="10-digit phone number..."
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                  />
                  {getFieldError('phone_number') && (
                    <div className="invalid-feedback">{getFieldError('phone_number')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-control ${getFieldError('email') ? 'is-invalid' : ''}`}
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {getFieldError('email') && (
                    <div className="invalid-feedback">{getFieldError('email')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="form-section">
              <h3 className="form-section-title">Address</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="address_line_1">Address Line 1 <span className="required">*</span></label>
                  <input
                    id="address_line_1"
                    name="address_line_1"
                    type="text"
                    className={`form-control ${getFieldError('address_line_1') ? 'is-invalid' : ''}`}
                    placeholder="123 Main St"
                    value={formData.address_line_1}
                    onChange={handleChange}
                    required
                  />
                  {getFieldError('address_line_1') && (
                    <div className="invalid-feedback">{getFieldError('address_line_1')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address_line_2">Address Line 2</label>
                  <input
                    id="address_line_2"
                    name="address_line_2"
                    type="text"
                    className={`form-control ${getFieldError('address_line_2') ? 'is-invalid' : ''}`}
                    placeholder="Apt, Suite, Bldg"
                    value={formData.address_line_2}
                    onChange={handleChange}
                  />
                  {getFieldError('address_line_2') && (
                    <div className="invalid-feedback">{getFieldError('address_line_2')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="city">City <span className="required">*</span></label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className={`form-control ${getFieldError('city') ? 'is-invalid' : ''}`}
                    placeholder="Los Angeles"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  {getFieldError('city') && (
                    <div className="invalid-feedback">{getFieldError('city')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State <span className="required">*</span></label>
                  <select
                    id="state"
                    name="state"
                    className={`form-control ${getFieldError('state') ? 'is-invalid' : ''}`}
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select State --</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.value} - {state.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError('state') && (
                    <div className="invalid-feedback">{getFieldError('state')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="zip_code">ZIP Code <span className="required">*</span></label>
                  <input
                    id="zip_code"
                    name="zip_code"
                    type="text"
                    className={`form-control ${getFieldError('zip_code') ? 'is-invalid' : ''}`}
                    placeholder="90001"
                    value={formData.zip_code}
                    onChange={handleChange}
                    required
                  />
                  {getFieldError('zip_code') && (
                    <div className="invalid-feedback">{getFieldError('zip_code')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="form-section">
              <h3 className="form-section-title">Insurance</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="insurance_provider">Insurance Provider</label>
                  <input
                    id="insurance_provider"
                    name="insurance_provider"
                    type="text"
                    className={`form-control ${getFieldError('insurance_provider') ? 'is-invalid' : ''}`}
                    placeholder="Blue Cross Blue Shield"
                    value={formData.insurance_provider}
                    onChange={handleChange}
                  />
                  {getFieldError('insurance_provider') && (
                    <div className="invalid-feedback">{getFieldError('insurance_provider')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="insurance_member_id">Insurance Member ID</label>
                  <input
                    id="insurance_member_id"
                    name="insurance_member_id"
                    type="text"
                    className={`form-control ${getFieldError('insurance_member_id') ? 'is-invalid' : ''}`}
                    placeholder="XYZ123456789"
                    value={formData.insurance_member_id}
                    onChange={handleChange}
                  />
                  {getFieldError('insurance_member_id') && (
                    <div className="invalid-feedback">{getFieldError('insurance_member_id')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3 className="form-section-title">Additional Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="preferred_language">Preferred Language</label>
                  <input
                    id="preferred_language"
                    name="preferred_language"
                    type="text"
                    className={`form-control ${getFieldError('preferred_language') ? 'is-invalid' : ''}`}
                    placeholder="English"
                    value={formData.preferred_language}
                    onChange={handleChange}
                  />
                  {getFieldError('preferred_language') && (
                    <div className="invalid-feedback">{getFieldError('preferred_language')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
                  <input
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    type="text"
                    className={`form-control ${getFieldError('emergency_contact_name') ? 'is-invalid' : ''}`}
                    placeholder="Jane Doe"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                  />
                  {getFieldError('emergency_contact_name') && (
                    <div className="invalid-feedback">{getFieldError('emergency_contact_name')}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
                  <input
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    type="tel"
                    className={`form-control ${getFieldError('emergency_contact_phone') ? 'is-invalid' : ''}`}
                    placeholder="10-digit phone number..."
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                  />
                  {getFieldError('emergency_contact_phone') && (
                    <div className="invalid-feedback">{getFieldError('emergency_contact_phone')}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
