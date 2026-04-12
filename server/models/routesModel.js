const db = require('../config/db');

exports.getAllRoutes = (callback) => {
  db.all("SELECT * FROM routes", [], callback);
};