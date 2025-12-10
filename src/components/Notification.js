import React, { useState, useEffect } from 'react';

const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getAlertClass = () => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-success';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'bi-check-circle';
      case 'error':
        return 'bi-x-circle';
      case 'warning':
        return 'bi-exclamation-triangle';
      case 'info':
        return 'bi-info-circle';
      default:
        return 'bi-check-circle';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`alert ${getAlertClass()} alert-dismissible fade show position-fixed`}
      style={{
        top: '100px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      <i className={`bi ${getIcon()} me-2`}></i>
      {message}
      <button 
        type="button" 
        className="btn-close" 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose && onClose(), 300);
        }}
      ></button>
    </div>
  );
};

export default Notification;



