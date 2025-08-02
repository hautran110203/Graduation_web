const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.post('/', locationController.createLocation);
router.delete('/:id', locationController.deleteLocation);
router.put('/:id', locationController.updateLocation);

router.post('/seatmap', locationController.uploadSeatMap);
router.delete('/:id/seatmap', locationController.deleteSeatMap);

module.exports = router;
