import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-1)', fontSize: 'var(--fs-body)' }}>
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;