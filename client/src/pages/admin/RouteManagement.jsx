import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config/api';

function RouteManagement() {
  const [activeTab, setActiveTab] = useState('routes');
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [routeForm, setRouteForm] = useState({ name: '', color: '' });
  const [busForm, setBusForm] = useState({ bus_number: '', route_id: '', driver_name: '', driver_phone: '' });
  const [stopForm, setStopForm] = useState({ name: '', latitude: '', longitude: '', stop_order: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [routesRes, busesRes] = await Promise.all([
        fetch(`${BASE_URL}/api/routes`),
        fetch(`${BASE_URL}/api/buses`)
      ]);

      const routesData = await routesRes.json();
      const busesData = await busesRes.json();

      setRoutes(Array.isArray(routesData) ? routesData : []);
      setBuses(Array.isArray(busesData) ? busesData : []);

      // Fetch stops for first route if exists
      if (Array.isArray(routesData) && routesData.length > 0) {
        setSelectedRoute(routesData[0].id);
        fetchStops(routesData[0].id);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchStops = async (routeId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/stops/${routeId}`);
      if (res.ok) {
        const data = await res.json();
        setStops(Array.isArray(data) ? data : []);
      } else {
        setStops([]);
      }
    } catch (err) {
      console.error('Error fetching stops:', err);
      setStops([]);
    }
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${BASE_URL}/api/routes/${editingId}` : `${BASE_URL}/api/routes`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: routeForm.name })
      });

      if (!res.ok) throw new Error('Failed to save route');

      setRouteForm({ name: '', color: '' });
      setEditingId(null);
      fetchAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRouteDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/routes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete route');
      fetchAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBusSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${BASE_URL}/api/buses/${editingId}` : `${BASE_URL}/api/buses`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bus_number: busForm.bus_number,
          route_id: parseInt(busForm.route_id),
          driver_name: busForm.driver_name,
          driver_phone: busForm.driver_phone
        })
      });

      if (!res.ok) throw new Error('Failed to save bus');

      setBusForm({ bus_number: '', route_id: '', driver_name: '', driver_phone: '' });
      setEditingId(null);
      fetchAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBusDelete = async (id) => {
    if (!window.confirm('Delete this bus?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/buses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete bus');
      fetchAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStopSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${BASE_URL}/api/stops/${editingId}` : `${BASE_URL}/api/stops`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route_id: parseInt(selectedRoute),
          name: stopForm.name,
          latitude: parseFloat(stopForm.latitude),
          longitude: parseFloat(stopForm.longitude),
          stop_order: parseInt(stopForm.stop_order)
        })
      });

      if (!res.ok) throw new Error('Failed to save stop');

      setStopForm({ name: '', latitude: '', longitude: '', stop_order: '' });
      setEditingId(null);
      fetchStops(selectedRoute);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStopDelete = async (id) => {
    if (!window.confirm('Delete this stop?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/stops/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete stop');
      fetchStops(selectedRoute);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Route Management</h1>
        <p className="text-gray-600 mt-2">Manage routes, buses, and stops</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'routes', label: 'Routes', icon: '🛣️' },
          { id: 'buses', label: 'Buses', icon: '🚌' },
          { id: 'stops', label: 'Stops', icon: '📍' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ROUTES TAB */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? 'Edit Route' : 'Add New Route'}
            </h3>
            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
                <input
                  type="text"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                  placeholder="e.g., Route 1, Downtown Express"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
                >
                  {editingId ? 'Update Route' : 'Add Route'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setRouteForm({ name: '', color: '' });
                    }}
                    className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Routes Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stops</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Buses</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => {
                  const routeStops = stops.filter(s => s.route_id === route.id);
                  const routeBuses = buses.filter(b => b.route_id === route.id);
                  return (
                    <tr key={route.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-700">{route.id}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">{route.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{routeStops.length}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{routeBuses.length}</td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(route.id);
                            setRouteForm({ name: route.name, color: '' });
                          }}
                          className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRouteDelete(route.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BUSES TAB */}
      {activeTab === 'buses' && (
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? 'Edit Bus' : 'Add New Bus'}
            </h3>
            <form onSubmit={handleBusSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bus Number</label>
                <input
                  type="text"
                  value={busForm.bus_number}
                  onChange={(e) => setBusForm({ ...busForm, bus_number: e.target.value })}
                  placeholder="e.g., BUS-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                <select
                  value={busForm.route_id}
                  onChange={(e) => setBusForm({ ...busForm, route_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>{route.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
                <input
                  type="text"
                  value={busForm.driver_name}
                  onChange={(e) => setBusForm({ ...busForm, driver_name: e.target.value })}
                  placeholder="Driver name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Phone</label>
                <input
                  type="tel"
                  value={busForm.driver_phone}
                  onChange={(e) => setBusForm({ ...busForm, driver_phone: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
                >
                  {editingId ? 'Update Bus' : 'Add Bus'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setBusForm({ bus_number: '', route_id: '', driver_name: '', driver_phone: '' });
                    }}
                    className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Buses Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bus Number</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Route</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">{bus.bus_number}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{bus.route_name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{bus.driver_name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{bus.driver_phone}</td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(bus.id);
                          setBusForm({
                            bus_number: bus.bus_number,
                            route_id: bus.route_id,
                            driver_name: bus.driver_name,
                            driver_phone: bus.driver_phone
                          });
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleBusDelete(bus.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOPS TAB */}
      {activeTab === 'stops' && (
        <div className="space-y-6">
          {/* Route Selector */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Route</label>
            <select
              value={selectedRoute || ''}
              onChange={(e) => {
                setSelectedRoute(parseInt(e.target.value));
                fetchStops(parseInt(e.target.value));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a route</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
          </div>

          {/* Add/Edit Form */}
          {selectedRoute && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingId ? 'Edit Stop' : 'Add New Stop'}
              </h3>
              <form onSubmit={handleStopSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stop Name</label>
                  <input
                    type="text"
                    value={stopForm.name}
                    onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
                    placeholder="e.g., Main Station"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stop Order</label>
                  <input
                    type="number"
                    value={stopForm.stop_order}
                    onChange={(e) => setStopForm({ ...stopForm, stop_order: e.target.value })}
                    placeholder="1, 2, 3..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={stopForm.latitude}
                    onChange={(e) => setStopForm({ ...stopForm, latitude: e.target.value })}
                    placeholder="40.7128"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={stopForm.longitude}
                    onChange={(e) => setStopForm({ ...stopForm, longitude: e.target.value })}
                    placeholder="-74.0060"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
                  >
                    {editingId ? 'Update Stop' : 'Add Stop'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setStopForm({ name: '', latitude: '', longitude: '', stop_order: '' });
                      }}
                      className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Stops Table */}
          {selectedRoute && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Latitude</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Longitude</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stops.map((stop) => (
                    <tr key={stop.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">{stop.stop_order}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{stop.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{stop.latitude.toFixed(5)}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{stop.longitude.toFixed(5)}</td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(stop.id);
                            setStopForm({
                              name: stop.name,
                              latitude: stop.latitude,
                              longitude: stop.longitude,
                              stop_order: stop.stop_order
                            });
                          }}
                          className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleStopDelete(stop.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RouteManagement;