const express = require('express');
const router = express.Router();
const eventCtrl = require('../controllers/event.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB
// console.log('📌 Kiểm tra handler:', typeof eventCtrl.getAllEvents); // Phải là "function"

router.get('/', eventCtrl.getAllEvents);
router.get('/locations', eventCtrl.getAllLocations);
router.get('/:unit_code/:event_id', eventCtrl.getEventById);
router.post('/', upload.single('slide'), eventCtrl.createEvent);
router.put('/:id',upload.single('slide'), eventCtrl.updateEvent);
router.delete('/:id', eventCtrl.deleteEvent);
router.get('/:id/delete-check', eventCtrl.checkCanDeleteEvent);
module.exports = router;
