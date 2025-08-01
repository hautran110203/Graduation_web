const express = require('express');
const router = express.Router();
const registrationController = require('../../controllers/adminUnit/registrationController');

// Lấy danh sách tất cả đăng ký
router.get('/registrations', registrationController.getRegistrations);

// Phê duyệt hoặc từ chối đăng ký dựa vào điều kiện đơn vị
router.post('/registrations/:user_code/:event_id/approve', registrationController.approveRegistration);


module.exports = router;
