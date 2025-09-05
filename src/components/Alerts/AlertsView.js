import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const AlertsView = ({ alerts }) => {
  const { loading, refreshData } = useAppContext();
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterResolved, setFilterResolved] = useState('all');
  const [filterPatient, setFilterPatient] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('timeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Advanced filtering and data processing - moved outside loading check
  const uniquePatients = useMemo(() => {
    const patients = [...new Set(alerts?.map(alert => alert.patient_name) || [])];
    return patients.sort();
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts?.filter(alert => {
      const matchesSeverity = filterSeverity === 'all' || alert.severity_level === filterSeverity;
      const matchesResolved = filterResolved === 'all' || 
                             (filterResolved === 'resolved' && alert.resolved) ||
                             (filterResolved === 'unresolved' && !alert.resolved);
      const matchesPatient = filterPatient === 'all' || alert.patient_name === filterPatient;
      const matchesSearch = searchTerm === '' || 
                           alert.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.issue_detected.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.message?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSeverity && matchesResolved && matchesPatient && matchesSearch;
    }) || [];
  }, [alerts, filterSeverity, filterResolved, filterPatient, searchTerm]);

  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.datetime) - new Date(a.datetime);
        case 'oldest':
          return new Date(a.datetime) - new Date(b.datetime);
        case 'severity':
          const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return severityOrder[b.severity_level] - severityOrder[a.severity_level];
        case 'patient':
          return a.patient_name.localeCompare(b.patient_name);
        default:
          return 0;
      }
    });
  }, [filteredAlerts, sortBy]);

  const alertStats = useMemo(() => {
    const today = new Date().toDateString();
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return {
      critical: alerts?.filter(alert => alert.severity_level === 'high').length || 0,
      unresolved: alerts?.filter(alert => !alert.resolved).length || 0,
      today: alerts?.filter(alert => new Date(alert.datetime).toDateString() === today).length || 0,
      last24h: alerts?.filter(alert => new Date(alert.datetime) >= last24Hours).length || 0,
      resolved: alerts?.filter(alert => alert.resolved).length || 0,
      avgResponseTime: '4.2 min' // This would come from API
    };
  }, [alerts]);

  if (loading) {
    return (
      <div style={{ padding: 'var(--s-6) 0' }}>
        <h1>Alerts</h1>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high': return 'emergency';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'notifications';
    }
  };

  const getTimeAgo = (datetime) => {
    const now = new Date();
    const alertTime = new Date(datetime);
    const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const groupAlertsByDate = (alerts) => {
    const groups = {};
    alerts.forEach(alert => {
      const date = new Date(alert.datetime).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(alert);
    });
    return groups;
  };

  return (
    <div className="advanced-alerts-dashboard">
      {/* Modern Header with Live Status */}
      <div className="hero-header">
        <div className="header-background"></div>
        <div className="header-content">
          <div className="header-text">
            <h1>Alert Command Center</h1>
            <p>Advanced health monitoring with AI-powered insights and real-time analytics</p>
          </div>
          <div className="live-stats">
            <div className="live-counter critical">
              <span className="counter-number">{alertStats.critical}</span>
              <span className="counter-label">Critical</span>
              <div className="pulse-dot"></div>
            </div>
            <div className="live-counter warning">
              <span className="counter-number">{alertStats.unresolved}</span>
              <span className="counter-label">Active</span>
              <div className="pulse-dot"></div>
            </div>
            <div className="live-counter info">
              <span className="counter-number">{alertStats.last24h}</span>
              <span className="counter-label">24h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Dashboard */}
      <div className="kpi-grid">
        <div className="kpi-card priority-high">
          <div className="kpi-visual">
            <div className="chart-ring" style={{ '--progress': `${(alertStats.critical / (alertStats.critical + 10)) * 100}%` }}>
              <span className="chart-value">{alertStats.critical}</span>
            </div>
          </div>
          <div className="kpi-info">
            <h3>Critical Alerts</h3>
            <p>Requires immediate attention</p>
            <div className="trend-indicator up">
              <span className="material-symbols-rounded">trending_up</span>
              <span>+2 from yesterday</span>
            </div>
          </div>
        </div>

        <div className="kpi-card priority-medium">
          <div className="kpi-visual">
            <div className="progress-bars">
              {[85, 70, 95, 60, 80].map((height, i) => (
                <div key={i} className="bar" style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </div>
          <div className="kpi-info">
            <h3>Response Time</h3>
            <p>{alertStats.avgResponseTime} average</p>
            <div className="trend-indicator down">
              <span className="material-symbols-rounded">trending_down</span>
              <span>-15% improved</span>
            </div>
          </div>
        </div>

        <div className="kpi-card priority-success">
          <div className="kpi-visual">
            <div className="success-metric">
              <span className="success-percentage">{Math.round((alertStats.resolved / (alerts?.length || 1)) * 100)}%</span>
              <span className="success-label">Resolved</span>
            </div>
          </div>
          <div className="kpi-info">
            <h3>Resolution Rate</h3>
            <p>{alertStats.resolved} of {alerts?.length || 0} alerts</p>
            <div className="trend-indicator neutral">
              <span className="material-symbols-rounded">trending_flat</span>
              <span>Stable performance</span>
            </div>
          </div>
        </div>

        <div className="kpi-card priority-info">
          <div className="kpi-visual">
            <div className="activity-pulse">
              <div className="pulse-circle"></div>
              <span className="activity-count">{alertStats.today}</span>
            </div>
          </div>
          <div className="kpi-info">
            <h3>Today's Activity</h3>
            <p>New alerts generated</p>
            <div className="trend-indicator up">
              <span className="material-symbols-rounded">notifications_active</span>
              <span>Real-time monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Control Panel */}
      <div className="control-panel">
        <div className="search-section">
          <div className="search-box">
            <span className="material-symbols-rounded">search</span>
            <input
              type="text"
              placeholder="Search alerts, patients, or conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={refreshData} className="refresh-btn">
            <span className="material-symbols-rounded">refresh</span>
          </button>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Severity</label>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="all">All Levels</option>
              <option value="high">🔴 Critical</option>
              <option value="medium">🟡 Warning</option>
              <option value="low">🔵 Info</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Patient</label>
            <select value={filterPatient} onChange={(e) => setFilterPatient(e.target.value)}>
              <option value="all">All Patients</option>
              {uniquePatients.map(patient => (
                <option key={patient} value={patient}>{patient}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select value={filterResolved} onChange={(e) => setFilterResolved(e.target.value)}>
              <option value="all">All Status</option>
              <option value="unresolved">⚠️ Active</option>
              <option value="resolved">✅ Resolved</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">⏰ Latest</option>
              <option value="severity">🚨 Priority</option>
              <option value="patient">👤 Patient</option>
              <option value="oldest">📅 Oldest</option>
            </select>
          </div>
        </div>

        <div className="view-selector">
          <div className="view-tabs">
            <button 
              className={`view-tab ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <span className="material-symbols-rounded">timeline</span>
              Timeline
            </button>
            <button 
              className={`view-tab ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <span className="material-symbols-rounded">view_module</span>
              Cards
            </button>
            <button 
              className={`view-tab ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <span className="material-symbols-rounded">table_rows</span>
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {(searchTerm || filterSeverity !== 'all' || filterResolved !== 'all' || filterPatient !== 'all') && (
        <div className="results-info">
          <div className="results-count">
            <span className="count-number">{sortedAlerts.length}</span>
            <span className="count-text">of {alerts?.length || 0} alerts</span>
          </div>
          <div className="active-filters">
            {searchTerm && <span className="filter-chip search">🔍 "{searchTerm}"</span>}
            {filterSeverity !== 'all' && <span className="filter-chip severity">{filterSeverity} priority</span>}
            {filterPatient !== 'all' && <span className="filter-chip patient">👤 {filterPatient}</span>}
            {filterResolved !== 'all' && <span className="filter-chip status">{filterResolved}</span>}
            <button 
              className="clear-filters"
              onClick={() => {
                setSearchTerm('');
                setFilterSeverity('all');
                setFilterPatient('all');
                setFilterResolved('all');
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Content Area */}
      <div className="content-area">
        {!alerts || alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-animation">
              <span className="material-symbols-rounded">notifications_off</span>
            </div>
            <h3>All Clear! 🎉</h3>
            <p>No alerts found. Your patients are in good health.</p>
          </div>
        ) : sortedAlerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-animation">
              <span className="material-symbols-rounded">filter_list_off</span>
            </div>
            <h3>No Matches Found</h3>
            <p>Try adjusting your search criteria or filters.</p>
            <button className="reset-btn" onClick={() => {
              setSearchTerm('');
              setFilterSeverity('all');
              setFilterPatient('all');
              setFilterResolved('all');
            }}>
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="timeline-view">
            {Object.entries(groupAlertsByDate(sortedAlerts)).map(([date, dayAlerts]) => (
              <div key={date} className="timeline-day">
                <div className="day-header">
                  <h3>{new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</h3>
                  <span className="day-count">{dayAlerts.length} alerts</span>
                </div>
                <div className="timeline-alerts">
                  {dayAlerts.map(alert => (
                    <div 
                      key={alert.alert_id} 
                      className={`timeline-alert severity-${alert.severity_level} ${alert.resolved ? 'resolved' : ''}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="timeline-marker">
                        <div className="marker-dot" style={{ background: getSeverityColor(alert.severity_level) }}></div>
                        <div className="marker-line"></div>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <div className="alert-meta">
                            <span className="patient-tag">{alert.patient_name}</span>
                            <span className="severity-tag">{alert.severity_level.toUpperCase()}</span>
                            <span className="time-tag">{getTimeAgo(alert.datetime)}</span>
                          </div>
                          <div className="alert-status">
                            {alert.resolved ? (
                              <span className="status-resolved">✅ Resolved</span>
                            ) : (
                              <span className="status-active">🔴 Active</span>
                            )}
                          </div>
                        </div>
                        <div className="timeline-details">
                          <h4>{alert.issue_detected}</h4>
                          {alert.message && <p>{alert.message}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'cards' ? (
          <div className="cards-grid">
            {sortedAlerts.map(alert => (
              <div 
                key={alert.alert_id} 
                className={`modern-alert-card severity-${alert.severity_level} ${alert.resolved ? 'resolved' : ''}`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="card-header">
                  <div className="severity-indicator" style={{ background: getSeverityColor(alert.severity_level) }}>
                    <span className="material-symbols-rounded">{getAlertIcon(alert.severity_level)}</span>
                  </div>
                  <div className="card-meta">
                    <span className="severity-text">{alert.severity_level.toUpperCase()}</span>
                    <span className="time-text">{getTimeAgo(alert.datetime)}</span>
                  </div>
                  <div className="card-status">
                    {alert.resolved ? (
                      <span className="status-badge resolved">✅</span>
                    ) : (
                      <span className="status-badge active">🔴</span>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <div className="patient-badge">
                    <span className="material-symbols-rounded">person</span>
                    {alert.patient_name}
                  </div>
                  <h3>{alert.issue_detected}</h3>
                  {alert.message && <p>{alert.message}</p>}
                </div>
                <div className="card-footer">
                  <span className="timestamp">
                    <span className="material-symbols-rounded">schedule</span>
                    {new Date(alert.datetime).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-view">
            <div className="table-container">
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Patient</th>
                    <th>Issue</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAlerts.map(alert => (
                    <tr 
                      key={alert.alert_id} 
                      className={`table-row severity-${alert.severity_level} ${alert.resolved ? 'resolved' : ''}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <td>
                        <div className="priority-cell">
                          <div 
                            className="priority-dot" 
                            style={{ background: getSeverityColor(alert.severity_level) }}
                          ></div>
                          <span className="priority-text">{alert.severity_level.toUpperCase()}</span>
                        </div>
                      </td>
                      <td>
                        <div className="patient-cell">
                          <strong>{alert.patient_name}</strong>
                          <span className="patient-id">ID: {alert.patient_id}</span>
                        </div>
                      </td>
                      <td>
                        <div className="issue-cell">
                          <strong>{alert.issue_detected}</strong>
                          {alert.message && <p>{alert.message}</p>}
                        </div>
                      </td>
                      <td>
                        <div className="time-cell">
                          <span className="relative-time">{getTimeAgo(alert.datetime)}</span>
                          <span className="absolute-time">{new Date(alert.datetime).toLocaleString()}</span>
                        </div>
                      </td>
                      <td>
                        {alert.resolved ? (
                          <span className="status-resolved">✅ Resolved</span>
                        ) : (
                          <span className="status-active">🔴 Active</span>
                        )}
                      </td>
                      <td>
                        <button className="action-btn" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlert(alert);
                        }}>
                          <span className="material-symbols-rounded">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-priority">
                <div 
                  className="priority-icon" 
                  style={{ background: getSeverityColor(selectedAlert.severity_level) }}
                >
                  <span className="material-symbols-rounded">{getAlertIcon(selectedAlert.severity_level)}</span>
                </div>
                <div>
                  <h2>{selectedAlert.issue_detected}</h2>
                  <span className="modal-severity">{selectedAlert.severity_level.toUpperCase()} PRIORITY</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedAlert(null)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Patient Information</h3>
                <div className="patient-details">
                  <span className="detail-item">
                    <span className="material-symbols-rounded">person</span>
                    {selectedAlert.patient_name} ({selectedAlert.patient_id})
                  </span>
                </div>
              </div>
              {selectedAlert.message && (
                <div className="modal-section">
                  <h3>Description</h3>
                  <p>{selectedAlert.message}</p>
                </div>
              )}
              <div className="modal-section">
                <h3>Timeline</h3>
                <div className="timeline-details">
                  <span className="timeline-item">
                    <span className="material-symbols-rounded">schedule</span>
                    Alert triggered: {new Date(selectedAlert.datetime).toLocaleString()}
                  </span>
                  <span className="timeline-item">
                    <span className="material-symbols-rounded">update</span>
                    {getTimeAgo(selectedAlert.datetime)} ago
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="status-section">
                {selectedAlert.resolved ? (
                  <span className="resolved-badge">✅ Alert Resolved</span>
                ) : (
                  <span className="active-badge">🔴 Alert Active</span>
                )}
              </div>
              <div className="action-buttons">
                <button className="modal-btn secondary" onClick={() => setSelectedAlert(null)}>
                  Close
                </button>
                {!selectedAlert.resolved && (
                  <button className="modal-btn primary">
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .advanced-alerts-dashboard {
          max-width: 1600px;
          margin: 0 auto;
          padding: 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }

        .hero-header {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 3rem 2rem;
          margin-bottom: 2rem;
          color: white;
          overflow: hidden;
        }

        .header-background {
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transform: translate(50px, -50px);
        }

        .header-content {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-text h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(45deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-text p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0;
          max-width: 500px;
        }

        .live-stats {
          display: flex;
          gap: 2rem;
        }

        .live-counter {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .counter-number {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1;
        }

        .counter-label {
          font-size: 0.9rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .pulse-dot {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 12px;
          height: 12px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .live-counter.critical .pulse-dot {
          background: #fee140;
        }

        .live-counter.warning .pulse-dot {
          background: #f59e0b;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 1; }
          70% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(0.95); opacity: 1; }
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .kpi-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          display: flex;
          gap: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ef4444, #f59e0b, #06b6d4, #10b981);
        }

        .kpi-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
        }

        .kpi-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 80px;
        }

        .chart-ring {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(#ef4444 calc(var(--progress) * 1%), #e5e7eb 0%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .chart-ring::before {
          content: '';
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: white;
        }

        .chart-value {
          position: relative;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ef4444;
        }

        .progress-bars {
          display: flex;
          align-items: end;
          gap: 4px;
          height: 60px;
        }

        .bar {
          width: 8px;
          background: linear-gradient(to top, #f59e0b, #fbbf24);
          border-radius: 4px;
          animation: growBar 1s ease-out;
        }

        @keyframes growBar {
          from { height: 0; }
          to { height: var(--height, 100%); }
        }

        .success-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .success-percentage {
          font-size: 2rem;
          font-weight: 700;
          color: #10b981;
        }

        .success-label {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .activity-pulse {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
        }

        .pulse-circle {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 3px solid #06b6d4;
          border-radius: 50%;
          animation: ripple 2s infinite;
        }

        .activity-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: #06b6d4;
        }

        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .kpi-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2937;
        }

        .kpi-info p {
          margin: 0 0 1rem 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .trend-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .trend-indicator.up {
          color: #10b981;
        }

        .trend-indicator.down {
          color: #10b981;
        }

        .trend-indicator.neutral {
          color: #6b7280;
        }

        .control-panel {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .search-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          transition: border-color 0.2s ease;
        }

        .search-box:focus-within {
          border-color: #667eea;
        }

        .search-box span {
          color: #6b7280;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          font-size: 1rem;
          color: #1f2937;
        }

        .search-box input::placeholder {
          color: #9ca3af;
        }

        .refresh-btn {
          padding: 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        .filter-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .filter-group select {
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 0.9rem;
          color: #1f2937;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #667eea;
        }

        .view-selector {
          display: flex;
          justify-content: center;
        }

        .view-tabs {
          display: flex;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 4px;
        }

        .view-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          color: #6b7280;
        }

        .view-tab.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .results-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .results-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .count-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
        }

        .count-text {
          color: #6b7280;
        }

        .active-filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-chip {
          padding: 0.25rem 0.75rem;
          background: #667eea;
          color: white;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .filter-chip.search {
          background: #10b981;
        }

        .filter-chip.severity {
          background: #f59e0b;
        }

        .filter-chip.patient {
          background: #06b6d4;
        }

        .clear-filters {
          padding: 0.25rem 0.75rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .clear-filters:hover {
          background: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .empty-animation {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.6;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.5rem;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0 0 2rem 0;
        }

        .reset-btn {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reset-btn:hover {
          transform: scale(1.05);
        }

        .timeline-view {
          space: y-2rem;
        }

        .timeline-day {
          margin-bottom: 2rem;
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0 1rem;
        }

        .day-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.2rem;
        }

        .day-count {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .timeline-alerts {
          position: relative;
        }

        .timeline-alert {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          cursor: pointer;
        }

        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 20px;
        }

        .marker-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .marker-line {
          width: 2px;
          height: 60px;
          background: #e5e7eb;
          margin-top: 4px;
        }

        .timeline-alert:last-child .marker-line {
          display: none;
        }

        .timeline-content {
          flex: 1;
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .timeline-content:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          transform: translateX(4px);
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .alert-meta {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .patient-tag {
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .severity-tag {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          background: #fef3c7;
          color: #92400e;
        }

        .time-tag {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .status-resolved {
          color: #10b981;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-active {
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .timeline-details h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .timeline-details p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .modern-alert-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .modern-alert-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--severity-color, #6b7280);
        }

        .modern-alert-card.severity-high::before {
          background: #ef4444;
        }

        .modern-alert-card.severity-medium::before {
          background: #f59e0b;
        }

        .modern-alert-card.severity-low::before {
          background: #06b6d4;
        }

        .modern-alert-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }

        .modern-alert-card.resolved {
          opacity: 0.7;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .severity-indicator {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .card-meta {
          flex: 1;
          margin-left: 1rem;
        }

        .severity-text {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #1f2937;
        }

        .time-text {
          font-size: 0.7rem;
          color: #6b7280;
        }

        .status-badge {
          font-size: 1rem;
        }

        .patient-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #f3f4f6;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .card-body h3 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .card-body p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .card-footer {
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 1rem;
        }

        .timestamp {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .table-view {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .table-container {
          overflow-x: auto;
        }

        .alerts-table {
          width: 100%;
          border-collapse: collapse;
        }

        .alerts-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .alerts-table td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        .table-row:last-child td {
          border-bottom: none;
        }

        .priority-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .priority-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .priority-text {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .patient-cell strong {
          display: block;
          color: #1f2937;
        }

        .patient-id {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .issue-cell strong {
          display: block;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .issue-cell p {
          margin: 0;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .time-cell {
          display: flex;
          flex-direction: column;
        }

        .relative-time {
          font-weight: 500;
          color: #1f2937;
        }

        .absolute-time {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .action-btn {
          padding: 0.5rem;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .alert-modal {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-priority {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .priority-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .modal-priority h2 {
          margin: 0 0 0.25rem 0;
          color: #1f2937;
          font-size: 1.5rem;
        }

        .modal-severity {
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: #f3f4f6;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .modal-body {
          padding: 2rem;
        }

        .modal-section {
          margin-bottom: 2rem;
        }

        .modal-section h3 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .patient-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
        }

        .timeline-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .resolved-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 500;
        }

        .active-badge {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .modal-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-btn.secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-btn.secondary:hover {
          background: #e5e7eb;
        }

        .modal-btn.primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .modal-btn.primary:hover {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .advanced-alerts-dashboard {
            padding: 0.5rem;
          }

          .hero-header {
            padding: 2rem 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 2rem;
            text-align: center;
          }

          .header-text h1 {
            font-size: 2rem;
          }

          .live-stats {
            gap: 1rem;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .kpi-card {
            flex-direction: column;
            text-align: center;
          }

          .control-panel {
            padding: 1rem;
          }

          .search-section {
            flex-direction: column;
          }

          .filter-section {
            grid-template-columns: 1fr;
          }

          .view-tabs {
            flex-direction: column;
            width: 100%;
          }

          .results-info {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
            text-align: center;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }

          .timeline-alert {
            flex-direction: column;
          }

          .timeline-marker {
            flex-direction: row;
            min-width: auto;
          }

          .marker-line {
            width: 40px;
            height: 2px;
          }

          .alert-modal {
            margin: 0;
            border-radius: 0;
            max-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
};

export default AlertsView;