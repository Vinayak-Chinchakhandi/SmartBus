let lastNotifiedIndex = -1;

export function checkForNotifications(currentPosition, route, delayStatus) {
  const notifications = [];

  // Find closest stop index
  let closestIndex = 0;
  let minDist = Infinity;

  for (let i = 0; i < route.length; i++) {
    const dist = Math.abs(currentPosition[0] - route[i][0]) +
                 Math.abs(currentPosition[1] - route[i][1]);

    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  }

  // 🔥 If reached last stop → no notifications
  if (closestIndex >= route.length - 1) {
    return [];
  }

  // 🔥 Only notify once per stop
  if (closestIndex !== lastNotifiedIndex) {
    lastNotifiedIndex = closestIndex;

    notifications.push({
      type: 'arriving',
      message: `Approaching Stop ${closestIndex + 1}`
    });
  }

  // Delay notification (only once)
  if (delayStatus.status === 'delayed' && closestIndex !== lastNotifiedIndex) {
    notifications.push({
      type: 'delay',
      message: `Bus delayed by ${delayStatus.minutes} minutes`
    });
  }

  return notifications;
}