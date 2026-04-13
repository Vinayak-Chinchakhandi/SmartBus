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

// CREATE
exports.createRoute = (req, res) => {
  const { name } = req.body;

  routesModel.createRoute(name, (err, result) => {
    if (err) {
      console.error('Error creating route:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to create route'
      });
    }

    res.status(201).json(result);
  });
};

// UPDATE
exports.updateRoute = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  routesModel.updateRoute(id, name, (err, result) => {
    if (err) {
      console.error('Error updating route:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to update route'
      });
    }

    res.status(200).json(result);
  });
};

// DELETE
exports.deleteRoute = (req, res) => {
  const { id } = req.params;

  routesModel.deleteRoute(id, (err, result) => {
    if (err) {
      console.error('Error deleting route:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to delete route'
      });
    }

    res.status(200).json(result);
  });
};