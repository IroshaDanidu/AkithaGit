import React, { useState, useEffect } from 'react';
import TelemetryForm from './TelemetryForm';

const TestCenter = ({ patients }) => {
  const [activeTab, setActiveTab] = useState('simulator');
  const [connectionStats, setConnectionStats] = useState({ online: 0, offline: 0 });

  useEffect(() => {
    if (patients) {
      const online = patients.filter(p => p.connection_status === 'online').length;
      const offline = patients.filter(p => p.connection_status === 'offline').length;
      setConnectionStats({ online, offline });
    }
  }, [patients]);

  const getHealthStatus = (patient) => {
    if (!patient.heart_rate && !patient.oxygen_level) return 'no-data';
    
    const heartRate = patient.heart_rate || 0;
    const oxygenLevel = patient.oxygen_level || 0;
    
    if (heartRate > 120 || heartRate < 50 || oxygenLevel < 90) return 'critical';
    if (heartRate > 100 || heartRate < 60 || oxygenLevel < 95) return 'warning';
    return 'normal';
  };

  const criticalPatients = patients?.filter(p => getHealthStatus(p) === 'critical').length || 0;

  return (
    <div className="diagnostics-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Diagnostic Test Center</h1>
            <p>Advanced telemetry simulation and real-time patient monitoring</p>
          </div>
          <div className="header-stats">
            <div className="stat-badge online">
              <span className="material-symbols-rounded">wifi</span>
              <div>
                <div className="stat-number">{connectionStats.online}</div>
                <div className="stat-label">Online</div>
              </div>
            </div>
            <div className="stat-badge offline">
              <span className="material-symbols-rounded">wifi_off</span>
              <div>
                <div className="stat-number">{connectionStats.offline}</div>
                <div className="stat-label">Offline</div>
              </div>
            </div>
            <div className="stat-badge critical">
              <span className="material-symbols-rounded">emergency</span>
              <div>
                <div className="stat-number">{criticalPatients}</div>
                <div className="stat-label">Critical</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          <span className="material-symbols-rounded">science</span>
          Data Simulator
        </button>
        <button 
          className={`tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          <span className="material-symbols-rounded">monitor_heart</span>
          Live Monitor
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="material-symbols-rounded">analytics</span>
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'simulator' && (
          <div className="simulator-section">
            <div className="section-grid">
              <div className="simulator-panel">
                <div className="panel-header">
                  <h3>Telemetry Data Simulator</h3>
                  <p>Generate realistic health data for testing and validation</p>
                </div>
                <div className="simulator-form">
                  <TelemetryForm />
                </div>
              </div>
              
              <div className="quick-actions-panel">
                <div className="panel-header">
                  <h3>Quick Actions</h3>
                  <p>Common simulation scenarios</p>
                </div>
                <div className="quick-actions">
                  <button className="action-card normal">
                    <div className="action-icon">
                      <span className="material-symbols-rounded">favorite</span>
                    </div>
                    <div className="action-content">
                      <h4>Normal Vitals</h4>
                      <p>HR: 70-80 BPM, O₂: 98-100%</p>
                    </div>
                  </button>
                  
                  <button className="action-card warning">
                    <div className="action-icon">
                      <span className="material-symbols-rounded">warning</span>
                    </div>
                    <div className="action-content">
                      <h4>Warning Range</h4>
                      <p>HR: 100-110 BPM, O₂: 92-95%</p>
                    </div>
                  </button>
                  
                  <button className="action-card critical">
                    <div className="action-icon">
                      <span className="material-symbols-rounded">emergency</span>
                    </div>
                    <div className="action-content">
                      <h4>Critical Alert</h4>
                      <p>HR: 130+ BPM, O₂: &lt;90%</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="monitor-section">
            <div className="monitor-header">
              <h3>Real-Time Patient Monitoring</h3>
              <div className="monitor-controls">
                <button className="refresh-btn">
                  <span className="material-symbols-rounded">refresh</span>
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="patient-monitor-grid">
              {patients && patients.length > 0 ? (
                patients.map(patient => (
                  <div key={patient.patient_id} className={`patient-monitor-card status-${patient.connection_status.toLowerCase()} health-${getHealthStatus(patient)}`}>
                    <div className="monitor-card-header">
                      <div className="patient-info">
                        <h4>{patient.name}</h4>
                        <span className="patient-id">ID: {patient.patient_id}</span>
                      </div>
                      <div className="connection-status">
                        <div className={`status-dot ${patient.connection_status.toLowerCase()}`}></div>
                        <span className="status-text">{patient.connection_status}</span>
                      </div>
                    </div>
                    
                    <div className="vitals-display">
                      <div className="vital-metric heart-rate">
                        <div className="metric-icon">
                          <span className="material-symbols-rounded">favorite</span>
                        </div>
                        <div className="metric-data">
                          <div className="metric-value">{patient.heart_rate || '--'}</div>
                          <div className="metric-unit">BPM</div>
                        </div>
                        <div className="metric-chart">
                          <div className="pulse-line"></div>
                        </div>
                      </div>
                      
                      <div className="vital-metric oxygen">
                        <div className="metric-icon">
                          <span className="material-symbols-rounded">air</span>
                        </div>
                        <div className="metric-data">
                          <div className="metric-value">{patient.oxygen_level || '--'}</div>
                          <div className="metric-unit">%</div>
                        </div>
                        <div className="metric-progress">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${patient.oxygen_level || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="monitor-card-footer">
                      <div className="last-update">
                        <span className="material-symbols-rounded">schedule</span>
                        <span>{patient.last_reading ? new Date(patient.last_reading).toLocaleTimeString() : 'No data'}</span>
                      </div>
                      <div className="health-indicator">
                        <span className={`health-badge ${getHealthStatus(patient)}`}>
                          {getHealthStatus(patient) === 'critical' ? 'Critical' :
                           getHealthStatus(patient) === 'warning' ? 'Warning' :
                           getHealthStatus(patient) === 'normal' ? 'Normal' : 'No Data'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-monitor">
                  <div className="empty-icon">
                    <span className="material-symbols-rounded">monitor_heart</span>
                  </div>
                  <h3>No Patients Connected</h3>
                  <p>Add patients to start monitoring their vital signs</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="analytics-header">
              <h3>System Analytics</h3>
              <p>Monitor system performance and data flow</p>
            </div>
            
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="card-header">
                  <h4>Data Transmission</h4>
                  <span className="material-symbols-rounded">cloud_sync</span>
                </div>
                <div className="metric-large">
                  <span className="number">98.5</span>
                  <span className="unit">%</span>
                </div>
                <div className="metric-label">Success Rate</div>
                <div className="trend positive">
                  <span className="material-symbols-rounded">trending_up</span>
                  <span>+2.1% from last hour</span>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="card-header">
                  <h4>Response Time</h4>
                  <span className="material-symbols-rounded">speed</span>
                </div>
                <div className="metric-large">
                  <span className="number">45</span>
                  <span className="unit">ms</span>
                </div>
                <div className="metric-label">Average Latency</div>
                <div className="trend negative">
                  <span className="material-symbols-rounded">trending_down</span>
                  <span>-5ms improvement</span>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="card-header">
                  <h4>Alerts Generated</h4>
                  <span className="material-symbols-rounded">notifications_active</span>
                </div>
                <div className="metric-large">
                  <span className="number">12</span>
                  <span className="unit">today</span>
                </div>
                <div className="metric-label">Total Alerts</div>
                <div className="trend neutral">
                  <span className="material-symbols-rounded">trending_flat</span>
                  <span>Normal range</span>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="card-header">
                  <h4>System Health</h4>
                  <span className="material-symbols-rounded">health_and_safety</span>
                </div>
                <div className="metric-large">
                  <span className="number">99.9</span>
                  <span className="unit">%</span>
                </div>
                <div className="metric-label">Uptime</div>
                <div className="trend positive">
                  <span className="material-symbols-rounded">check_circle</span>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
            
            <div className="system-status">
              <h4>System Status</h4>
              <div className="status-grid">
                <div className="status-item operational">
                  <div className="status-indicator"></div>
                  <div className="status-info">
                    <span className="service-name">Telemetry Service</span>
                    <span className="service-status">Operational</span>
                  </div>
                </div>
                <div className="status-item operational">
                  <div className="status-indicator"></div>
                  <div className="status-info">
                    <span className="service-name">Alert System</span>
                    <span className="service-status">Operational</span>
                  </div>
                </div>
                <div className="status-item operational">
                  <div className="status-indicator"></div>
                  <div className="status-info">
                    <span className="service-name">Data Processing</span>
                    <span className="service-status">Operational</span>
                  </div>
                </div>
                <div className="status-item warning">
                  <div className="status-indicator"></div>
                  <div className="status-info">
                    <span className="service-name">Backup System</span>
                    <span className="service-status">Maintenance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .diagnostics-dashboard {
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
          gap: 1.5rem;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          color: white;
        }

        .stat-badge.online {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .stat-badge.offline {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .stat-badge.critical {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .stat-badge span.material-symbols-rounded {
          font-size: 1.5rem;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .tab-navigation {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 0.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-2);
          font-weight: 500;
        }

        .tab-btn:hover {
          background: var(--bg-2);
          color: var(--text-1);
        }

        .tab-btn.active {
          background: var(--accent);
          color: white;
          box-shadow: 0 2px 4px rgba(0, 102, 204, 0.3);
        }

        .section-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .simulator-panel, .quick-actions-panel {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
        }

        .panel-header h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-0);
        }

        .panel-header p {
          margin: 0 0 1.5rem 0;
          color: var(--text-2);
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-strong);
          border-radius: 12px;
          background: var(--bg-1);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .action-card.normal:hover {
          border-color: var(--success);
        }

        .action-card.warning:hover {
          border-color: var(--warning);
        }

        .action-card.critical:hover {
          border-color: var(--danger);
        }

        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .action-card.normal .action-icon {
          background: var(--success);
        }

        .action-card.warning .action-icon {
          background: var(--warning);
        }

        .action-card.critical .action-icon {
          background: var(--danger);
        }

        .action-content h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-0);
        }

        .action-content p {
          margin: 0;
          color: var(--text-2);
          font-size: 0.9rem;
        }

        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .monitor-header h3 {
          margin: 0;
          color: var(--text-0);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .refresh-btn:hover {
          background: var(--accent-strong);
        }

        .patient-monitor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .patient-monitor-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
          transition: all 0.3s ease;
          border-left: 4px solid var(--border-subtle);
        }

        .patient-monitor-card.health-critical {
          border-left-color: var(--danger);
        }

        .patient-monitor-card.health-warning {
          border-left-color: var(--warning);
        }

        .patient-monitor-card.health-normal {
          border-left-color: var(--success);
        }

        .monitor-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .patient-info h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-0);
        }

        .patient-id {
          font-size: 0.8rem;
          color: var(--text-2);
          font-family: monospace;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: var(--success);
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .status-dot.offline {
          background: var(--danger);
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }

        .status-text {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-1);
        }

        .vitals-display {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .vital-metric {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .vital-metric.heart-rate .metric-icon {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .vital-metric.oxygen .metric-icon {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
        }

        .metric-data {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-0);
        }

        .metric-unit {
          font-size: 0.9rem;
          color: var(--text-2);
        }

        .metric-chart {
          flex: 1;
          height: 30px;
          position: relative;
          overflow: hidden;
        }

        .pulse-line {
          width: 100%;
          height: 2px;
          background: var(--danger);
          position: relative;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .metric-progress {
          flex: 1;
          height: 8px;
          background: var(--bg-2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #06b6d4, #0891b2);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .monitor-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }

        .last-update {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-2);
        }

        .health-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .health-badge.normal {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .health-badge.warning {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
        }

        .health-badge.critical {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }

        .health-badge.no-data {
          background: var(--bg-2);
          color: var(--text-2);
        }

        .empty-monitor {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-2);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .analytics-header {
          margin-bottom: 2rem;
        }

        .analytics-header h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-0);
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .analytics-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-header h4 {
          margin: 0;
          color: var(--text-0);
        }

        .card-header span {
          color: var(--text-2);
        }

        .metric-large {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .metric-large .number {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-0);
        }

        .metric-large .unit {
          font-size: 1rem;
          color: var(--text-2);
        }

        .metric-label {
          font-size: 0.9rem;
          color: var(--text-2);
          margin-bottom: 1rem;
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .trend.positive {
          color: var(--success);
        }

        .trend.negative {
          color: var(--success);
        }

        .trend.neutral {
          color: var(--text-2);
        }

        .system-status {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-subtle);
        }

        .system-status h4 {
          margin: 0 0 1.5rem 0;
          color: var(--text-0);
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: var(--bg-1);
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .status-item.operational .status-indicator {
          background: var(--success);
        }

        .status-item.warning .status-indicator {
          background: var(--warning);
        }

        .status-item.error .status-indicator {
          background: var(--danger);
        }

        .status-info {
          display: flex;
          flex-direction: column;
        }

        .service-name {
          font-weight: 500;
          color: var(--text-0);
        }

        .service-status {
          font-size: 0.8rem;
          color: var(--text-2);
        }

        @media (max-width: 768px) {
          .diagnostics-dashboard {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1.5rem;
            align-items: stretch;
          }

          .header-stats {
            justify-content: space-around;
          }

          .section-grid {
            grid-template-columns: 1fr;
          }

          .patient-monitor-grid {
            grid-template-columns: 1fr;
          }

          .analytics-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default TestCenter;