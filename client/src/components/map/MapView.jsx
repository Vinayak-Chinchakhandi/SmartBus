import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';

function MapView({ route, stops, busPosition, busAngle, routeId, onRouteReady, currentStopIndex, visitedStopIndex, isAtStop, direction }) {
  const [roadRoute, setRoadRoute] = useState([]);

  const routeColorMap = {
    1: '#2563eb',
    2: '#dc2626',
    3: '#16a34a',
    4: '#f59e0b'
  };

  const routeColor = routeColorMap[routeId] || '#2563eb';

  useEffect(() => {
    if (!route || route.length < 2) {
      setRoadRoute([]);
      return;
    }

    let isMounted = true;

    const fetchRoadRoute = async () => {
      const coordinates = route
        .map(([lat, lng]) => `${lng},${lat}`)
        .join(';');

      const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        const osrmCoords = data?.routes?.[0]?.geometry?.coordinates;

        if (isMounted && osrmCoords && osrmCoords.length > 0) {
          const transformed = osrmCoords.map(([lng, lat]) => [lat, lng]);

          console.log("✅ Road route loaded:", transformed.length);

          setRoadRoute(transformed);
          onRouteReady && onRouteReady(transformed);
        } else if (isMounted) {
          setRoadRoute(route);
          onRouteReady && onRouteReady(route);
        }
      } catch (error) {
        console.error('❌ OSRM route error:', error);
        if (isMounted) {
          setRoadRoute(route);
          onRouteReady && onRouteReady(route);
        }
      }
    };

    fetchRoadRoute();

    return () => {
      isMounted = false;
    };
  }, [route, routeId]);

  if (!busPosition || !route || route.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading Map...
      </div>
    );
  }

  const center = busPosition || route[0] || [0, 0];

  const angle = busAngle || 0;

  const busIcon = L.divIcon({
    html: `<img src="/bus.png" style="
    width:100%;
    height:100%;
    object-fit: contain;
    transform: rotate(${angle - 90}deg);
    transition: transform 0.2s linear;
  " />`,
    className: '',
    iconSize: [50, 110],
    iconAnchor: [25, 55],
  });

  const collegeIcon = L.divIcon({
    html: '🏫',
    className: 'custom-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });

  const lastStop =
    stops && stops.length > 0
      ? stops.reduce((max, stop) =>
        stop.stop_order > max.stop_order ? stop : max,
        stops[0])
      : null;

  return (
    <>
      <style>
        {`
          .custom-marker {
  background: none;
  border: none;
}

/* 🔥 CURRENT STOP (BLINK ONLY WHEN BUS IS THERE) */
.current-stop {
  width: 22px;
  height: 22px;
  background: #2563eb;
  border-radius: 50%;
  box-shadow: 0 0 12px #2563eb;
  animation: blink 1s infinite;
}

/* 🟡 NEXT STOP */
.next-stop {
  width: 18px;
  height: 18px;
  background: #facc15;
  border-radius: 50%;
}

/* ⚫ VISITED */
.past-stop {
  width: 16px;
  height: 16px;
  background: #6b7280;
  border-radius: 50%;
}

/* 🔵 FUTURE */
.future-stop {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
}

/* 🔥 BLINK EFFECT */
@keyframes blink {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
  100% { opacity: 1; transform: scale(1); }
}
        `}
      </style>

      <MapContainer center={center} zoom={13} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* ✅ Use roadRoute if available */}
        <Polyline
          positions={roadRoute.length > 0 ? roadRoute : route}
          color={routeColor}
        />

        {stops &&
          stops.map((stop, index) => {
            let icon;

            const isVisited = index <= visitedStopIndex;
            const isCurrent = index === currentStopIndex;
            const isNext = index === visitedStopIndex + 1;

            // 🏫 FINAL STOP
            if (stop.id === lastStop?.id) {
              icon = collegeIcon;
            }

            // 🔥 CURRENT STOP (BLINK WHEN BUS IS THERE)
            else if (isCurrent && isAtStop) {
              icon = L.divIcon({
                html: `<div class="current-stop"></div>`,
                className: '',
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              });
            }

            // 🟡 NEXT STOP
            else if (isNext) {
              icon = L.divIcon({
                html: `<div class="next-stop"></div>`,
                className: '',
                iconSize: [18, 18],
                iconAnchor: [9, 9],
              });
            }

            // ⚫ VISITED
            else if (isVisited) {
              icon = L.divIcon({
                html: `<div class="past-stop"></div>`,
                className: '',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
            }

            // 🔵 FUTURE
            else {
              icon = L.divIcon({
                html: `<div class="future-stop"></div>`,
                className: '',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
            }

            return (
              <Marker
                key={stop.id}
                position={[stop.latitude, stop.longitude]}
                icon={icon}
              />
            );
          })}

        <Marker position={busPosition} icon={busIcon} />
      </MapContainer>
    </>
  );
}

export default MapView;