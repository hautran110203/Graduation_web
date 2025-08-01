const express = require('express');
const router = express.Router();
const { getAdminOverview } = require('../../controllers/adminUnit/admin.unit.controller');

router.get('/overview', getAdminOverview);

module.exports = router;
