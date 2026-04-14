import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';

function MapView({
  routes,
  route,
  stops,
  busPosition,
  busAngle,
  routeId,
  onRouteReady,
  currentStopIndex,
  visitedStopIndex,
  isAtStop,
  direction
}) {
  const [roadRoutes, setRoadRoutes] = useState({});

  const routeColorMap = {
    1: '#2563eb',
    2: '#dc2626',
    3: '#16a34a',
    4: '#f59e0b'
  };

  const routeItems = Array.isArray(routes)
    ? routes
    : [
        {
          routeId,
          route,
          stops,
          busPosition,
          busAngle,
          currentStopIndex,
          visitedStopIndex,
          isAtStop,
          direction
        }
      ];

  const routeKeys = routeItems
    .map((item) => `${item.routeId}:${item.route?.length ?? 0}`)
    .join('|');

  useEffect(() => {
    if (!routeItems || routeItems.length === 0) {
      setRoadRoutes({});
      return;
    }

    let isMounted = true;

    routeItems.forEach((routeItem) => {
      if (!routeItem.route || routeItem.route.length < 2) return;

      const fetchRoadRoute = async () => {
        const coordinates = routeItem.route
          .map(([lat, lng]) => `${lng},${lat}`)
          .join(';');

        const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

        try {
          const response = await fetch(url);
          const data = await response.json();

          const osrmCoords = data?.routes?.[0]?.geometry?.coordinates;

          if (isMounted && osrmCoords && osrmCoords.length > 0) {
            const transformed = osrmCoords.map(([lng, lat]) => [lat, lng]);
            const routeKey = String(routeItem.routeId);

            setRoadRoutes((prev) => ({
              ...prev,
              [routeKey]: transformed
            }));

            onRouteReady && onRouteReady(routeKey, transformed);
          } else if (isMounted) {
            const routeKey = String(routeItem.routeId);

            setRoadRoutes((prev) => ({
              ...prev,
              [routeKey]: routeItem.route
            }));

            onRouteReady && onRouteReady(routeKey, routeItem.route);
          }
        } catch (error) {
          console.error('? OSRM route error:', error);
          if (isMounted) {
            setRoadRoutes((prev) => ({
              ...prev,
              [routeItem.routeId]: routeItem.route
            }));
            onRouteReady && onRouteReady(routeItem.routeId, routeItem.route);
          }
        }
      };

      fetchRoadRoute();
    });

    return () => {
      isMounted = false;
    };
  }, [routeKeys]);

  const allBusPositions = routeItems
    .map((item) => item.busPosition)
    .filter(Boolean);

  const center =
    allBusPositions.length > 0
      ? allBusPositions[0]
      : routeItems[0]?.route?.[0] || [0, 0];

  const busIcon = (angle) =>
    L.divIcon({
      html: `<img src="/bus.png" style="
        width:100%;
        height:100%;
        object-fit: contain;
        transform: rotate(${angle - 90}deg);
        transition: transform 0.2s linear;
      " />`,
      className: '',
      iconSize: [50, 110],
      iconAnchor: [25, 55]
    });

  const collegeIcon = L.divIcon({
    html: '🏫',
    className: 'custom-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 12]
  });

  return (
    <>
      <style>
        {`
          .custom-marker {
  background: none;
  border: none;
}

/* ?? CURRENT STOP (BLINK ONLY WHEN BUS IS THERE) */
.current-stop {
  width: 22px;
  height: 22px;
  background: #2563eb;
  border-radius: 50%;
  box-shadow: 0 0 12px #2563eb;
  animation: blink 1s infinite;
}

/* ?? NEXT STOP */
.next-stop {
  width: 18px;
  height: 18px;
  background: #facc15;
  border-radius: 50%;
}

/* ? VISITED */
.past-stop {
  width: 16px;
  height: 16px;
  background: #6b7280;
  border-radius: 50%;
}

/* ?? FUTURE */
.future-stop {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
}

/* ?? BLINK EFFECT */
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

        {routeItems.map((routeItem) => {
          const {
            routeId,
            route: itemRoute,
            stops: itemStops,
            busPosition: itemBusPosition,
            busAngle: itemBusAngle,
            currentStopIndex: itemCurrentStopIndex,
            visitedStopIndex: itemVisitedStopIndex,
            isAtStop: itemIsAtStop
          } = routeItem;

          if (!itemRoute || itemRoute.length === 0) {
            return null;
          }

          const routeColor = routeColorMap[routeId] || '#2563eb';
          const routeKey = String(routeId);
          const displayRoute = roadRoutes[routeKey]?.length > 0 ? roadRoutes[routeKey] : itemRoute;

          const lastStop =
            itemStops && itemStops.length > 0
              ? itemStops.reduce((max, stop) =>
                  stop.stop_order > max.stop_order ? stop : max,
                  itemStops[0]
                )
              : null;

          return (
            <React.Fragment key={routeId || itemRoute[0]?.toString() || Math.random()}>
              <Polyline positions={displayRoute} color={routeColor} />

              {itemStops &&
                itemStops.map((stop, index) => {
                  let icon;

                  const isVisited = index <= itemVisitedStopIndex;
                  const isCurrent = index === itemCurrentStopIndex;
                  const isNext = index === itemVisitedStopIndex + 1;

                  if (stop.id === lastStop?.id) {
                    icon = collegeIcon;
                  } else if (isCurrent && itemIsAtStop) {
                    icon = L.divIcon({
                      html: `<div class="current-stop"></div>`,
                      className: '',
                      iconSize: [22, 22],
                      iconAnchor: [11, 11]
                    });
                  } else if (isNext) {
                    icon = L.divIcon({
                      html: `<div class="next-stop"></div>`,
                      className: '',
                      iconSize: [18, 18],
                      iconAnchor: [9, 9]
                    });
                  } else if (isVisited) {
                    icon = L.divIcon({
                      html: `<div class="past-stop"></div>`,
                      className: '',
                      iconSize: [16, 16],
                      iconAnchor: [8, 8]
                    });
                  } else {
                    icon = L.divIcon({
                      html: `<div class="future-stop"></div>`,
                      className: '',
                      iconSize: [16, 16],
                      iconAnchor: [8, 8]
                    });
                  }

                  return <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={icon} />;
                })}

              {itemBusPosition && (
                <Marker position={itemBusPosition} icon={busIcon(itemBusAngle || 0)} />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </>
  );
}

export default MapView;
