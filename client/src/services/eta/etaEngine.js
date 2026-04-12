// etaEngine.js

export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function calculateETA(currentPosition, route, speedKmh) {
    // ✅ SAFETY CHECK
    if (!currentPosition || !route || route.length < 2 || speedKmh <= 0) {
        return 0;
    }

    let nextIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < route.length; i++) {
        if (!route[i]) continue;

        const point = route[i];

        if (!point || point.length < 2) continue;

        const dist = haversineDistance(
            currentPosition[0],
            currentPosition[1],
            point[0],
            point[1]
        );

        if (dist < minDistance) {
            minDistance = dist;
            nextIndex = i;
        }
    }

    // If at end
    if (nextIndex >= route.length - 1) {
        return 0;
    }

    let totalDistance = 0;

    for (let i = nextIndex; i < route.length - 1; i++) {
        if (!route[i] || !route[i + 1]) continue;

        totalDistance += haversineDistance(
            route[i][0],
            route[i][1],
            route[i + 1][0],
            route[i + 1][1]
        );
    }

    const timeHours = totalDistance / speedKmh;
    const timeSeconds = timeHours * 3600;

    return Math.round(timeSeconds);
}

export function formatETA(seconds) {
    if (!seconds || seconds < 0) {
        return { minutes: 0, seconds: 0 };
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return { minutes, seconds: remainingSeconds };
}