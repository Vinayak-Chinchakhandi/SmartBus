import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import MapView from '../../components/map/MapView';
import { BASE_URL } from '../../config/api';
import { updateBusState, getPositionAtProgress, calculateAngle } from '../../services/simulation/movementEngine';

function LiveMonitor() {
  const [data, setData] = useState({
    routes: [],
    buses: [],
    stops: [],
    loading: true,
    error: null
  });

  const [busPositions, setBusPositions] = useState({});
  const [busStates, setBusStates] = useState({});
  const [movementRoutes, setMovementRoutes] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const colorMap = {
    1: '#2563eb',
    2: '#dc2626',
    3: '#16a34a',
    4: '#f59e0b'
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const fetchLiveData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const [routesRes, busesRes] = await Promise.all([
        fetch(`${BASE_URL}/api/routes`),
        fetch(`${BASE_URL}/api/buses`)
      ]);

      const routes = routesRes.ok ? await routesRes.json() : [];
      const buses = busesRes.ok ? await busesRes.json() : [];

      const allStops = await Promise.all(
        routes.map(async route => {
          try {
            const stopsRes = await fetch(`${BASE_URL}/api/stops/${route.id}`);
            return stopsRes.ok ? await stopsRes.json() : [];
          } catch (error) {
            console.error(`Error fetching stops for route ${route.id}:`, error);
            return [];
          }
        })
      ).then(results => results.flat());

      setData({
        routes,
        buses,
        stops: allStops,
        loading: false,
        error: null
      });

      const initialStates = {};
      buses.forEach(bus => {
        initialStates[bus.id] = {
          segmentIndex: 0,
          progress: 0,
          direction: 'forward',
          speed: 0.00001
        };
      });
      setBusStates(initialStates);
      setIsRunning(true);
    } catch (error) {
      console.error('Error fetching live data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load live data'
      }));
    }
  };

  useEffect(() => {
    if (!isRunning || data.buses.length === 0 || data.stops.length === 0) return;

    const interval = setInterval(() => {
      setBusPositions(prevPositions => {
        const newPositions = { ...prevPositions };

        setBusStates(prevStates => {
          const newStates = { ...prevStates };

          data.buses.forEach(bus => {
            const routeStops = data.stops
              .filter(stop => stop.route_id === bus.route_id)
              .sort((a, b) => a.stop_order - b.stop_order);

            if (routeStops.length < 2) return;

            const route =
              movementRoutes[bus.route_id] ||
              routeStops.map(stop => [stop.latitude, stop.longitude]);
            const currentState = prevStates[bus.id] || { segmentIndex: 0, progress: 0, direction: 'forward', speed: 0.00001 };

            const newState = updateBusState(currentState, route);
            newStates[bus.id] = newState;

            const startPoint = route[newState.segmentIndex];
            const endPoint = route[newState.segmentIndex + 1];

            if (startPoint && endPoint) {
              const position = getPositionAtProgress(startPoint, endPoint, newState.progress);
              const angle = calculateAngle(startPoint, endPoint);
              newPositions[bus.id] = { lat: position[0], lng: position[1], angle };
            }
          });

          return newStates;
        });

        return newPositions;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, data.buses.length, data.stops.length, movementRoutes]);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live monitor...</p>
        </div>
      </div>
    );
  }

  const center = data.stops.length > 0
    ? [data.stops[0].latitude, data.stops[0].longitude]
    : [0, 0];

  const routeItems = data.routes.map(route => {
    const routeStops = data.stops
      .filter(stop => stop.route_id === route.id)
      .sort((a, b) => a.stop_order - b.stop_order);

    const routeLine = routeStops.map(stop => [stop.latitude, stop.longitude]);
    const bus = data.buses.find(busItem => busItem.route_id === route.id);
    const state = bus ? busStates[bus.id] || { segmentIndex: 0, progress: 0, direction: 'forward', speed: 0.00001 } : null;
    const position = bus ? busPositions[bus.id] : null;

    const nextIndex = state
      ? state.direction === 'forward'
        ? state.segmentIndex + 1
        : state.segmentIndex - 1
      : -1;

    const isAtStop = (() => {
      if (!state || routeStops.length === 0 || nextIndex < 0 || nextIndex >= routeStops.length || !position) return false;
      const nextStop = routeStops[nextIndex];
      const dx = position.lat - nextStop.latitude;
      const dy = position.lng - nextStop.longitude;
      return Math.sqrt(dx * dx + dy * dy) < 0.0005;
    })();

    return {
      routeId: route.id,
      route: routeLine,
      stops: routeStops,
      busPosition: position ? [position.lat, position.lng] : null,
      busAngle: position ? position.angle : 0,
      currentStopIndex: nextIndex,
      visitedStopIndex: state ? state.segmentIndex : -1,
      isAtStop,
      direction: state?.direction || 'forward'
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Live Monitor</h1>
          <p className="text-gray-600 mt-1">Real-time bus tracking</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-lg font-medium text-white transition ${
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isRunning ? '? Pause' : '? Play'}
          </button>
          <button
            onClick={fetchLiveData}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {data.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{data.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow overflow-hidden h-96 lg:h-full" style={{ minHeight: '600px' }}>
            {center[0] !== 0 ? (
              <MapView
                routes={routeItems}
                onRouteReady={(routeId, roadRoute) => {
                  setMovementRoutes(prev => ({
                    ...prev,
                    [routeId]: roadRoute
                  }));
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No stops available to display map</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-800 mb-3">Routes</h3>
            <div className="space-y-2">
              {data.routes.map(route => (
                <div key={route.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colorMap[route.id] || '#2563eb' }}
                  ></div>
                  <span className="text-sm text-gray-700">{route.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 max-h-96 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-3">Buses ({data.buses.length})</h3>
            <div className="space-y-2">
              {data.buses.map(bus => (
                <div key={bus.id} className="p-2 bg-gray-50 rounded text-sm">
                  <p className="font-medium text-gray-800">{bus.bus_number}</p>
                  <p className="text-xs text-gray-600">{bus.route_name || `Route ${bus.route_id}`}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveMonitor;
