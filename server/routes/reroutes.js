const express = require('express');
const router = express.Router();
const rerouteController = require('../controllers/rerouteController');

router.post('/', rerouteController.createReroute);
router.get('/:routeId', rerouteController.getActiveReroute);
router.delete('/:routeId', rerouteController.resetReroute);
router.get('/', rerouteController.getAllReroutes);

module.exports = router;