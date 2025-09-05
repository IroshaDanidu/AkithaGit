import React, { useState, useEffect } from 'react';

const PatientForm = ({ patient, onSave, onCancel, isEditing = false, inline = false }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    name: '',
    age: '',
    gender: '',
    medical_conditions: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient && isEditing) {
      setFormData({
        patient_id: patient.patient_id,
        name: patient.name,
        age: patient.age.toString(),
        gender: patient.gender,
        medical_conditions: patient.medical_conditions || ''
      });
    }
  }, [patient, isEditing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onSave({
        ...formData,
        age: parseInt(formData.age)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (inline) {
    return (
      <div className="card modal-inline">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-4)' }}>
          <h3 style={{ margin: 0 }}>{isEditing ? 'Edit Patient' : 'Add New Patient'}</h3>
          <button onClick={onCancel} className="btn btn--icon" style={{ background: 'none', border: 'none' }}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            {!isEditing && (
              <div className="form-group">
                <label htmlFor="patient_id">Patient ID *</label>
                <input
                  type="text"
                  id="patient_id"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="e.g., P006"
                  pattern="P[0-9]{3,}"
                  title="Patient ID must start with 'P' followed by numbers"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., John Smith"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age *</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  className="input"
                  placeholder="e.g., 45"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="medical_conditions">Medical Conditions</label>
              <textarea
                id="medical_conditions"
                name="medical_conditions"
                value={formData.medical_conditions}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Hypertension, Diabetes"
                rows="3"
                style={{ resize: 'vertical' }}
              />
              <small style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-2)', marginTop: 'var(--s-1)', display: 'block' }}>
                Separate multiple conditions with commas
              </small>
            </div>

            {error && (
              <div className="alert alert--danger">
                <span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                  error
                </span>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-3)', marginTop: 'var(--s-3)' }}>
              <button type="button" onClick={onCancel} className="btn" disabled={submitting}>Cancel</button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? (
                  <>Saving...</>
                ) : (isEditing ? 'Update Patient' : 'Add Patient')}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>
            <span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
              {isEditing ? 'edit' : 'person_add'}
            </span>
            {isEditing ? 'Edit Patient' : 'Add New Patient'}
          </h3>
          <button onClick={onCancel} className="btn btn--icon" style={{ background: 'none', border: 'none' }}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!isEditing && (
              <div className="form-group">
                <label htmlFor="patient_id">Patient ID *</label>
                <input
                  type="text"
                  id="patient_id"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="e.g., P006"
                  pattern="P[0-9]{3,}"
                  title="Patient ID must start with 'P' followed by numbers"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., John Smith"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age *</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  className="input"
                  placeholder="e.g., 45"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="medical_conditions">Medical Conditions</label>
              <textarea
                id="medical_conditions"
                name="medical_conditions"
                value={formData.medical_conditions}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Hypertension, Diabetes"
                rows="3"
                style={{ resize: 'vertical' }}
              />
              <small style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-2)', marginTop: 'var(--s-1)', display: 'block' }}>
                Separate multiple conditions with commas
              </small>
            </div>

            {error && (
              <div className="alert alert--danger">
                <span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                  error
                </span>
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onCancel}
              className="btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded">
                    {isEditing ? 'save' : 'person_add'}
                  </span>
                  {isEditing ? 'Update Patient' : 'Add Patient'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;