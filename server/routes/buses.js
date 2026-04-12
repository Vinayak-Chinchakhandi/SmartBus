const express = require('express');
const router = express.Router();
const busesController = require('../controllers/busesController');

router.get('/', busesController.getBuses);

module.exports = router;