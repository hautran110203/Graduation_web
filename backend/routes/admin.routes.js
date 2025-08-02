const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const requireAdminSystem  = require('../middlewares/requireAdminSystem');

router.get('/',  adminController.getAllAdmins);
router.post('/', adminController.createOrUpdateAdmin);
router.delete('/:user_code/:unit_code', adminController.deleteAdmin);

module.exports = router;
