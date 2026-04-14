const db = require('../config/db');

exports.createReroute = (routeId, reroutePath, callback) => {
  // First, set all previous reroutes for this route to inactive
  db.run(`
    UPDATE reroutes
    SET is_active = 0
    WHERE route_id = ?
  `, [routeId], (err) => {
    if (err) return callback(err);

    // Then insert the new active reroute
    db.run(`
      INSERT INTO reroutes (route_id, reroute_path, is_active)
      VALUES (?, ?, 1)
    `, [routeId, JSON.stringify(reroutePath)], function(err) {
      callback(err, { id: this.lastID });
    });
  });
};

exports.getActiveReroute = (routeId, callback) => {
  db.get(`
    SELECT * FROM reroutes
    WHERE route_id = ? AND is_active = 1
    ORDER BY created_at DESC
    LIMIT 1
  `, [routeId], (err, row) => {
    if (err) return callback(err);
    if (row) {
      row.reroute_path = JSON.parse(row.reroute_path);
    }
    callback(null, row);
  });
};

exports.resetReroute = (routeId, callback) => {
  db.run(`
    UPDATE reroutes
    SET is_active = 0
    WHERE route_id = ?
  `, [routeId], function(err) {
    callback(err, { updated: this.changes });
  });
};

exports.getAllReroutes = (callback) => {
  db.all("SELECT * FROM reroutes ORDER BY created_at DESC", [], callback);
};