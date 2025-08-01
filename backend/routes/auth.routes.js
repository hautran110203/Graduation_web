const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // 👈 Middleware kiểm tra token

// 📌 Route đăng nhập
router.post('/login', authController.login);

// 🔐 Route bảo vệ – chỉ vào được nếu có token hợp lệ
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: '✅ Bạn đã được xác thực!',
    user: req.user  // thông tin từ token (user_code, role, ...)
  });
});


module.exports = router;
