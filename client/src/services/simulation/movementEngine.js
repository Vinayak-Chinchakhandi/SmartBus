/**
 * Pure state update function for bus movement
 * @param {Object} state - Current movement state
 * @param {number} state.segmentIndex - Current segment index
 * @param {number} state.progress - Progress along current segment (0-1)
 * @param {string} state.direction - 'forward' or 'reverse'
 * @param {number} state.speed - Movement speed (distance units per second)
 * @param {Array} route - Array of [lat, lng] coordinates
 * @returns {Object} Updated state
 */
export function updateBusState(state, route) {
  if (!route || route.length < 2) return state;

  const { segmentIndex, progress, direction, speed } = state;

  // Calculate progress increment (20ms per call in interval)
  const timeStep = 0.02; // seconds
  const segmentDistance = calculateSegmentDistance(
    route[segmentIndex],
    route[segmentIndex + 1]
  );
  const progressIncrement = (speed * timeStep) / segmentDistance;

  let newProgress = progress + progressIncrement;
  let newSegmentIndex = segmentIndex;
  let newDirection = direction;

  // Handle segment completion
  if (newProgress >= 1) {
    newProgress = 0;

    if (direction === 'forward') {
      newSegmentIndex++;
      // At the end: reverse direction
      if (newSegmentIndex >= route.length - 1) {
        newSegmentIndex = route.length - 2;
        newDirection = 'reverse';
      }
    } else {
      // Reverse
      newSegmentIndex--;
      // At the start: forward direction
      if (newSegmentIndex <= 0) {
        newSegmentIndex = 0;
        newDirection = 'forward';
      }
    }
  }

  return {
    segmentIndex: newSegmentIndex,
    progress: newProgress,
    direction: newDirection,
    speed,
  };
}

/**
 * Calculate distance between two coordinates (in degrees, approximate)
 */
function calculateSegmentDistance(point1, point2) {
  const latDiff = point2[0] - point1[0];
  const lngDiff = point2[1] - point1[1];
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

/**
 * Interpolate position along a segment
 */
export function getPositionAtProgress(startPoint, endPoint, progress) {
  const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * progress;
  const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * progress;
  return [lat, lng];
}

/**
 * Calculate angle between two points (degrees)
 */
export function calculateAngle(startPoint, endPoint) {
  const latDiff = endPoint[0] - startPoint[0];
  const lngDiff = endPoint[1] - startPoint[1];
  return Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
}