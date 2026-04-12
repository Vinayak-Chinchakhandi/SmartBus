const db = require('../config/db');

exports.getStopsByRoute = (routeId, callback) => {
  db.all(
    "SELECT * FROM stops WHERE route_id = ? ORDER BY stop_order",
    [routeId],
    callback
  );
};