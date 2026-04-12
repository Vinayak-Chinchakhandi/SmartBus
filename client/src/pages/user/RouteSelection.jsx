import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutes } from '../../api/routes';
import { getStops } from '../../api/stops';

function RouteSelection() {
const [routes, setRoutes] = useState([]);
const [stops, setStops] = useState([]);

const [selectedRouteId, setSelectedRouteId] = useState('');
const [selectedStopId, setSelectedStopId] = useState('');

const navigate = useNavigate();

// 🔹 Load routes from DB
useEffect(() => {
const fetchRoutes = async () => {
try {
const data = await getRoutes();
setRoutes(data);
} catch (err) {
console.error(err);
}
};

fetchRoutes();

}, []);

// 🔹 Load stops when route changes
useEffect(() => {
if (!selectedRouteId) return;

const fetchStops = async () => {
  try {
    const data = await getStops(selectedRouteId);
    setStops(data);
  } catch (err) {
    console.error(err);
  }
};

fetchStops();

}, [selectedRouteId]);

// 🔥 Confirm selection
const handleConfirm = () => {
localStorage.setItem('selectedRouteId', selectedRouteId);
localStorage.setItem('selectedStopId', selectedStopId);

navigate('/tracking');

};

return ( <div className="max-w-2xl mx-auto p-6"> <h1 className="text-3xl font-bold text-gray-800 mb-8">Route Selection</h1>

  <div className="bg-white p-6 rounded-lg shadow-md">

    {/* ROUTE */}
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">
        Select Route
      </label>

      <select
        value={selectedRouteId}
        onChange={(e) => {
          setSelectedRouteId(e.target.value);
          setSelectedStopId('');
        }}
        className="w-full px-4 py-2 border rounded-lg"
      >
        <option value="">Choose a route</option>
        {routes.map((route) => (
          <option key={route.id} value={route.id}>
            {route.name}
          </option>
        ))}
      </select>
    </div>

    {/* STOPS */}
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">
        Select Stop
      </label>

      <select
        value={selectedStopId}
        onChange={(e) => setSelectedStopId(e.target.value)}
        disabled={!selectedRouteId}
        className="w-full px-4 py-2 border rounded-lg"
      >
        <option value="">Choose a stop</option>
        {stops.map((stop) => (
          <option key={stop.id} value={stop.id}>
            {stop.name}
          </option>
        ))}
      </select>
    </div>

    {/* BUTTON */}
    <div className="text-center">
      <button
        onClick={handleConfirm}
        disabled={!selectedRouteId || !selectedStopId}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Start Tracking
      </button>
    </div>

    {/* PREVIEW */}
    {(selectedRouteId || selectedStopId) && (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p>Route ID: {selectedRouteId || 'None'}</p>
        <p>Stop ID: {selectedStopId || 'None'}</p>
      </div>
    )}

  </div>
</div>

);
}

export default RouteSelection;
