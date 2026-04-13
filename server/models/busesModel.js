const db = require('../config/db');

exports.getAllBuses = (callback) => {
  db.all(`
    SELECT 
      buses.id,
      buses.bus_number,
      buses.route_id,
      buses.driver_name,
      buses.driver_phone,
      routes.name as route_name
    FROM buses
    JOIN routes ON buses.route_id = routes.id
  `, [], callback);
};

exports.createBus = (data, callback) => {
  const { bus_number, route_id, driver_name, driver_phone } = data;

  db.run(`
    INSERT INTO buses (bus_number, route_id, driver_name, driver_phone)
    VALUES (?, ?, ?, ?)
  `, [bus_number, route_id, driver_name, driver_phone], function(err) {
    callback(err, { id: this.lastID });
  });
};

exports.deleteBus = (id, callback) => {
  db.run("DELETE FROM buses WHERE id=?", [id], function(err) {
    callback(err, { deleted: this.changes });
  });
};

exports.updateBus = (id, data, callback) => {
  const { bus_number, route_id, driver_name, driver_phone } = data;

  db.run(`
    UPDATE buses
    SET bus_number=?, route_id=?, driver_name=?, driver_phone=?
    WHERE id=?
  `, [bus_number, route_id, driver_name, driver_phone, id], function(err) {
    callback(err, { updated: this.changes });
  });
};