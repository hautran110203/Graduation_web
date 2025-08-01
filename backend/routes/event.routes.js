const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const eventCtrl = require('../controllers/event.controller');
// console.log('📌 Kiểm tra handler:', typeof eventCtrl.getAllEvents); // Phải là "function"

router.get('/', eventCtrl.getAllEvents);
router.get('/locations', eventCtrl.getAllLocations);
router.get('/:unit_code/:event_id', eventCtrl.getEventById);
router.post('/', eventCtrl.createEvent);
router.put('/:id', auth, eventCtrl.updateEvent);
router.delete('/:id', eventCtrl.deleteEvent);

module.exports = router;
