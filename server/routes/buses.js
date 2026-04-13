const express = require('express');
const router = express.Router();
const busesController = require('../controllers/busesController');

router.get('/', busesController.getBuses);
router.post('/', busesController.createBus);
router.delete('/:id', busesController.deleteBus);
router.put('/:id', busesController.updateBus);

module.exports = router;