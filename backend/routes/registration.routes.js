const express = require('express');
const router = express.Router();
const registrationCtrl = require('../controllers/registrations.controller');
const auth = require('../middlewares/auth.middleware');

// Gửi đăng ký
router.post('/', registrationCtrl.registerForEvent);

// (Tuỳ chọn) Lấy danh sách đăng ký
router.get('/', auth,registrationCtrl.getRegistrations);

router.get('/check-registration/:user_code/:event_id/:unit_code', registrationCtrl.checkRegistrationEligibility);
router.get('/getAll',registrationCtrl.getAllRegistrationsWithDetails)
module.exports = router;
