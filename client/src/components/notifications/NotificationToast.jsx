import React, { useEffect } from 'react';

function NotificationToast({ notification, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  const getStyle = () => {
    if (notification.type === 'delay') {
      return 'bg-red-500 text-white';
    }
    return 'bg-blue-500 text-white';
  };

  return (
    <div className={`p-4 rounded-lg shadow-lg ${getStyle()}`}>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{notification.message}</p>
        <button onClick={() => onRemove(notification.id)} className="ml-3">
          ✕
        </button>
      </div>
    </div>
  );
}

export default NotificationToast;