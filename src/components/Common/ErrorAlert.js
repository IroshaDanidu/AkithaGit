import React from 'react';

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="alert alert--danger">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="material-symbols-rounded" style={{ marginRight: '8px' }}>
            error
          </span>
          <span>{message}</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn btn--icon" style={{ background: 'none', border: 'none' }}>
            <span className="material-symbols-rounded">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;