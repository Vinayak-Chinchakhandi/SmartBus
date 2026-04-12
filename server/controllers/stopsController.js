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