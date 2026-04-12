const express = require('express');
const router = express.Router();
const stopsController = require('../controllers/stopsController');

router.get('/:routeId', stopsController.getStops);

module.exports = router;