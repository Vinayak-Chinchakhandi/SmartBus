import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { BASE_URL } from '../../config/api';

function RerouteControl() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeReroute, setActiveReroute] = useState(null);
  const [originalRoute, setOriginalRoute] = useState([]);
  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);

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
        let stopsData = Array.isArray(data) ? data.sort((a, b) => a.stop_order - b.stop_order) : [];
        setStops(stopsData);

        const coords = stopsData.map(s => [s.latitude, s.longitude]);

        if (coords.length >= 2) {
          const waypointString = coords
            .map(([lat, lng]) => `${lng},${lat}`)
            .join(';');

          const resRoute = await fetch(
            `https://routing.openstreetmap.de/routed-car/route/v1/driving/${waypointString}?overview=full&geometries=geojson`
          );

          const dataRoute = await resRoute.json();

          if (dataRoute.routes && dataRoute.routes.length > 0) {
            const route = dataRoute.routes[0].geometry.coordinates.map(
              ([lng, lat]) => [lat, lng]
            );
            setOriginalRoute(route);
          }
        }

        // Check for active reroute
        try {
          const rerouteRes = await fetch(`${BASE_URL}/api/reroutes/${routeId}`);
          if (rerouteRes.ok) {
            const reroute = await rerouteRes.json();
            if (reroute && reroute.reroute_path) {
              setActiveReroute(reroute);
            } else {
              setActiveReroute(null);
            }
          } else {
            setActiveReroute(null);
          }
        } catch (rerouteErr) {
          console.error('Error fetching reroute:', rerouteErr);
          setActiveReroute(null);
        }
      }
      setRouteOptions([]);
      setSelectedOption(null);
    } catch (err) {
      console.error('Error fetching stops:', err);
      setStops([]);
    }
  };

  const handleRouteChange = (routeId) => {
    setSelectedRoute(routeId);
    setActiveReroute(null); // Reset active reroute when changing routes
    fetchStops(routeId);
  };

  const handleResetRoute = async () => {
    try {
      // Call backend reset API
      const res = await fetch(`${BASE_URL}/api/reroutes/${selectedRoute}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error("Reset failed");
      }
    } catch (err) {
      console.error('Error resetting reroute:', err);
    }

    // Clear localStorage fallback
    setActiveReroute(null);
    setRouteOptions([]);
    setSelectedOption(null);
    setError(null);
  };

  const isPointNearRoute = (point, route, threshold = 0.01) => {
    if (!route || route.length < 2) return false;

    for (let i = 0; i < route.length - 1; i += 1) {
      const dist = getDistanceToLineSegment(point, route[i], route[i + 1]);
      if (dist < threshold) return true;
    }

    return false;
  };

  const generateAlternativeRoutes = async () => {
    if (!stops || stops.length < 2) return;

    const coords = stops.map(s => [s.latitude, s.longitude]);

    const OSRM_URL = (str) =>
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${str}?overview=full&geometries=geojson`;

    const fetchRoute = async (waypointString) => {
      const res = await fetch(OSRM_URL(waypointString));
      const data = await res.json();
      if (!data.routes || data.routes.length === 0) return null;

      return {
        path: data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distance: data.routes[0].distance
      };
    };

    try {
      // const originalRoute = await fetchRoute(fullWaypointString);
      const original = originalRoute; // from useState
      if (!originalRoute || originalRoute.length === 0) return;

      if (!fromStop || !toStop) {
        setError("Select both stops");
        return;
      }

      const startIndex = stops.findIndex(s => s.stop_order === fromStop);
      const endIndex = stops.findIndex(s => s.stop_order === toStop);

      if (startIndex === -1 || endIndex === -1 || startIndex === endIndex) {
        setError("Invalid stop selection");
        return;
      }

      const start = coords[startIndex];
      const end = coords[endIndex];

      const generateDetourPoints = (startCoord, endCoord) => {
        const dx = endCoord[1] - startCoord[1];
        const dy = endCoord[0] - startCoord[0];

        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return [];

        const perp1 = [-dy / length, dx / length];
        const perp2 = [dy / length, -dx / length];

        const distances = [0.002, 0.004, 0.006];

        const mid = [
          (startCoord[0] + endCoord[0]) / 2,
          (startCoord[1] + endCoord[1]) / 2
        ];

        const points = [];

        distances.forEach(d => {
          points.push([
            startCoord,
            [mid[0] + perp1[0] * d, mid[1] + perp1[1] * d],
            endCoord
          ]);

          points.push([
            startCoord,
            [mid[0] + perp2[0] * d, mid[1] + perp2[1] * d],
            endCoord
          ]);
        });

        return points;
      };

      const variations = generateDetourPoints(start, end);

      const alternatives = await Promise.all(
        variations.map(points => {
          const str = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
          return fetchRoute(str);
        })
      );

      const validAlternatives = alternatives.filter(Boolean);

      if (validAlternatives.length === 0) {
        setError("⚠️ No alternative route found. Try different stops.");
        return;
      }

      // 🔥 Pick best route based on distance score
      const bestRoute = validAlternatives.reduce((best, current) => {
        const score = current.distance;

        return score < best.score
          ? { ...current, score }
          : best;
      }, { ...validAlternatives[0], score: validAlternatives[0].distance });

      // ❗ IMPORTANT: DO NOT MERGE with stops
      // Use clean OSRM geometry
      // 🔥 Split original route into segments
      const findClosestIndex = (point, route) => {
        let minDist = Infinity;
        let index = 0;

        route.forEach((coord, i) => {
          const d =
            Math.pow(coord[0] - point[0], 2) +
            Math.pow(coord[1] - point[1], 2);

          if (d < minDist) {
            minDist = d;
            index = i;
          }
        });

        return index;
      };

      const routeStartIndex = findClosestIndex(start, originalRoute);
      const routeEndIndex = findClosestIndex(end, originalRoute);

      // 🛑 Ensure correct order
      const safeStart = Math.min(routeStartIndex, routeEndIndex);
      const safeEnd = Math.max(routeStartIndex, routeEndIndex);

      const beforeSegment = originalRoute.slice(0, safeStart);
      const afterSegment = originalRoute.slice(safeEnd);

      // 🔥 Merge properly
      const finalPath = [
        ...beforeSegment,
        ...bestRoute.path,
        ...afterSegment
      ].filter(p => Array.isArray(p) && p.length === 2);

      // 🔹 Show options
      if (
        !bestRoute ||
        !bestRoute.path ||
        bestRoute.path.length === 0
      ) {
        console.error("Invalid best route");
        return;
      }

      if (
        !Array.isArray(finalPath) ||
        finalPath.length === 0 ||
        finalPath.some(p => !p || p.length !== 2)
      ) {
        console.error("Invalid final path", finalPath);
        return;
      }

      setRouteOptions([
        { id: 1, path: originalRoute, label: "Original Route", color: "#ef4444" },
        { id: 2, path: finalPath, label: "Alternative Route", color: "#10b981" }
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

    try {
      setIsApplying(true);
      setError(null);

      // Send reroute to backend API
      const response = await fetch(`${BASE_URL}/api/reroutes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route_id: selectedRoute,
          reroute_path: selectedRouteObj.path
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save reroute');
      }

      setError(null);
      alert('Alternative route applied successfully!');
      setRouteOptions([]);
      setSelectedOption(null);
      setActiveReroute({
        route_id: selectedRoute,
        reroute_path: selectedRouteObj.path
      });
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

  const currentRoute = activeReroute
    ? activeReroute.reroute_path
    : originalRoute; const center = stops.length > 0 ? [stops[0].latitude, stops[0].longitude] : [0, 0];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

          {/* FROM */}
          <div className="bg-blue-50 p-3 rounded-lg border">
            <label className="block text-sm font-semibold text-blue-700 mb-2">
              🚏 From Stop
            </label>
            <select
              value={fromStop || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFromStop(val ? parseInt(val) : null);
              }}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Start Stop</option>
              {stops.map(stop => (
                <option key={stop.id} value={stop.stop_order}>
                  {stop.stop_order}. {stop.name}
                </option>
              ))}
            </select>
          </div>

          {/* TO */}
          <div className="bg-green-50 p-3 rounded-lg border">
            <label className="block text-sm font-semibold text-green-700 mb-2">
              🎯 To Stop
            </label>
            <select
              value={toStop || ''}
              onChange={(e) => {
                const val = e.target.value;
                setToStop(val ? parseInt(val) : null);
              }}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select End Stop</option>
              {stops.map(stop => (
                <option key={stop.id} value={stop.stop_order}>
                  {stop.stop_order}. {stop.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setRouteOptions([]);
              setSelectedOption(null);
              setError(null);
            }}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition"
          >
            Clear Blockage
          </button>

          <button
            onClick={handleResetRoute}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
          >
            Reset to Original
          </button>

          <button
            onClick={generateAlternativeRoutes}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            Generate Reroute
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
            <span className="font-semibold">💡 Instructions:</span> Select From and To stops, then click "Generate Reroute" to create an alternative route for that segment.
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

              {/* Original Route (dashed) or Active Reroute (solid) */}
              {currentRoute.length > 1 && (
                <Polyline
                  positions={currentRoute}
                  color={activeReroute ? "#10b981" : "#2563eb"}
                  weight={3}
                  dashArray={activeReroute ? "0" : "5, 5"}
                  opacity={0.7}
                />
              )}

              {routeOptions.map(option => (
                Array.isArray(option.path) &&
                option.path.length > 1 && (
                  <Polyline
                    key={option.id}
                    positions={option.path}
                    pathOptions={{
                      color: option.color,
                      weight: selectedOption === option.id ? 5 : 3,
                      dashArray: option.id === 1 ? "5,5" : "0"
                    }}
                  />
                )
              ))}

              {/* Stop Markers */}
              {stops.map(stop => {
                const isFrom = stop.stop_order === fromStop;
                const isTo = stop.stop_order === toStop;

                return (
                  <Marker
                    key={stop.id}
                    position={[stop.latitude, stop.longitude]}
                    icon={L.divIcon({
                      html: `<div style="
                        background:${isFrom ? 'blue' : isTo ? 'green' : 'gray'};
                        width:14px;
                        height:14px;
                        border-radius:50%;
                      "></div>`,
                      className: ''
                    })}
                  >
                    <Popup>{stop.name}</Popup>
                  </Marker>
                );
              })}
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
                {activeReroute && (
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-green-800 text-xs font-medium">Active Reroute (Solid)</p>
                  </div>
                )}
                {routeOptions.length > 0 && (
                  <div className="p-2 bg-yellow-50 rounded">
                    <p className="text-yellow-800 text-xs font-medium">Preview Routes</p>
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

export default RerouteControl;






