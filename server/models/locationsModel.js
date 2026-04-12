const db = require('../config/db');

exports.getBusLocation = (busId, callback) => {
  db.get(
    "SELECT * FROM bus_locations WHERE bus_id = ? ORDER BY updated_at DESC LIMIT 1",
    [busId],
    callback
  );
};