// interpolation.js
// Function to interpolate between two coordinates and return intermediate points

export function interpolate(start, end, steps = 10) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const lat = start[0] + (end[0] - start[0]) * (i / steps);
    const lng = start[1] + (end[1] - start[1]) * (i / steps);
    points.push([lat, lng]);
  }
  return points;
}