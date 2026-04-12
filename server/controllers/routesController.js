const routesModel = require('../models/routesModel');

exports.getRoutes = (req, res) => {
  routesModel.getAllRoutes((err, rows) => {
    if (err) {
      console.error('Error fetching routes:', err);
      return res.status(500).json({ 
        error: 'Database Error',
        message: 'Failed to fetch routes'
      });
    }
    
    // ✅ Return empty array if no routes
    res.status(200).json(rows || []);
  });
};