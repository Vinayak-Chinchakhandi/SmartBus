import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config/api';

function AdminDashboard() {
  const [data, setData] = useState({
    routes: [],
    buses: [],
    stops: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [routesRes, busesRes, stopsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/routes`),
        fetch(`${BASE_URL}/api/buses`),
        fetch(`${BASE_URL}/api/stops/1`)
      ]);

      const routes = await routesRes.json();
      const buses = await busesRes.json();
      
      // Get stops for all routes
      let allStops = [];
      if (Array.isArray(routes) && routes.length > 0) {
        for (const route of routes) {
          try {
            const stopsRes = await fetch(`${BASE_URL}/api/stops/${route.id}`);
            if (stopsRes.ok) {
              const stops = await stopsRes.json();
              allStops = [...allStops, ...stops];
            }
          } catch (e) {
            console.error(`Error fetching stops for route ${route.id}:`, e);
          }
        }
      }

      setData({
        routes: Array.isArray(routes) ? routes : [],
        buses: Array.isArray(buses) ? buses : [],
        stops: allStops,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard data'
      }));
    }
  };

  const getOnTimeCount = () => {
    return data.buses.filter(bus => bus.status === 'on-time').length;
  };

  const getDelayedCount = () => {
    return data.buses.filter(bus => bus.status === 'delayed').length;
  };

  const getStopsPerRoute = () => {
    return data.routes.map(route => ({
      routeName: route.name,
      stopCount: data.stops.filter(stop => stop.route_id === route.id).length
    }));
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const onTimeCount = getOnTimeCount();
  const delayedCount = getDelayedCount();
  const stopsPerRoute = getStopsPerRoute();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and analytics</p>
      </div>

      {/* Error Alert */}
      {data.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{data.error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Routes */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Routes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{data.routes.length}</p>
            </div>
            <div className="text-4xl text-blue-500">🛣️</div>
          </div>
        </div>

        {/* Total Buses */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Buses</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{data.buses.length}</p>
            </div>
            <div className="text-4xl text-green-500">🚌</div>
          </div>
        </div>

        {/* Total Stops */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Stops</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{data.stops.length}</p>
            </div>
            <div className="text-4xl text-purple-500">📍</div>
          </div>
        </div>

        {/* On-Time vs Delayed */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">On-Time</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{onTimeCount}</p>
              <p className="text-sm text-red-600">Delayed: {delayedCount}</p>
            </div>
            <div className="text-4xl text-orange-500">⏱️</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bus Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Bus Status Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">On-Time</span>
                <span className="text-sm font-bold text-green-600">{onTimeCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${data.buses.length > 0 ? (onTimeCount / data.buses.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Delayed</span>
                <span className="text-sm font-bold text-red-600">{delayedCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${data.buses.length > 0 ? (delayedCount / data.buses.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 text-center text-sm text-gray-600">
              Total: {data.buses.length} buses
            </div>
          </div>
        </div>

        {/* Stops per Route */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Stops per Route</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stopsPerRoute.length > 0 ? (
              stopsPerRoute.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.routeName}</p>
                  </div>
                  <div className="flex items-center ml-4">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((item.stopCount / 15) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-bold text-gray-700 w-6 text-right">{item.stopCount}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No routes available</p>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;