// delayPredictor.js
// Predict bus delays based on schedule vs actual progress

import { haversineDistance } from '../eta/etaEngine';

function calculateTotalDistance(route) {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += haversineDistance(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1]);
  }
  return total;
}

export function predictDelay(startTime, currentTime, currentPosition, route, expectedSpeed) {
  const totalDistance = calculateTotalDistance(route);
  const totalExpectedTime = (totalDistance / expectedSpeed) * 3600; // seconds

  // Calculate current progress distance
  let currentDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const segmentDistance = haversineDistance(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1]);
    currentDistance += segmentDistance;

    // Check if current position is near this segment end
    const distToNext = haversineDistance(currentPosition[0], currentPosition[1], route[i + 1][0], route[i + 1][1]);
    if (distToNext < 0.01) { // close to next point
      break;
    }
  }

  const progress = Math.min(currentDistance / totalDistance, 1);
  const expectedTimeSoFar = progress * totalExpectedTime;
  const actualTime = (currentTime - startTime) / 1000;
  const delaySeconds = actualTime - expectedTimeSoFar;

  if (delaySeconds > 60) { // more than 1 minute delay
    return { status: 'delayed', minutes: Math.round(delaySeconds / 60) };
  } else {
    return { status: 'on-time' };
  }
}