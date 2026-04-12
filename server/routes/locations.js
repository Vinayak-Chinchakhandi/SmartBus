const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locationsController');

router.get('/:busId', locationsController.getLocation);

module.exports = router;