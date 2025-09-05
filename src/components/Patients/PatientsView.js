import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import PatientForm from './PatientForm';
import { createPatient, updatePatient, deletePatient } from '../../services/api';

const PatientsView = ({ patients }) => {
  const { loading, refreshData } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDeletePatient = (patient) => {
    setDeleteConfirm(patient);
  };

  const confirmDelete = async () => {
    try {
      await deletePatient(deleteConfirm.patient_id);
      setDeleteConfirm(null);
      refreshData();
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Error deleting patient: ${error.message}`);
    }
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.patient_id, patientData);
      } else {
        await createPatient(patientData);
      }
      setShowForm(false);
      setEditingPatient(null);
      refreshData();
    } catch (error) {
      throw error;
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  // Filter patients based on search and status
  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.medical_conditions?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || patient.connection_status.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getHealthStatus = (patient) => {
    if (!patient.heart_rate && !patient.oxygen_level) return 'no-data';
    
    const heartRate = patient.heart_rate || 0;
    const oxygenLevel = patient.oxygen_level || 0;
    
    if (heartRate > 120 || heartRate < 50 || oxygenLevel < 90) return 'critical';
    if (heartRate > 100 || heartRate < 60 || oxygenLevel < 95) return 'warning';
    return 'normal';
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--s-6) 0' }}>
        <h1>Patients</h1>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patients-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Patient Care Management</h1>
            <p>Monitor and manage patient health records</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{patients?.length || 0}</span>
              <span className="stat-label">Total Patients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{patients?.filter(p => p.connection_status === 'online').length || 0}</span>
              <span className="stat-label">Online</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{patients?.filter(p => getHealthStatus(p) === 'critical').length || 0}</span>
              <span className="stat-label">Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-filters">
          <div className="search-box">
            <span className="material-symbols-rounded">search</span>
            <input
              type="text"
              placeholder="Search patients by name, ID, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        
        <div className="action-buttons">
          <button
            className={`view-toggle ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Card View"
          >
            <span className="material-symbols-rounded">grid_view</span>
          </button>
          <button
            className={`view-toggle ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <span className="material-symbols-rounded">table_rows</span>
          </button>
          <button onClick={handleAddPatient} className="add-patient-btn">
            <span className="material-symbols-rounded">person_add</span>
            Add Patient
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {searchTerm || filterStatus !== 'all' ? (
        <div className="results-summary">
          <span>Showing {filteredPatients.length} of {patients?.length || 0} patients</span>
          {searchTerm && <span className="filter-tag">Search: "{searchTerm}"</span>}
          {filterStatus !== 'all' && <span className="filter-tag">Status: {filterStatus}</span>}
        </div>
      ) : null}

      {/* Patient Content */}
      <div className="patient-content">
        {showForm ? (
          <div className="form-container">
            <PatientForm
              patient={editingPatient}
              onSave={handleSavePatient}
              onCancel={handleCancelForm}
              isEditing={!!editingPatient}
              inline={true}
            />
          </div>
        ) : !patients || patients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <span className="material-symbols-rounded">group</span>
            </div>
            <h3>No Patients Found</h3>
            <p>Start by adding your first patient to begin monitoring their health</p>
            <button onClick={handleAddPatient} className="empty-action-btn">
              <span className="material-symbols-rounded">person_add</span>
              Add Your First Patient
            </button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <span className="material-symbols-rounded">search_off</span>
            </div>
            <h3>No Matching Patients</h3>
            <p>Try adjusting your search terms or filters</p>
            <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="empty-action-btn">
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="patient-cards">
            {filteredPatients.map(patient => (
              <div key={patient.patient_id} className={`patient-card health-${getHealthStatus(patient)}`}>
                <div className="card-header">
                  <div className="patient-info">
                    <h3 className="patient-name">{patient.name}</h3>
                    <span className="patient-id">ID: {patient.patient_id}</span>
                  </div>
                  <div className="patient-status">
                    <span className={`status-indicator status-${patient.connection_status.toLowerCase()}`}>
                      <span className="material-symbols-rounded">
                        {patient.connection_status.toLowerCase() === 'online' ? 'wifi' : 'wifi_off'}
                      </span>
                      {patient.connection_status}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="patient-details">
                    <div className="detail-item">
                      <span className="detail-label">Age</span>
                      <span className="detail-value">{patient.age} years</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gender</span>
                      <span className="detail-value">{patient.gender}</span>
                    </div>
                  </div>

                  <div className="vital-signs">
                    <div className="vital-item">
                      <div className="vital-icon heart-rate">
                        <span className="material-symbols-rounded">favorite</span>
                      </div>
                      <div className="vital-info">
                        <span className="vital-value">{patient.heart_rate || '--'}</span>
                        <span className="vital-unit">BPM</span>
                      </div>
                    </div>
                    <div className="vital-item">
                      <div className="vital-icon oxygen-level">
                        <span className="material-symbols-rounded">air</span>
                      </div>
                      <div className="vital-info">
                        <span className="vital-value">{patient.oxygen_level || '--'}</span>
                        <span className="vital-unit">%</span>
                      </div>
                    </div>
                  </div>

                  {patient.medical_conditions && (
                    <div className="medical-conditions">
                      <span className="conditions-label">Conditions:</span>
                      <span className="conditions-text">{patient.medical_conditions}</span>
                    </div>
                  )}

                  <div className="last-reading">
                    <span className="material-symbols-rounded">schedule</span>
                    <span>Last reading: {patient.last_reading ? new Date(patient.last_reading).toLocaleString() : 'No data'}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleEditPatient(patient)}
                    className="action-btn edit-btn"
                    title="Edit Patient"
                  >
                    <span className="material-symbols-rounded">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient)}
                    className="action-btn delete-btn"
                    title="Delete Patient"
                  >
                    <span className="material-symbols-rounded">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="patient-table-container">
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Details</th>
                  <th>Heart Rate</th>
                  <th>Oxygen</th>
                  <th>Status</th>
                  <th>Last Reading</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.patient_id} className={`health-${getHealthStatus(patient)}`}>
                    <td>
                      <div className="patient-cell">
                        <strong>{patient.name}</strong>
                        <span className="patient-id-small">ID: {patient.patient_id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="details-cell">
                        <span>{patient.age}y, {patient.gender}</span>
                        {patient.medical_conditions && (
                          <span className="conditions-small">{patient.medical_conditions}</span>
                        )}
                      </div>
                    </td>
                    <td className="vital-cell">
                      <span className="vital-number">{patient.heart_rate || '--'}</span>
                      {patient.heart_rate && <span className="vital-unit">BPM</span>}
                    </td>
                    <td className="vital-cell">
                      <span className="vital-number">{patient.oxygen_level || '--'}</span>
                      {patient.oxygen_level && <span className="vital-unit">%</span>}
                    </td>
                    <td>
                      <span className={`table-status status-${patient.connection_status.toLowerCase()}`}>
                        {patient.connection_status}
                      </span>
                    </td>
                    <td className="reading-cell">
                      {patient.last_reading ? new Date(patient.last_reading).toLocaleString() : 'No data'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="table-action-btn edit"
                          title="Edit"
                        >
                          <span className="material-symbols-rounded">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient)}
                          className="table-action-btn delete"
                          title="Delete"
                        >
                          <span className="material-symbols-rounded">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}>
                <span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                  warning
                </span>
                Confirm Delete
              </h3>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="btn btn--icon"
                style={{ background: 'none', border: 'none' }}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete patient <strong>{deleteConfirm.name}</strong> ({deleteConfirm.patient_id})?
              </p>
              <div className="alert alert--warning" style={{ margin: 'var(--s-4) 0' }}>
                This will permanently delete all associated telemetry data and alerts.
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteConfirm(null)} className="btn">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn--danger">
                <span className="material-symbols-rounded">delete_forever</span>
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .patients-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--bg-0);
        }

        .dashboard-header {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-0);
          margin: 0 0 0.5rem 0;
        }

        .dashboard-header p {
          color: var(--text-2);
          margin: 0;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
        }

        .search-filters {
          display: flex;
          gap: 1rem;
          flex: 1;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: var(--bg-2);
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          padding: 0 1rem;
          min-width: 300px;
        }

        .search-box span {
          color: var(--text-2);
          margin-right: 0.5rem;
        }

        .search-input {
          border: none;
          background: none;
          flex: 1;
          padding: 0.75rem 0;
          font-size: 0.9rem;
          outline: none;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          background: var(--bg-1);
          font-size: 0.9rem;
          min-width: 150px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .view-toggle {
          padding: 0.75rem;
          border: 1px solid var(--border-strong);
          background: var(--bg-1);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-toggle.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .add-patient-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--success);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .add-patient-btn:hover {
          background: #059669;
        }

        .results-summary {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-2);
        }

        .filter-tag {
          background: var(--accent);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
        }

        .empty-icon {
          font-size: 4rem;
          color: var(--text-2);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-0);
        }

        .empty-state p {
          color: var(--text-2);
          margin: 0 0 2rem 0;
        }

        .empty-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        }

        .patient-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .patient-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
          transition: all 0.3s ease;
          border-left: 4px solid var(--border-subtle);
        }

        .patient-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .patient-card.health-critical {
          border-left-color: var(--danger);
        }

        .patient-card.health-warning {
          border-left-color: var(--warning);
        }

        .patient-card.health-normal {
          border-left-color: var(--success);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .patient-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-0);
          margin: 0 0 0.25rem 0;
        }

        .patient-id {
          font-size: 0.875rem;
          color: var(--text-2);
          font-family: monospace;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-indicator span {
          font-size: 1rem;
        }

        .status-online {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .status-offline {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }

        .patient-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.8rem;
          color: var(--text-2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-weight: 500;
          color: var(--text-0);
        }

        .vital-signs {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .vital-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .vital-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .vital-icon.heart-rate {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        }

        .vital-icon.oxygen-level {
          background: linear-gradient(135deg, #74b9ff, #0984e3);
        }

        .vital-info {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .vital-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-0);
        }

        .vital-unit {
          font-size: 0.875rem;
          color: var(--text-2);
        }

        .medical-conditions {
          margin-bottom: 1rem;
          padding: 1rem;
          background: var(--bg-2);
          border-radius: 8px;
        }

        .conditions-label {
          font-size: 0.8rem;
          color: var(--text-2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 0.5rem;
        }

        .conditions-text {
          color: var(--text-1);
          font-size: 0.9rem;
        }

        .last-reading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-2);
          margin-bottom: 1.5rem;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border: 1px solid var(--border-strong);
          background: var(--bg-1);
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: rgba(0, 102, 204, 0.1);
          border-color: var(--accent);
          color: var(--accent);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--danger);
          color: var(--danger);
        }

        .patient-table-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
        }

        .patient-table {
          width: 100%;
          border-collapse: collapse;
        }

        .patient-table th {
          background: var(--bg-2);
          color: var(--text-1);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-subtle);
        }

        .patient-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .patient-table tr:last-child td {
          border-bottom: none;
        }

        .patient-table tr:hover {
          background: var(--bg-2);
        }

        .patient-cell strong {
          display: block;
          font-weight: 600;
          color: var(--text-0);
        }

        .patient-id-small {
          font-size: 0.8rem;
          color: var(--text-2);
          font-family: monospace;
        }

        .details-cell span {
          display: block;
          color: var(--text-1);
        }

        .conditions-small {
          font-size: 0.8rem;
          color: var(--text-2);
        }

        .vital-cell {
          text-align: center;
        }

        .vital-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-0);
        }

        .table-status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .reading-cell {
          font-size: 0.875rem;
          color: var(--text-2);
        }

        .table-actions {
          display: flex;
          gap: 0.5rem;
        }

        .table-action-btn {
          width: 32px;
          height: 32px;
          border: 1px solid var(--border-strong);
          background: var(--bg-1);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .table-action-btn span {
          font-size: 1rem;
        }

        .table-action-btn.edit:hover {
          background: rgba(0, 102, 204, 0.1);
          border-color: var(--accent);
          color: var(--accent);
        }

        .table-action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--danger);
          color: var(--danger);
        }

        /* Tablet Responsive */
        @media (max-width: 1024px) {
          .patients-dashboard {
            padding: 1.5rem;
          }

          .dashboard-header {
            padding: 1.5rem;
          }

          .patient-cards {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1rem;
          }

          .header-stats {
            gap: 1.5rem;
          }

          .search-box {
            min-width: 250px;
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .patients-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            padding: 1.5rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1.5rem;
            align-items: stretch;
          }

          .header-stats {
            justify-content: space-around;
          }

          .controls-bar {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
            padding: 1rem;
          }

          .search-filters {
            flex-direction: column;
          }

          .search-box {
            min-width: auto;
          }

          .action-buttons {
            justify-content: space-between;
          }

          .patient-cards {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .patient-card {
            padding: 1rem;
          }

          .patient-details {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .vital-signs {
            flex-direction: column;
            gap: 1rem;
          }

          .card-actions {
            flex-direction: column;
          }

          .patient-table-container {
            overflow-x: auto;
          }

          .patient-table {
            min-width: 800px;
          }

          .dashboard-header h1 {
            font-size: 1.5rem;
          }
        }

        /* Small Mobile */
        @media (max-width: 480px) {
          .patients-dashboard {
            padding: 0.75rem;
          }

          .dashboard-header {
            padding: 1rem;
          }

          .controls-bar {
            padding: 0.75rem;
          }

          .patient-card {
            padding: 0.75rem;
          }

          .stat-number {
            font-size: 1.5rem;
          }

          .vital-value {
            font-size: 1.25rem;
          }

          .patient-name {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PatientsView;