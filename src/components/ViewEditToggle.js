import React from 'react';

const ViewEditToggle = ({ mode, onModeChange, disabled = false, className = '' }) => {
  return (
    <div className={`btn-group view-edit-toggle ${className}`} role="group">
      <button
        type="button"
        className={`btn btn-outline-primary ${mode === 'view' ? 'active' : ''}`}
        onClick={() => onModeChange('view')}
        disabled={disabled}
        title="View Mode"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button
        type="button"
        className={`btn btn-outline-primary ${mode === 'edit' ? 'active' : ''}`}
        onClick={() => onModeChange('edit')}
        disabled={disabled}
        title="Edit Mode"
      >
        <i className="bi bi-pencil"></i>
      </button>
    </div>
  );
};

export default ViewEditToggle;

