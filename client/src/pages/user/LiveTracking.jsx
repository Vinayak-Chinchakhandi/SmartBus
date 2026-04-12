import React, { useState, useEffect, useMemo, useRef } from 'react';
import MapView from '../../components/map/MapView';
import ETAWidget from '../../components/widgets/ETAWidget';
import NotificationToast from '../../components/notifications/NotificationToast';
import { updateBusState, getPositionAtProgress, calculateAngle } from '../../services/simulation/movementEngine';
import { predictDelay } from '../../services/prediction/delayPredictor';
import { checkForNotifications } from '../../services/notification/notificationEngine';
import { getRoutes } from '../../api/routes';
import { getStops } from '../../api/stops';

function LiveTracking() {
    useEffect(() => {
        const isFirstLoad = sessionStorage.getItem("appStarted");

        if (!isFirstLoad) {
            localStorage.removeItem("movementState_1");
            sessionStorage.setItem("appStarted", "true");
        }
    }, []);

    useEffect(() => {
        const APP_VERSION = "v1"; // 🔥 change this when server restarts

        const storedVersion = localStorage.getItem("app_version");

        if (storedVersion !== APP_VERSION) {
            // 🔥 CLEAR ALL OLD DATA
            localStorage.clear();

            localStorage.setItem("app_version", APP_VERSION);

            console.log("🔥 Server restarted → storage cleared");
        }
    }, []);

    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [stops, setStops] = useState([]);
    const [movementRoute, setMovementRoute] = useState([]);

    const defaultMovementState = {
        segmentIndex: 0,
        progress: 0,
        direction: 'forward',
        speed: 0.001,
    };

    const [movementState, setMovementState] = useState(defaultMovementState);
    const [busPosition, setBusPosition] = useState(null);
    const [visitedStopIndex, setVisitedStopIndex] = useState(-1);
    const [lastDirection, setLastDirection] = useState('forward');

    const prevIsAtStopRef = useRef(false);

    // 🔥 NEW: STOP PAUSE STATE
    const [isPaused, setIsPaused] = useState(false);

    const [startTime] = useState(Date.now());
    const [notifications, setNotifications] = useState([]);

    // Helper: Find closest stop
    const getClosestStopIndex = (position, stopsArray) => {
        if (!position || stopsArray.length === 0) return 0;
        let closestIdx = 0;
        let minDist = Infinity;
        stopsArray.forEach((stop, idx) => {
            const dist = Math.abs(position[0] - stop.latitude) + Math.abs(position[1] - stop.longitude);
            if (dist < minDist) {
                minDist = dist;
                closestIdx = idx;
            }
        });
        return closestIdx;
    };

    const { closestStopIndex, distanceToStop } = useMemo(() => {
        if (!busPosition?.position || stops.length === 0) {
            return { closestStopIndex: 0, distanceToStop: Infinity };
        }

        const idx = getClosestStopIndex(busPosition.position, stops);
        const stop = stops[idx];

        // 🔥 REPLACE DISTANCE CALCULATION HERE
        const dx = busPosition.position[0] - stop.latitude;
        const dy = busPosition.position[1] - stop.longitude;
        const dist = Math.sqrt(dx * dx + dy * dy);

        return { closestStopIndex: idx, distanceToStop: dist };
    }, [busPosition?.position, stops]);

    const [lockedStopIndex, setLockedStopIndex] = useState(null);

    // 🔥 FIX: isAtStop added
    // const isAtStop = useMemo(() => {
    //     if (lockedStopIndex !== null) return false;

    //     const isForward = movementState.direction === 'forward';

    //     const expectedIndex = isForward
    //         ? visitedStopIndex + 1
    //         : visitedStopIndex - 1;

    //     return (
    //         distanceToStop < 0.003 &&   // 🔥 increased
    //         closestStopIndex === expectedIndex
    //     );
    // }, [distanceToStop, closestStopIndex, visitedStopIndex, lockedStopIndex, movementState.direction]);
    const isAtStop = useMemo(() => {
        if (lockedStopIndex !== null) return false;

        // 🔥 prevent stopping at same stop again
        if (closestStopIndex === visitedStopIndex) return false;

        return distanceToStop < 0.0025;
    }, [distanceToStop, closestStopIndex, visitedStopIndex, lockedStopIndex]);


    // Stable stop index (no flicker)
    const prevStableStopRef = useRef(0);

    const stableStopIndex = useMemo(() => {
        if (distanceToStop < 0.003) {
            return closestStopIndex;
        }
        return prevStableStopRef.current ?? 0;
    }, [distanceToStop, closestStopIndex]);

    useEffect(() => {
        prevStableStopRef.current = stableStopIndex;
    }, [stableStopIndex]);

    // 🔥 STOP PAUSE LOGIC
    useEffect(() => {
        if (!isAtStop) return;

        setIsPaused(true);
        setLockedStopIndex(closestStopIndex);

        const timeout = setTimeout(() => {
            setIsPaused(false);
            setVisitedStopIndex(closestStopIndex);
            setLockedStopIndex(null); // 🔥 ADD THIS
        }, 3000);

        return () => clearTimeout(timeout);

    }, [isAtStop, closestStopIndex]);

    useEffect(() => {
        if (lockedStopIndex !== null && closestStopIndex !== lockedStopIndex)
            setLockedStopIndex(null);
    }, [closestStopIndex, lockedStopIndex]);

    // Fetch routes and initialize default route if none is selected yet
    useEffect(() => {
        const storedRouteId = localStorage.getItem('selectedRouteId');

        if (storedRouteId) {
            setSelectedRouteId(Number(storedRouteId));
        } else {
            // fallback (optional)
            const fetchRoutes = async () => {
                try {
                    const data = await getRoutes();
                    if (data.length > 0) {
                        setSelectedRouteId(data[0].id);
                    }
                } catch (error) {
                    console.error(error);
                }
            };

            fetchRoutes();
        }
    }, []);

    // Fetch stops for the selected route
    useEffect(() => {
        if (!selectedRouteId) return;

        const fetchStops = async () => {
            try {
                const data = await getStops(selectedRouteId);
                setStops(data);
                setVisitedStopIndex(-1);
            } catch (error) {
                console.error(error);
            }
        };

        fetchStops();
    }, [selectedRouteId]);

    // Load route-specific movement state from localStorage
    useEffect(() => {
        if (!selectedRouteId) return;

        const storageKey = `movementState_${selectedRouteId}`;
        const saved = localStorage.getItem(storageKey);

        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                setMovementState(parsed.movementState ?? defaultMovementState);
                setVisitedStopIndex(typeof parsed.visitedStopIndex === 'number' ? parsed.visitedStopIndex : -1);
                setLastDirection(parsed.lastDirection ?? defaultMovementState.direction);

            } catch (error) {
                console.error('Failed to parse saved movement state:', error);
                setMovementState(defaultMovementState);
                setVisitedStopIndex(-1);
                setLastDirection(defaultMovementState.direction);
            }
        } else {
            setMovementState(defaultMovementState);
            setVisitedStopIndex(-1);
            setLastDirection(defaultMovementState.direction);
        }

    }, [selectedRouteId]);

    // Persist route-specific movement state and stop progress
    useEffect(() => {
        if (!selectedRouteId) return;

        const storageKey = `movementState_${selectedRouteId}`;
        localStorage.setItem(storageKey, JSON.stringify({
            movementState,
            visitedStopIndex,
            lastDirection,
        }));
    }, [selectedRouteId, movementState, visitedStopIndex, lastDirection]);

    // Reset stop progression when direction changes
    useEffect(() => {
        if (movementState.direction !== lastDirection) {

            if (movementState.direction === 'forward') {
                setVisitedStopIndex(-1);
            } else {
                setVisitedStopIndex(stops.length); // 🔥 FIX
            }

            prevStableStopRef.current = 0;
            setLastDirection(movementState.direction);
        }
    }, [movementState.direction]);

    const routeCoordinates = useMemo(() => {
        return stops.map(stop => [stop.latitude, stop.longitude]);
    }, [stops]);

    // useEffect(() => {
    //     if (!movementRoute || movementRoute.length < 2) return;

    //     // 🔥 DO NOT OVERRIDE RESTORED STATE
    //     if (busPosition !== null) return;
    //     if (movementState.progress !== 0) return;

    //     const start = movementRoute[0];
    //     const next = movementRoute[1];

    //     const pos = getPositionAtProgress(start, next, 0.01);
    //     const angle = calculateAngle(start, next);

    //     setBusPosition({ position: pos, angle });

    // }, [movementRoute, busPosition, movementState]);

    useEffect(() => {
        if (!movementRoute || movementRoute.length < 2) return;
        if (busPosition !== null) return;

        const start = movementRoute[0];
        const next = movementRoute[1];

        const pos = getPositionAtProgress(start, next, 0.01);
        const angle = calculateAngle(start, next);

        setBusPosition({ position: pos, angle });

    }, [movementRoute]);

    // 🚍 MOVEMENT LOOP
    useEffect(() => {
        if (!movementRoute || movementRoute.length < 2) return;

        const timer = setInterval(() => {

            // 🔥 PAUSE CONTROL
            if (isPaused) return;

            setMovementState(prev => {
                const newState = updateBusState(prev, movementRoute);

                const segStart = movementRoute[newState.segmentIndex];
                const segEnd = movementRoute[Math.min(newState.segmentIndex + 1, movementRoute.length - 1)];

                const pos = getPositionAtProgress(segStart, segEnd, newState.progress);
                const angle = calculateAngle(segStart, segEnd);

                // ✅ move outside
                requestAnimationFrame(() => {
                    setBusPosition(prev => {
                        if (
                            !prev ||
                            prev.position[0] !== pos[0] ||
                            prev.position[1] !== pos[1] ||
                            prev.angle !== angle
                        ) {
                            return { position: pos, angle };
                        }
                        return prev;
                    });
                });

                return newState;
            });

        }, 20);

        return () => clearInterval(timer);

    }, [movementRoute, isPaused]);

    // Notifications
    useEffect(() => {
        const interval = setInterval(() => {
            if (!busPosition?.position || movementRoute.length === 0) return;

            const delayStatus = predictDelay(
                startTime,
                Date.now(),
                busPosition.position,
                movementRoute,
                30
            );

            const newNotifications = checkForNotifications(
                busPosition.position,
                movementRoute,
                delayStatus
            );

            if (newNotifications.length > 0) {
                const notificationsWithId = newNotifications.map((notif, index) => ({
                    ...notif,
                    id: Date.now() + index,
                }));

                setNotifications(notificationsWithId);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="flex h-full relative">

            <div className="flex-1">
                <MapView
                    busPosition={busPosition?.position}
                    busAngle={busPosition?.angle}
                    route={routeCoordinates}
                    stops={stops}
                    routeId={selectedRouteId}
                    currentStopIndex={stableStopIndex}
                    visitedStopIndex={visitedStopIndex}
                    isAtStop={isAtStop}
                    onRouteReady={setMovementRoute}
                    direction={movementState.direction}
                />
            </div>

            <div className="w-80 p-4 bg-gray-50">
                <ETAWidget
                    currentPosition={busPosition?.position}
                    route={movementRoute.length > 0 ? movementRoute : routeCoordinates}
                    speed={30}
                    startTime={startTime}
                />
            </div>

            <div className="fixed top-4 right-4 z-[1000] space-y-2">
                {notifications.map((notif) => (
                    <NotificationToast
                        key={notif.id}
                        notification={notif}
                        onRemove={removeNotification}
                    />
                ))}
            </div>
        </div>
    );

}

export default LiveTracking;