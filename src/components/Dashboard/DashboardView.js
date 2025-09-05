import React, { useState, useEffect } from 'react';

const DashboardView = ({ stats, alerts, onNavigate, patients }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate stats from patients data as fallback
  const totalPatients = patients?.length || stats?.total_patients || 0;
  const activePatients = patients?.filter(p => p.connection_status === 'Online').length || stats?.active_patients || 0;
  const criticalAlertsToday = patients?.filter(p => 
    p.heart_rate < 50 || p.heart_rate > 120 || p.oxygen_level < 90
  ).length || stats?.critical_alerts_today || 0;
  const unresolvedAlerts = alerts?.filter(alert => !alert.resolved).length || stats?.unresolved_alerts || 0;
  
  const avgHeartRate = patients?.length > 0 
    ? Math.round(patients.reduce((sum, p) => sum + (p.heart_rate || 0), 0) / patients.length)
    : stats?.avg_heart_rate_today || 72;
  const avgOxygenLevel = patients?.length > 0
    ? Math.round(patients.reduce((sum, p) => sum + (p.oxygen_level || 0), 0) / patients.length)
    : stats?.avg_oxygen_level_today || 98;

  const handleStatCardClick = (tab) => {
    if (onNavigate) onNavigate(tab);
  };

  const getSystemStatus = () => {
    if (criticalAlertsToday > 5) return { status: 'critical', message: 'Multiple critical alerts require attention' };
    if (criticalAlertsToday > 0) return { status: 'warning', message: 'Some patients require monitoring' };
    if (activePatients < totalPatients * 0.8) return { status: 'warning', message: 'Some patients are offline' };
    return { status: 'healthy', message: 'All systems operational' };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="modern-dashboard">
      {/* Hero Header */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>HealthSync Overview</h1>
            <p>Intelligent patient monitoring and health analytics platform</p>
            <div className="system-status">
              <div className={`status-indicator ${systemStatus.status}`}></div>
              <span className="status-text">{systemStatus.message}</span>
            </div>
          </div>
          <div className="hero-stats">
            <div className="live-time">
              <span className="time">{currentTime.toLocaleTimeString()}</span>
              <span className="date">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="quick-actions">
              <button className="quick-btn" onClick={() => handleStatCardClick('patients')}>
                <span className="material-symbols-rounded">person_add</span>
                Add Patient
              </button>
              <button className="quick-btn" onClick={() => handleStatCardClick('test-center')}>
                <span className="material-symbols-rounded">science</span>
                Run Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-section">
        <div className="kpi-grid">
          <div className="kpi-card primary-card" onClick={() => handleStatCardClick('patients')}>
            <div className="kpi-header">
              <div className="kpi-icon primary">
                <span className="material-symbols-rounded">groups</span>
              </div>
              <div className="kpi-trend up">
                <span className="material-symbols-rounded">trending_up</span>
                <span>+{Math.floor(Math.random() * 5) + 1}</span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-number">{totalPatients}</div>
              <div className="kpi-label">Total Patients</div>
              <div className="kpi-sublabel">Registered in system</div>
            </div>
            <div className="kpi-visual">
              <div className="progress-ring">
                <svg viewBox="0 0 36 36">
                  <path className="bg-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="progress-ring-path" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
            </div>
          </div>

          <div className="kpi-card success-card" onClick={() => handleStatCardClick('patients')}>
            <div className="kpi-header">
              <div className="kpi-icon success">
                <span className="material-symbols-rounded">monitor_heart</span>
              </div>
              <div className="kpi-trend neutral">
                <span className="material-symbols-rounded">radio_button_checked</span>
                <span>Live</span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-number">{activePatients}</div>
              <div className="kpi-label">Active Monitoring</div>
              <div className="kpi-sublabel">Real-time tracking</div>
            </div>
            <div className="kpi-visual">
              <div className="pulse-animation">
                <div className="pulse-dot"></div>
                <div className="pulse-wave wave1"></div>
                <div className="pulse-wave wave2"></div>
              </div>
            </div>
          </div>

          <div className="kpi-card warning-card" onClick={() => handleStatCardClick('alerts')}>
            <div className="kpi-header">
              <div className="kpi-icon warning">
                <span className="material-symbols-rounded">emergency</span>
              </div>
              <div className="kpi-trend down">
                <span className="material-symbols-rounded">priority_high</span>
                <span>High</span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-number">{criticalAlertsToday}</div>
              <div className="kpi-label">Critical Alerts</div>
              <div className="kpi-sublabel">Require attention</div>
            </div>
            <div className="kpi-visual">
              <div className={`alert-indicator ${criticalAlertsToday > 0 ? 'active' : ''}`}>
                <span className="material-symbols-rounded">warning</span>
              </div>
            </div>
          </div>

          <div className="kpi-card info-card" onClick={() => handleStatCardClick('alerts')}>
            <div className="kpi-header">
              <div className="kpi-icon info">
                <span className="material-symbols-rounded">analytics</span>
              </div>
              <div className="kpi-trend up">
                <span className="material-symbols-rounded">check_circle</span>
                <span>98.5%</span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-number">{unresolvedAlerts}</div>
              <div className="kpi-label">System Uptime</div>
              <div className="kpi-sublabel">Last 30 days</div>
            </div>
            <div className="kpi-visual">
              <div className="uptime-chart">
                <div className="chart-bar" style={{ height: '85%' }}></div>
                <div className="chart-bar" style={{ height: '92%' }}></div>
                <div className="chart-bar" style={{ height: '78%' }}></div>
                <div className="chart-bar" style={{ height: '96%' }}></div>
                <div className="chart-bar" style={{ height: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Insights Dashboard */}
      <div className="insights-section">
        <div className="insights-grid">
          <div className="insight-card vitals-card">
            <div className="card-header">
              <h3>
                <span className="material-symbols-rounded">favorite</span>
                Vital Signs Overview
              </h3>
              <div className="header-actions">
                <button className="refresh-btn">
                  <span className="material-symbols-rounded">refresh</span>
                </button>
              </div>
            </div>
            <div className="vitals-display">
              <div className="vital-metric heart-rate">
                <div className="metric-icon">
                  <span className="material-symbols-rounded">favorite</span>
                </div>
                <div className="metric-info">
                  <div className="metric-value">{avgHeartRate}</div>
                  <div className="metric-label">Avg Heart Rate</div>
                  <div className="metric-unit">BPM</div>
                </div>
                <div className="metric-chart">
                  <div className="heartbeat-line"></div>
                </div>
              </div>
              <div className="vital-metric oxygen-level">
                <div className="metric-icon">
                  <span className="material-symbols-rounded">air</span>
                </div>
                <div className="metric-info">
                  <div className="metric-value">{avgOxygenLevel}</div>
                  <div className="metric-label">Avg Oxygen</div>
                  <div className="metric-unit">%</div>
                </div>
                <div className="metric-gauge">
                  <div className="gauge-fill" style={{ width: `${avgOxygenLevel}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="insight-card activity-card">
            <div className="card-header">
              <h3>
                <span className="material-symbols-rounded">timeline</span>
                Recent Activity
              </h3>
              <span className="activity-count">{alerts?.length || 0} events</span>
            </div>
            <div className="activity-feed">
              {alerts && alerts.length > 0 ? (
                alerts.slice(0, 4).map((alert, index) => (
                  <div key={index} className="activity-item">
                    <div className={`activity-dot ${alert.severity_level}`}></div>
                    <div className="activity-content">
                      <div className="activity-title">{alert.issue_detected}</div>
                      <div className="activity-meta">
                        <span className="patient-name">{alert.patient_name}</span>
                        <span className="activity-time">
                          {new Date(alert.datetime).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <span className="material-symbols-rounded">check_circle</span>
                  <p>No recent alerts - All patients stable</p>
                </div>
              )}
            </div>
            <div className="card-footer">
              <button className="view-all-btn" onClick={() => handleStatCardClick('alerts')}>
                View All Activity
                <span className="material-symbols-rounded">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Panel */}
      <div className="quick-access-section">
        <div className="quick-access-grid">
          <div className="access-card patients-access" onClick={() => handleStatCardClick('patients')}>
            <div className="access-icon">
              <span className="material-symbols-rounded">group</span>
            </div>
            <div className="access-content">
              <h4>Patient Management</h4>
              <p>Add, edit, and monitor patient records</p>
            </div>
            <div className="access-arrow">
              <span className="material-symbols-rounded">arrow_forward</span>
            </div>
          </div>

          <div className="access-card diagnostics-access" onClick={() => handleStatCardClick('test-center')}>
            <div className="access-icon">
              <span className="material-symbols-rounded">science</span>
            </div>
            <div className="access-content">
              <h4>Diagnostic Center</h4>
              <p>Run tests and simulations</p>
            </div>
            <div className="access-arrow">
              <span className="material-symbols-rounded">arrow_forward</span>
            </div>
          </div>

          <div className="access-card alerts-access" onClick={() => handleStatCardClick('alerts')}>
            <div className="access-icon">
              <span className="material-symbols-rounded">notifications_active</span>
            </div>
            <div className="access-content">
              <h4>Alert Management</h4>
              <p>Review and manage health alerts</p>
            </div>
            <div className="access-arrow">
              <span className="material-symbols-rounded">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-dashboard {
          width: 100%;
          padding: 0;
          background: transparent;
          min-height: auto;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 3rem 2rem;
          margin-bottom: 2rem;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .hero-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-text h1 {
          font-size: 3rem;
          font-weight: 800;
          margin: 0 0 1rem 0;
          background: linear-gradient(45deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-text p {
          font-size: 1.2rem;
          opacity: 0.9;
          margin: 0 0 1.5rem 0;
          max-width: 500px;
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 25px;
          backdrop-filter: blur(10px);
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-indicator.healthy {
          background: #10b981;
        }

        .status-indicator.warning {
          background: #f59e0b;
        }

        .status-indicator.critical {
          background: #ef4444;
        }

        .status-text {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .hero-stats {
          display: flex;
          flex-direction: column;
          align-items: end;
          gap: 1.5rem;
        }

        .live-time {
          text-align: right;
        }

        .time {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
        }

        .date {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
        }

        .quick-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .quick-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        /* KPI Section */
        .kpi-section {
          margin-bottom: 2rem;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .kpi-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .kpi-card.primary-card::before {
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .kpi-card.success-card::before {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .kpi-card.warning-card::before {
          background: linear-gradient(90deg, #f59e0b, #d97706);
        }

        .kpi-card.info-card::before {
          background: linear-gradient(90deg, #06b6d4, #0891b2);
        }

        .kpi-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .kpi-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .kpi-icon.primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .kpi-icon.success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .kpi-icon.warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .kpi-icon.info {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
        }

        .kpi-trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .kpi-trend.up {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .kpi-trend.down {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .kpi-trend.neutral {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
        }

        .kpi-content {
          margin-bottom: 1.5rem;
        }

        .kpi-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-0);
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .kpi-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-1);
          margin-bottom: 0.25rem;
        }

        .kpi-sublabel {
          font-size: 0.9rem;
          color: var(--text-2);
        }

        .kpi-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 60px;
        }

        /* Progress Ring */
        .progress-ring svg {
          width: 60px;
          height: 60px;
          transform: rotate(-90deg);
        }

        .bg-ring {
          fill: none;
          stroke: #e5e7eb;
          stroke-width: 2;
        }

        .progress-ring-path {
          fill: none;
          stroke: #667eea;
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dasharray 0.5s ease;
        }

        /* Pulse Animation */
        .pulse-animation {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pulse-dot {
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          position: relative;
          z-index: 2;
        }

        .pulse-wave {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid #10b981;
          border-radius: 50%;
          animation: pulse-wave 2s infinite;
        }

        .wave1 {
          animation-delay: 0s;
        }

        .wave2 {
          animation-delay: 1s;
        }

        @keyframes pulse-wave {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        /* Alert Indicator */
        .alert-indicator {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          font-size: 1.5rem;
        }

        .alert-indicator.active {
          animation: pulse 2s infinite;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        /* Uptime Chart */
        .uptime-chart {
          display: flex;
          align-items: end;
          gap: 4px;
          height: 40px;
          justify-content: center;
        }

        .chart-bar {
          width: 6px;
          background: linear-gradient(to top, #06b6d4, #0891b2);
          border-radius: 3px;
          animation: grow-bar 1s ease-out;
        }

        @keyframes grow-bar {
          from { height: 0; }
        }

        /* Insights Section */
        .insights-section {
          margin-bottom: 2rem;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 2rem;
        }

        .insight-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .card-header h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text-0);
          margin: 0;
        }

        .card-header span {
          color: #667eea;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .refresh-btn {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-strong);
          background: var(--bg-1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .activity-count {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        /* Vitals Display */
        .vitals-display {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .vital-metric {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: var(--bg-1);
          border-radius: 16px;
          border: 1px solid var(--border-subtle);
        }

        .vital-metric .metric-icon {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .vital-metric.heart-rate .metric-icon {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        }

        .vital-metric.oxygen-level .metric-icon {
          background: linear-gradient(135deg, #74b9ff, #0984e3);
        }

        .metric-info {
          flex: 1;
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-0);
          line-height: 1;
        }

        .metric-label {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-1);
          margin-bottom: 0.25rem;
        }

        .metric-unit {
          font-size: 1rem;
          color: var(--text-2);
        }

        .metric-chart {
          width: 100px;
          height: 40px;
          position: relative;
          overflow: hidden;
        }

        .heartbeat-line {
          width: 100%;
          height: 3px;
          background: #ff6b6b;
          position: relative;
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .metric-gauge {
          width: 100px;
          height: 8px;
          background: var(--bg-2);
          border-radius: 4px;
          overflow: hidden;
        }

        .gauge-fill {
          height: 100%;
          background: linear-gradient(90deg, #74b9ff, #0984e3);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        /* Activity Feed */
        .activity-feed {
          max-height: 300px;
          overflow-y: auto;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 0.75rem;
          transition: background 0.2s ease;
        }

        .activity-item:hover {
          background: var(--bg-2);
        }

        .activity-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .activity-dot.high {
          background: #ef4444;
        }

        .activity-dot.medium {
          background: #f59e0b;
        }

        .activity-dot.low {
          background: #06b6d4;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 600;
          color: var(--text-0);
          margin-bottom: 0.25rem;
        }

        .activity-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--text-2);
        }

        .patient-name {
          font-weight: 500;
        }

        .no-activity {
          text-align: center;
          padding: 2rem;
          color: var(--text-2);
        }

        .no-activity span {
          font-size: 3rem;
          color: #10b981;
          margin-bottom: 1rem;
          display: block;
        }

        .card-footer {
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        /* Quick Access */
        .quick-access-section {
          margin-bottom: 2rem;
        }

        .quick-access-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .access-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .access-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .access-icon {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          flex-shrink: 0;
        }

        .patients-access .access-icon {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .diagnostics-access .access-icon {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .alerts-access .access-icon {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .access-content {
          flex: 1;
        }

        .access-content h4 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-0);
          margin: 0 0 0.5rem 0;
        }

        .access-content p {
          font-size: 0.9rem;
          color: var(--text-2);
          margin: 0;
        }

        .access-arrow {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-2);
          color: var(--text-2);
          transition: all 0.2s ease;
        }

        .access-card:hover .access-arrow {
          background: var(--accent);
          color: white;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; transform: scale(1.05); }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .quick-access-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .modern-dashboard {
            padding: 1rem;
          }

          .hero-content {
            flex-direction: column;
            gap: 2rem;
            text-align: center;
          }

          .hero-stats {
            align-items: center;
          }

          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .hero-section {
            padding: 2rem 1.5rem;
          }

          .hero-text h1 {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 2rem 1rem;
          }

          .hero-text h1 {
            font-size: 2rem;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .quick-access-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions {
            flex-direction: column;
            width: 100%;
          }

          .vitals-display {
            gap: 1rem;
          }

          .vital-metric {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .metric-chart,
          .metric-gauge {
            width: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardView;