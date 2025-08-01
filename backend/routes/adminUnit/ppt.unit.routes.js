const express = require('express');
const router = express.Router();
const pptController = require("../../controllers/adminUnit/ppt.controller");

router.get('/events', pptController.getEventsWithRegistrations);
router.get('/:event_id/users', pptController.getRegistrationsByEvent);

module.exports = router;
