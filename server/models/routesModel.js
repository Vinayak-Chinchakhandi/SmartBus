const db = require('../config/db');

exports.getAllRoutes = (callback) => {
  db.all("SELECT * FROM routes", [], callback);
};

// CREATE
exports.createRoute = (name, callback) => {
  db.run(`
    INSERT INTO routes (name)
    VALUES (?)
  `, [name], function(err) {
    callback(err, { id: this.lastID });
  });
};

// UPDATE
exports.updateRoute = (id, name, callback) => {
  db.run(`
    UPDATE routes
    SET name=?
    WHERE id=?
  `, [name, id], function(err) {
    callback(err, { updated: this.changes });
  });
};

// DELETE
exports.deleteRoute = (id, callback) => {
  db.run(`
    DELETE FROM routes WHERE id=?
  `, [id], function(err) {
    callback(err, { deleted: this.changes });
  });
};