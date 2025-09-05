import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorAlert from './components/Common/ErrorAlert';
import DashboardView from './components/Dashboard/DashboardView';
import { useAppContext } from './context/AppContext';
import './App.css';
import './styles/light-modern.css';

// Import other views (you'll need to create these similar to the dashboard)
const PatientsView = React.lazy(() => import('./components/Patients/PatientsView'));
const AlertsView = React.lazy(() => import('./components/Alerts/AlertsView'));
const TestCenter = React.lazy(() => import('./components/TestCenter/TestCenter'));

const MainContent = () => {
  const { 
    patients, 
    alerts, 
    stats, 
    loading, 
    error, 
    clearError 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false); // Close mobile menu when navigating
  };

  const renderContent = () => {
    // Show loading spinner only when initially loading data
    if (loading && patients.length === 0 && alerts.length === 0 && Object.keys(stats).length === 0) {
      return (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        {activeTab === 'dashboard' && (
          <DashboardView 
            stats={stats} 
            alerts={alerts} 
            patients={patients}
            onNavigate={handleNavigate}
          />
        )}
        
        {activeTab === 'patients' && (
          <PatientsView patients={patients} />
        )}
        
        {activeTab === 'alerts' && (
          <AlertsView alerts={alerts} />
        )}
        
        {activeTab === 'test' && (
          <TestCenter patients={patients} />
        )}
      </React.Suspense>
    );
  };

  return (
    <div className="app app--light-modern">
      <div className="app-shell" style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside className={`modern-sidenav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Brand Header */}
          <div className="nav-header">
            <div className="brand-container">
              <div className="brand-logo">
                <span className="material-symbols-rounded">medical_services</span>
              </div>
              <div className="brand-info">
                <div className="brand-title">HealthSync</div>
                <div className="brand-subtitle">Smart Healthcare</div>
              </div>
            </div>
            <div className="user-status">
              <div className="status-dot online"></div>
              <span className="status-text">Online</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="nav-menu">
            <div className="menu-section">
              <div className="section-label">Main Dashboard</div>
              
              <div 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
                onClick={() => setActiveTab('dashboard')}
              >
                <div className="nav-icon dashboard-icon">
                  <span className="material-symbols-rounded">monitoring</span>
                </div>
                <div className="nav-content">
                  <span className="nav-label">Overview</span>
                  <span className="nav-description">System dashboard</span>
                </div>
                <div className="nav-indicator">
                  <div className="indicator-dot"></div>
                </div>
              </div>
            </div>

            <div className="menu-section">
              <div className="section-label">Patient Management</div>
              
              <div 
                className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} 
                onClick={() => setActiveTab('patients')}
              >
                <div className="nav-icon patients-icon">
                  <span className="material-symbols-rounded">group</span>
                </div>
                <div className="nav-content">
                  <span className="nav-label">Patient Care</span>
                  <span className="nav-description">Manage patients</span>
                </div>
                <div className="nav-badge">
                  <span>{patients?.length || 0}</span>
                </div>
              </div>

              <div 
                className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} 
                onClick={() => setActiveTab('alerts')}
              >
                <div className="nav-icon alerts-icon">
                  <span className="material-symbols-rounded">notifications_active</span>
                </div>
                <div className="nav-content">
                  <span className="nav-label">Health Alerts</span>
                  <span className="nav-description">Monitor alerts</span>
                </div>
                <div className="nav-badge alert-badge">
                  <span>{alerts?.filter(alert => !alert.resolved).length || 0}</span>
                </div>
              </div>
            </div>

            <div className="menu-section">
              <div className="section-label">Diagnostics</div>
              
              <div 
                className={`nav-item ${activeTab === 'test' ? 'active' : ''}`} 
                onClick={() => setActiveTab('test')}
              >
                <div className="nav-icon diagnostics-icon">
                  <span className="material-symbols-rounded">science</span>
                </div>
                <div className="nav-content">
                  <span className="nav-label">Test Center</span>
                  <span className="nav-description">Run diagnostics</span>
                </div>
                <div className="nav-arrow">
                  <span className="material-symbols-rounded">chevron_right</span>
                </div>
              </div>
            </div>
          </nav>

          {/* Quick Stats Card */}
          <div className="nav-stats-card">
            <div className="stats-header">
              <span className="material-symbols-rounded">analytics</span>
              <span>Quick Stats</span>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{patients?.length || 0}</span>
                <span className="stat-label">Patients</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{patients?.filter(p => p.connection_status === 'Online').length || 0}</span>
                <span className="stat-label">Online</span>
              </div>
              <div className="stat-item critical">
                <span className="stat-value">{alerts?.filter(a => a.severity_level === 'high' && !a.resolved).length || 0}</span>
                <span className="stat-label">Critical</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="nav-footer">
            <div className="system-info">
              <div className="system-status">
                <div className="status-indicator healthy"></div>
                <span>System Healthy</span>
              </div>
              <div className="version-info">v2.1.0</div>
            </div>
          </div>

          <style jsx>{`
            .modern-sidenav {
              width: 300px;
              height: 100vh;
              background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
              border-right: 1px solid rgba(148, 163, 184, 0.1);
              display: flex;
              flex-direction: column;
              position: fixed;
              left: 0;
              top: 0;
              z-index: 1000;
              overflow-y: auto;
              box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
              flex-shrink: 0;
            }

            /* Brand Header */
            .nav-header {
              padding: 2rem 1.5rem 1.5rem;
              border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            }

            .brand-container {
              display: flex;
              align-items: center;
              gap: 1rem;
              margin-bottom: 1rem;
            }

            .brand-logo {
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 1.5rem;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            .brand-info {
              flex: 1;
            }

            .brand-title {
              font-size: 1.5rem;
              font-weight: 700;
              color: white;
              line-height: 1.2;
              margin-bottom: 0.25rem;
            }

            .brand-subtitle {
              font-size: 0.875rem;
              color: #94a3b8;
              font-weight: 500;
            }

            .user-status {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.75rem 1rem;
              background: rgba(16, 185, 129, 0.1);
              border: 1px solid rgba(16, 185, 129, 0.2);
              border-radius: 8px;
            }

            .status-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              animation: pulse 2s infinite;
            }

            .status-dot.online {
              background: #10b981;
            }

            .status-text {
              font-size: 0.875rem;
              color: #10b981;
              font-weight: 500;
            }

            /* Navigation Menu */
            .nav-menu {
              flex: 1;
              padding: 1.5rem 0;
            }

            .menu-section {
              margin-bottom: 2rem;
            }

            .section-label {
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
              padding: 0 1.5rem 1rem;
            }

            .nav-item {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 1rem 1.5rem;
              margin: 0.25rem 1rem;
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              background: transparent;
            }

            .nav-item:hover {
              background: rgba(148, 163, 184, 0.1);
              transform: translateX(4px);
            }

            .nav-item.active {
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
              border: 1px solid rgba(102, 126, 234, 0.3);
              transform: translateX(4px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
            }

            .nav-item.active::before {
              content: '';
              position: absolute;
              left: -1rem;
              top: 50%;
              transform: translateY(-50%);
              width: 4px;
              height: 30px;
              background: linear-gradient(180deg, #667eea, #764ba2);
              border-radius: 2px;
            }

            .nav-icon {
              width: 40px;
              height: 40px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.25rem;
              flex-shrink: 0;
            }

            .nav-icon.dashboard-icon {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
            }

            .nav-icon.patients-icon {
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
            }

            .nav-icon.alerts-icon {
              background: linear-gradient(135deg, #f59e0b, #d97706);
              color: white;
            }

            .nav-icon.diagnostics-icon {
              background: linear-gradient(135deg, #06b6d4, #0891b2);
              color: white;
            }

            .nav-content {
              flex: 1;
            }

            .nav-label {
              display: block;
              font-size: 1rem;
              font-weight: 600;
              color: white;
              line-height: 1.2;
              margin-bottom: 0.25rem;
            }

            .nav-description {
              font-size: 0.75rem;
              color: #94a3b8;
              line-height: 1;
            }

            .nav-indicator {
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .indicator-dot {
              width: 8px;
              height: 8px;
              background: #10b981;
              border-radius: 50%;
              animation: pulse 2s infinite;
            }

            .nav-item:not(.active) .indicator-dot {
              display: none;
            }

            .nav-badge {
              padding: 0.25rem 0.5rem;
              background: rgba(59, 130, 246, 0.2);
              color: #60a5fa;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 600;
              min-width: 24px;
              text-align: center;
            }

            .nav-badge.alert-badge {
              background: rgba(239, 68, 68, 0.2);
              color: #f87171;
            }

            .nav-arrow {
              color: #64748b;
              transition: all 0.2s ease;
            }

            .nav-item:hover .nav-arrow,
            .nav-item.active .nav-arrow {
              color: #94a3b8;
              transform: translateX(2px);
            }

            /* Quick Stats Card */
            .nav-stats-card {
              margin: 0 1rem 1.5rem;
              padding: 1.5rem;
              background: rgba(30, 41, 59, 0.8);
              border: 1px solid rgba(148, 163, 184, 0.1);
              border-radius: 16px;
              backdrop-filter: blur(10px);
            }

            .stats-header {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin-bottom: 1rem;
              color: white;
              font-weight: 600;
              font-size: 0.9rem;
            }

            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1rem;
            }

            .stat-item {
              text-align: center;
            }

            .stat-value {
              display: block;
              font-size: 1.25rem;
              font-weight: 700;
              color: white;
              line-height: 1;
              margin-bottom: 0.25rem;
            }

            .stat-item.critical .stat-value {
              color: #f87171;
            }

            .stat-label {
              font-size: 0.75rem;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            /* Footer */
            .nav-footer {
              padding: 1.5rem;
              border-top: 1px solid rgba(148, 163, 184, 0.1);
            }

            .system-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .system-status {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              font-size: 0.875rem;
              color: #94a3b8;
            }

            .status-indicator {
              width: 8px;
              height: 8px;
              border-radius: 50%;
            }

            .status-indicator.healthy {
              background: #10b981;
              animation: pulse 2s infinite;
            }

            .version-info {
              font-size: 0.75rem;
              color: #64748b;
              font-weight: 500;
            }

            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }

            /* Responsive Design */
            .main-content {
              margin-left: 300px;
              padding: 2rem;
              overflow: auto;
              min-height: 100vh;
              flex: 1;
              transition: all 0.3s ease;
              background: var(--bg-0, #f8fafc);
              width: calc(100% - 300px);
            }

            .app-shell {
              display: flex;
              min-height: 100vh;
              position: relative;
            }

            /* Tablet Responsive */
            @media (max-width: 1024px) {
              .modern-sidenav {
                width: 80px;
              }

              .brand-info,
              .nav-content,
              .nav-badge,
              .nav-arrow,
              .section-label,
              .nav-stats-card,
              .nav-footer {
                display: none;
              }

              .brand-container {
                justify-content: center;
              }

              .nav-item {
                justify-content: center;
                margin: 0.25rem 0.5rem;
                padding: 1rem 0.5rem;
              }

              .nav-icon {
                margin: 0;
              }

              .user-status {
                justify-content: center;
                padding: 0.5rem;
              }

              .status-text {
                display: none;
              }
              
              .main-content {
                margin-left: 80px;
                width: calc(100% - 80px);
                padding: 1.5rem;
              }
            }

            /* Mobile Menu Toggle */
            .mobile-menu-toggle {
              display: none;
              position: fixed;
              top: 1rem;
              left: 1rem;
              z-index: 10000;
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              border: none;
              border-radius: 12px;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 4px;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .mobile-menu-toggle span {
              width: 20px;
              height: 2px;
              background: white;
              border-radius: 1px;
              transition: all 0.3s ease;
            }

            .mobile-menu-toggle.active span:nth-child(1) {
              transform: rotate(45deg) translate(5px, 5px);
            }

            .mobile-menu-toggle.active span:nth-child(2) {
              opacity: 0;
            }

            .mobile-menu-toggle.active span:nth-child(3) {
              transform: rotate(-45deg) translate(7px, -6px);
            }

            .mobile-backdrop {
              display: none;
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
              .mobile-menu-toggle {
                display: flex;
              }

              .mobile-backdrop {
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
              }

              .modern-sidenav {
                transform: translateX(-100%);
                position: fixed;
                z-index: 9999;
                width: 280px;
                transition: transform 0.3s ease;
              }

              .modern-sidenav.mobile-open {
                transform: translateX(0);
              }
              
              .main-content {
                margin-left: 0;
                width: 100%;
                padding: 1rem;
                padding-top: 5rem; /* Space for mobile toggle button */
              }
              
              .app-shell {
                position: relative;
              }
            }

            /* Small Mobile */
            @media (max-width: 480px) {
              .main-content {
                padding: 0.75rem;
              }
            }
          `}</style>
        </aside>

        <main className="main-content">
          {/* Error Display */}
          {error && (
            <div className="alert alert--danger">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{error}</span>
                <button className="btn btn--icon" onClick={clearError} style={{ background: 'none', border: 'none' }}>
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="content-area">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;