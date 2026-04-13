const db = require('../config/db');

// GET all schedules
exports.getAllSchedules = (callback) => {
  db.all(`
    SELECT 
      schedules.id,
      schedules.route_id,
      routes.name AS route_name,
      schedules.day_of_week,
      schedules.trip_type,
      schedules.pickup_time,
      schedules.drop_time
    FROM schedules
    JOIN routes ON schedules.route_id = routes.id
    ORDER BY route_id, day_of_week
  `, [], callback);
};

// CREATE schedule
exports.createSchedule = (data, callback) => {
  const { route_id, day_of_week, trip_type, pickup_time, drop_time } = data;

  db.run(`
    INSERT INTO schedules (route_id, day_of_week, trip_type, pickup_time, drop_time)
    VALUES (?, ?, ?, ?, ?)
  `, [route_id, day_of_week, trip_type, pickup_time, drop_time], function (err) {
    callback(err, { id: this.lastID });
  });
};

// UPDATE schedule
exports.updateSchedule = (id, data, callback) => {
  const { route_id, day_of_week, trip_type, pickup_time, drop_time } = data;

  db.run(`
    UPDATE schedules
    SET route_id=?, day_of_week=?, trip_type=?, pickup_time=?, drop_time=?
    WHERE id=?
  `, [route_id, day_of_week, trip_type, pickup_time, drop_time, id], function (err) {
    callback(err, { updated: this.changes });
  });
};

exports.deleteSchedule = (id, callback) => {
  db.run(`
    DELETE FROM schedules WHERE id=?
  `, [id], function (err) {
    callback(err, { deleted: this.changes });
  });
};