import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { BASE_URL } from '../../config/api';
import { useMapEvents } from 'react-leaflet';

function RerouteControl() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [blockagePoint, setBlockagePoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/routes`);
      const data = await res.json();
      setRoutes(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedRoute(data[0].id);
        fetchStops(data[0].id);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchStops = async (routeId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/stops/${routeId}`);
      if (res.ok) {
        const data = await res.json();
        setStops(Array.isArray(data) ? data.sort((a, b) => a.stop_order - b.stop_order) : []);
      }
      setBlockagePoint(null);
      setRouteOptions([]);
      setSelectedOption(null);
    } catch (err) {
      console.error('Error fetching stops:', err);
      setStops([]);
    }
  };

  const handleRouteChange = (routeId) => {
    setSelectedRoute(routeId);
    fetchStops(routeId);
  };

  const handleMapClick = (e) => {
    if (!selectedRoute) {
      setError('Please select a route first');
      return;
    }
    setBlockagePoint([e.latlng.lat, e.latlng.lng]);
    generateAlternativeRoutes([e.latlng.lat, e.latlng.lng]);
  };

  const generateAlternativeRoutes = async (blockage) => {
    if (!stops || stops.length < 2) return;

    const coords = stops.map(s => [s.latitude, s.longitude]);

    const start = coords[0];
    const end = coords[coords.length - 1];

    try {
      const baseUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

      const res1 = await fetch(baseUrl);
      const data1 = await res1.json();
      if (!data1.routes || data1.routes.length === 0) return;
      const route1 = data1.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      const mid = coords[Math.floor(coords.length / 2)];

      const altMid = [mid[0] + 0.01, mid[1] + 0.01];
      const res2 = await fetch(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${start[1]},${start[0]};${altMid[1]},${altMid[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
      const data2 = await res2.json();
      if (!data2.routes || data2.routes.length === 0) return;
      const route2 = data2.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      const altMid2 = [mid[0] - 0.01, mid[1] - 0.01];
      const res3 = await fetch(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${start[1]},${start[0]};${altMid2[1]},${altMid2[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
      const data3 = await res3.json();
      if (!data3.routes || data3.routes.length === 0) return;
      const route3 = data3.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      setRouteOptions([
        { id: 1, path: route1, label: "Original Route", color: "red" },
        { id: 2, path: route2, label: "AI Suggested Route", color: "green" },
        { id: 3, path: route3, label: "Alternative Route", color: "gray" }
      ]);

      setSelectedOption(2);

    } catch (err) {
      console.error("OSRM error", err);
    }
  };

  const getDistanceToLineSegment = (point, start, end) => {
    const dx = end[1] - start[1];
    const dy = end[0] - start[0];
    let t = ((point[1] - start[1]) * dx + (point[0] - start[0]) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    const projectionLat = start[0] + t * dy;
    const projectionLng = start[1] + t * dx;
    const latDiff = point[0] - projectionLat;
    const lngDiff = point[1] - projectionLng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  };

  const handleApplyRoute = async () => {
    const selectedRouteObj = routeOptions.find(r => r.id === selectedOption);

    if (!selectedRouteObj || !selectedRoute) {
      setError('No route selected');
      return;
    }

    const newRoutePath = selectedRouteObj.path;
    try {
      setIsApplying(true);
      setError(null);

      // Update all stops with new coordinates
      const updatePromises = stops.map((stop, index) => {
        const mappedIndex = Math.floor(
          (index / (stops.length - 1)) * (newRoutePath.length - 1)
        );

        const point = newRoutePath[mappedIndex] || newRoutePath[newRoutePath.length - 1];

        return fetch(`${BASE_URL}/api/stops/${stop.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: stop.name,
            latitude: point[0],
            longitude: point[1],
            stop_order: stop.stop_order
          })
        });
      });

      const results = await Promise.all(updatePromises);
      const allSuccess = results.every(res => res.ok);

      if (allSuccess) {
        setError(null);
        alert('Alternative route applied successfully!');
        setBlockagePoint(null);
        setRouteOptions([]);
        setSelectedOption(null);
        fetchStops(selectedRoute);
      } else {
        setError('Failed to apply some route updates');
      }

      setIsApplying(false);
    } catch (err) {
      setError(err.message);
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reroute control...</p>
        </div>
      </div>
    );
  }

  const currentRoute = stops.map(s => [s.latitude, s.longitude]);
  const center = stops.length > 0 ? [stops[0].latitude, stops[0].longitude] : [0, 0];

  const selectedRouteObj = routeOptions.find(r => r.id === selectedOption);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reroute Control</h1>
        <p className="text-gray-600 mt-2">Simulate and apply dynamic route changes</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Controls</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Route</label>
            <select
              value={selectedRoute || ''}
              onChange={(e) => handleRouteChange(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a route</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Stops</label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-800 font-medium">{stops.length} stops</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setBlockagePoint(null);
              setRouteOptions([]);
              setSelectedOption(null);
              setError(null);
            }}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition"
          >
            Clear Blockage
          </button>

          {routeOptions.length > 0 && (
            <button
              onClick={handleApplyRoute}
              disabled={isApplying}
              className={`px-6 py-2 font-medium rounded-lg text-white transition ${isApplying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
                }`}
            >
              {isApplying ? 'Applying...' : '✓ Apply Route'}
            </button>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Instructions:</span> Click on the map to simulate a blockage point.
            An alternative route will be generated. Review the preview and apply if satisfied.
          </p>
        </div>
      </div>

      {/* Map and Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Map */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
          {center[0] !== 0 ? (
            <MapContainer center={center} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Original Route (dashed) */}
              {currentRoute.length > 1 && (
                <Polyline
                  positions={currentRoute}
                  color="#2563eb"
                  weight={3}
                  dashArray="5, 5"
                  opacity={0.7}
                />
              )}

              {routeOptions.map(option => (
                <Polyline
                  key={option.id}
                  positions={option.path}
                  pathOptions={{
                    color: option.color,
                    weight: selectedOption === option.id ? 5 : 3,
                    dashArray: option.id === 1 ? "5,5" : "0"
                  }}
                />
              ))}

              {/* Stop Markers */}
              {stops.map(stop => (
                <Marker
                  key={stop.id}
                  position={[stop.latitude, stop.longitude]}
                  icon={L.icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [12, 41]
                  })}
                >
                  <Popup>{stop.name}</Popup>
                </Marker>
              ))}

              {/* Blockage Point */}
              {blockagePoint && (
                <Marker
                  position={blockagePoint}
                  icon={L.divIcon({
                    html: '<div style="font-size: 24px;">🚫</div>',
                    iconSize: [30, 30],
                    className: 'blockage-marker'
                  })}
                >
                  <Popup>Blockage Point</Popup>
                </Marker>
              )}

              {/* Map Click Handler */}
              <MapClickHandler onMapClick={handleMapClick} />
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No route selected</p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-3">Route Options</h3>

          {routeOptions.map(option => (
            <div
              key={option.id}
              className={`p-3 mb-2 rounded border ${selectedOption === option.id
                ? "border-green-500 bg-green-50"
                : "border-gray-200"
                }`}
            >

              <div className="flex items-center justify-between">
                <p className="font-semibold">{option.label}</p>

                {option.id === 2 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Recommended
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedOption(option.id)}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
              >
                Select
              </button>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-4">

          {/* Route Info */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-800 mb-3">Route Status</h3>
            {selectedRoute && stops.length > 0 ? (
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Selected Route:</span> {routes.find(r => r.id === selectedRoute)?.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Total Stops:</span> {stops.length}
                </p>
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="text-blue-800 text-xs font-medium">Original Route (Dashed)</p>
                </div>
                {routeOptions.length > 0 && (
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-green-800 text-xs font-medium">Alternative Route (Solid)</p>
                  </div>
                )}
                {blockagePoint && (
                  <div className="p-2 bg-red-50 rounded">
                    <p className="text-red-800 text-xs font-medium">Blockage Point: {blockagePoint[0].toFixed(4)}, {blockagePoint[1].toFixed(4)}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select a route to view details</p>
            )}
          </div>

          {/* Stops List */}
          <div className="bg-white rounded-lg shadow p-4 max-h-96 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-3">Stops</h3>
            <div className="space-y-2 text-sm">
              {stops.map(stop => (
                <div key={stop.id} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium text-gray-800">{stop.stop_order}. {stop.name}</p>
                  <p className="text-xs text-gray-600">{stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Click handler component for map
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e);
    }
  });

  return null;
}

export default RerouteControl;