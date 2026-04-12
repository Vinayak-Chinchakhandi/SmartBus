const busesModel = require('../models/busesModel');

exports.getBuses = (req, res) => {
  busesModel.getAllBuses((err, rows) => {
    if (err) {
      console.error('Error fetching buses:', err);
      return res.status(500).json({ 
        error: 'Database Error',
        message: 'Failed to fetch buses'
      });
    }
    
    // ✅ Return empty array if no buses
    res.status(200).json(rows || []);
  });
};