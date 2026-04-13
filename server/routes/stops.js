const express = require('express');
const router = express.Router();
const stopsController = require('../controllers/stopsController');

router.get('/:routeId', stopsController.getStops);
router.post('/', stopsController.createStop);
router.put('/:id', stopsController.updateStop);
router.delete('/:id', stopsController.deleteStop);

module.exports = router;