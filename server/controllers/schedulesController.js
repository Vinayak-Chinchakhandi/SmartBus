const schedulesModel = require('../models/schedulesModel');

// GET
exports.getSchedules = (req, res) => {
  schedulesModel.getAllSchedules((err, rows) => {
    if (err) {
      console.error('Error fetching schedules:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to fetch schedules'
      });
    }

    res.status(200).json(rows || []);
  });
};

// POST
exports.createSchedule = (req, res) => {
  const data = req.body;

  schedulesModel.createSchedule(data, (err, result) => {
    if (err) {
      console.error('Error creating schedule:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to create schedule'
      });
    }

    res.status(201).json(result);
  });
};

// PUT
exports.updateSchedule = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  schedulesModel.updateSchedule(id, data, (err, result) => {
    if (err) {
      console.error('Error updating schedule:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to update schedule'
      });
    }

    res.status(200).json(result);
  });
};

exports.deleteSchedule = (req, res) => {
  const { id } = req.params;

  schedulesModel.deleteSchedule(id, (err, result) => {
    if (err) {
      console.error('Error deleting schedule:', err);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to delete schedule'
      });
    }

    res.status(200).json(result);
  });
};