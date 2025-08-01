const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const requireAdminSystem  = require('../middlewares/requireAdminSystem');

router.get('/', requireAdminSystem, adminController.getAllAdmins);
router.post('/', requireAdminSystem, adminController.createOrUpdateAdmin);
router.delete('/:user_code/:unit_code', requireAdminSystem, adminController.deleteAdmin);

module.exports = router;
