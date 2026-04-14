const rerouteModel = require('../models/rerouteModel');

exports.createReroute = (req, res) => {
  const { route_id, reroute_path } = req.body;

  if (!route_id || !reroute_path) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'route_id and reroute_path are required'
    });
  }

  rerouteModel.createReroute(route_id, reroute_path, (err, result) => {
    if (err) {
      console.error('Error creating reroute:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to create reroute'
      });
    }

    res.status(201).json(result);
  });
};

exports.getActiveReroute = (req, res) => {
  const { routeId } = req.params;

  rerouteModel.getActiveReroute(routeId, (err, reroute) => {
    if (err) {
      console.error('Error fetching active reroute:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch active reroute'
      });
    }

    res.status(200).json(reroute || null);
  });
};

exports.resetReroute = (req, res) => {
  const { routeId } = req.params;

  rerouteModel.resetReroute(routeId, (err, result) => {
    if (err) {
      console.error('Error resetting reroute:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to reset reroute'
      });
    }

    res.status(200).json(result);
  });
};

exports.getAllReroutes = (req, res) => {
  rerouteModel.getAllReroutes((err, rows) => {
    if (err) {
      console.error('Error fetching reroutes:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch reroutes'
      });
    }

    res.status(200).json(rows || []);
  });
};