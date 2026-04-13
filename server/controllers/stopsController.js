const stopsModel = require('../models/stopsModel');

exports.getStops = (req, res) => {
  const { routeId } = req.params;

  // ✅ Validate input
  if (!routeId || isNaN(routeId)) {
    return res.status(400).json({ 
      error: 'Bad Request',
      message: 'Route ID must be a valid number'
    });
  }

  stopsModel.getStopsByRoute(routeId, (err, rows) => {
    if (err) {
      console.error('Error fetching stops:', err);
      return res.status(500).json({ 
        error: 'Database Error',
        message: 'Failed to fetch stops'
      });
    }

    // ✅ Return 404 if no stops found
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No stops found for this route'
      });
    }

    res.status(200).json(rows);
  });
};

// CREATE
exports.createStop = (req, res) => {
  stopsModel.createStop(req.body, (err, result) => {
    if (err) {
      console.error('🔥 FULL ERROR:', err);   // 👈 ADD THIS

      return res.status(500).json({
        error: 'Database Error',
        message: err.message || 'Failed to create stop'  // 👈 SHOW REAL ERROR
      });
    }

    res.status(201).json(result);
  });
};

// UPDATE
exports.updateStop = (req, res) => {
  const { id } = req.params;

  stopsModel.updateStop(id, req.body, (err, result) => {
    if (err) {
      console.error('Error updating stop:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to update stop'
      });
    }

    res.status(200).json(result);
  });
};

// DELETE
exports.deleteStop = (req, res) => {
  const { id } = req.params;

  stopsModel.deleteStop(id, (err, result) => {
    if (err) {
      console.error('Error deleting stop:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to delete stop'
      });
    }

    res.status(200).json(result);
  });
};