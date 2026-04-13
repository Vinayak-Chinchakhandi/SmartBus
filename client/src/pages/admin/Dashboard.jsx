import React from 'react';

function Dashboard() {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">Admin control panel for SmartBus</p>
      </div>

      {/* Analytics Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Analytics</h2>
        <p className="text-gray-600">View analytics and reports from the navigation menu.</p>
      </div>
    </div>
  );
}

export default Dashboard;