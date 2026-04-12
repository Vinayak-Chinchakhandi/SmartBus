const db = require('../config/db');

exports.getAllBuses = (callback) => {
  db.all("SELECT * FROM buses", [], callback);
};