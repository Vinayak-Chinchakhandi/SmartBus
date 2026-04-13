const db = require('../config/db');

exports.getStopsByRoute = (routeId, callback) => {
  db.all(
    "SELECT * FROM stops WHERE route_id = ? ORDER BY stop_order",
    [routeId],
    callback
  );
};

exports.createStop = (data, callback) => {
  const { route_id, name, latitude, longitude, stop_order } = data;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Step 1: move affected stops far away (avoid conflict)
    db.run(`
      UPDATE stops
      SET stop_order = stop_order + 1000
      WHERE route_id = ? AND stop_order >= ?
    `, [route_id, stop_order], function (err) {
      if (err) {
        db.run("ROLLBACK");
        return callback(err);
      }

      // Step 2: bring them back shifted by +1
      db.run(`
        UPDATE stops
        SET stop_order = stop_order - 999
        WHERE route_id = ? AND stop_order >= ?
      `, [route_id, stop_order + 1000], function (err2) {
        if (err2) {
          db.run("ROLLBACK");
          return callback(err2);
        }

        // Step 3: insert new stop
        db.run(`
          INSERT INTO stops (route_id, name, latitude, longitude, stop_order)
          VALUES (?, ?, ?, ?, ?)
        `, [route_id, name, latitude, longitude, stop_order], function (err3) {
          if (err3) {
            db.run("ROLLBACK");
            return callback(err3);
          }

          db.run("COMMIT");
          callback(null, { id: this.lastID });
        });
      });
    });
  });
};

exports.updateStop = (id, data, callback) => {
  const { name, latitude, longitude, stop_order } = data;

  db.get(
    `SELECT route_id, stop_order as old_order FROM stops WHERE id=?`,
    [id],
    (err, row) => {
      if (err || !row) return callback(err);

      const { route_id, old_order } = row;

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // STEP 1: temporarily move current stop out (avoid conflict)
        db.run(`
          UPDATE stops
          SET stop_order = -1
          WHERE id=?
        `, [id]);

        if (stop_order > old_order) {
          // 🔽 moving DOWN → shift up others
          db.run(`
            UPDATE stops
            SET stop_order = stop_order - 1
            WHERE route_id=? AND stop_order > ? AND stop_order <= ?
          `, [route_id, old_order, stop_order]);

        } else if (stop_order < old_order) {
          // 🔼 moving UP → shift down others
          db.run(`
            UPDATE stops
            SET stop_order = stop_order + 1
            WHERE route_id=? AND stop_order >= ? AND stop_order < ?
          `, [route_id, stop_order, old_order]);
        }

        // STEP 2: place stop in correct position
        db.run(`
          UPDATE stops
          SET name=?, latitude=?, longitude=?, stop_order=?
          WHERE id=?
        `, [name, latitude, longitude, stop_order, id], function (err2) {

          if (err2) {
            db.run("ROLLBACK");
            return callback(err2);
          }

          db.run("COMMIT");
          callback(null, { updated: this.changes });
        });
      });
    }
  );
};

exports.deleteStop = (id, callback) => {
  db.get(`SELECT route_id, stop_order FROM stops WHERE id=?`, [id], (err, row) => {
    if (err || !row) return callback(err);

    const { route_id, stop_order } = row;

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // delete stop
      db.run(`DELETE FROM stops WHERE id=?`, [id]);

      // shift remaining
      db.run(`
        UPDATE stops
        SET stop_order = stop_order - 1
        WHERE route_id=? AND stop_order > ?
      `, [route_id, stop_order], function (err2) {

        if (err2) {
          db.run("ROLLBACK");
          return callback(err2);
        }

        db.run("COMMIT");
        callback(null, { deleted: this.changes });
      });
    });
  });
};