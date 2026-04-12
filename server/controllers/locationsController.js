const locationsModel = require('../models/locationsModel');

exports.getLocation = (req, res) => {
  const { busId } = req.params;

  // ✅ Validate input
  if (!busId || isNaN(busId)) {
    return res.status(400).json({ 
      error: 'Bad Request',
      message: 'Bus ID must be a valid number'
    });
  }

  locationsModel.getBusLocation(busId, (err, row) => {
    if (err) {
      console.error('Error fetching location:', err);
      return res.status(500).json({ 
        error: 'Database Error',
        message: 'Failed to fetch location'
      });
    }

    // ✅ Return 404 if location not found
    if (!row) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No location data available for this bus'
      });
    }

    res.status(200).json(row);
  });
};