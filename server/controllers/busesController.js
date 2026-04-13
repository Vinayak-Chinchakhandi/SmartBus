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

exports.createBus = (req, res) => {
  busesModel.createBus(req.body, (err, result) => {
    if (err) {
      console.error('Error creating bus:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to create bus'
      });
    }

    res.status(201).json(result);
  });
};

exports.deleteBus = (req, res) => {
  busesModel.deleteBus(req.params.id, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.updateBus = (req, res) => {
  const { id } = req.params;

  busesModel.updateBus(id, req.body, (err, result) => {
    if (err) {
      console.error('Error updating bus:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to update bus'
      });
    }

    res.status(200).json(result);
  });
};