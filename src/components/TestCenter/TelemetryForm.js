import React, { useState } from 'react';
import { sendTelemetryData } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const TelemetryForm = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    heart_rate: '',
    oxygen_level: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { refreshData, patients } = useAppContext();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      console.log('Sending telemetry data:', {
        patient_id: formData.patient_id,
        heart_rate: parseInt(formData.heart_rate),
        oxygen_level: parseInt(formData.oxygen_level)
      });

      const response = await sendTelemetryData({
        patient_id: formData.patient_id,
        heart_rate: parseInt(formData.heart_rate),
        oxygen_level: parseInt(formData.oxygen_level)
      });

      console.log('Telemetry response:', response);

      setMessage({
        type: 'success',
        text: response.alert_triggered 
          ? `Data sent successfully! Alert triggered: ${response.issue}`
          : 'Telemetry data sent successfully!'
      });
      
      // Reset form
      setFormData({
        patient_id: '',
        heart_rate: '',
        oxygen_level: '',
        status: 'active'
      });

      // Refresh dashboard data
      setTimeout(() => {
        refreshData();
      }, 1000);

    } catch (error) {
      console.error('Telemetry error:', error);
      setMessage({
        type: 'error',
        text: `Error: ${error.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: 'var(--s-4)' }}>
        <span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
          sensors
        </span>
        Send Live Telemetry Data
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patient_id">Patient ID *</label>
          <select
            id="patient_id"
            name="patient_id"
            value={formData.patient_id}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select Patient</option>
            {patients && patients.length > 0 ? (
              patients.map(patient => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.patient_id} - {patient.name}
                </option>
              ))
            ) : (
              <option disabled>No patients available</option>
            )}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="heart_rate">Heart Rate (bpm) *</label>
            <input
              type="number"
              id="heart_rate"
              name="heart_rate"
              value={formData.heart_rate}
              onChange={handleChange}
              min="30"
              max="200"
              required
              className="input"
              placeholder="e.g., 75"
            />
            <small style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-2)', marginTop: 'var(--s-1)', display: 'block' }}>
              Normal: 60-100 bpm
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="oxygen_level">Oxygen Level (%) *</label>
            <input
              type="number"
              id="oxygen_level"
              name="oxygen_level"
              value={formData.oxygen_level}
              onChange={handleChange}
              min="70"
              max="100"
              required
              className="input"
              placeholder="e.g., 98"
            />
            <small style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-2)', marginTop: 'var(--s-1)', display: 'block' }}>
              Normal: 95-100%
            </small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Device Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div style={{
          background: 'var(--bg-2)',
          padding: 'var(--s-4)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 'var(--s-4)'
        }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 'var(--s-4)',
              alignItems: 'start'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
              <span className="badge badge--danger" style={{ fontSize: 'var(--fs-micro)' }}>HIGH</span>
              <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-1)' }}>
                Rate &lt;50 or &gt;120 bpm
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
              <span className="badge badge--danger" style={{ fontSize: 'var(--fs-micro)' }}>HIGH</span>
              <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-1)' }}>
                Oxygen Level &lt;90%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
              <span className="badge badge--warning" style={{ fontSize: 'var(--fs-micro)' }}>MEDIUM</span>
              <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-1)' }}>
                Oxygen Level 90-94%
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`alert alert--${message.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 'var(--s-4)' }}>
            <span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn--success"
          disabled={submitting}
          style={{ width: '100%' }}
        >
          {submitting ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
              Sending...
            </>
          ) : (
            <>
              <span className="material-symbols-rounded">send</span>
              Send Telemetry Data
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TelemetryForm;