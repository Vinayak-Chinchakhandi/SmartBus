import React from 'react';

function Alerts() {
  const dummyNotifications = [
    { id: 1, type: 'arriving', message: 'Bus arriving at next stop in 2 minutes', time: '2 min ago' },
    { id: 2, type: 'delay', message: 'Bus delayed by 5 minutes', time: '5 min ago' },
    { id: 3, type: 'info', message: 'Route update: Stop 3 is closed', time: '10 min ago' },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'arriving': return 'text-blue-600';
      case 'delay': return 'text-red-600';
      case 'info': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Alerts</h1>

      <div className="bg-white rounded-lg shadow-md">
        {dummyNotifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No alerts at this time
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {dummyNotifications.map((notification) => (
              <div key={notification.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-medium ${getTypeColor(notification.type)}`}>
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;