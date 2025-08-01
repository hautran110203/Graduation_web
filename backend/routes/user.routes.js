const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// ========== Dành cho quản trị viên (CRUD theo user_code) ==========

// Tạo người dùng
router.post('/create', userController.createUser);

// Lấy danh sách người dùng
router.get('/getUsers', userController.getAllUsers);

// Lấy chi tiết người dùng theo mã
router.get('/get/:user_code', userController.getUser);

// Cập nhật người dùng
router.put('/update/:user_code', userController.updateUser);

// Xoá người dùng
router.delete('/delete/:user_code', userController.deleteUser);

// Cập nhật avatar cho user cụ thể (admin gán ảnh)
router.put('/updateAvatar/:user_code', userController.updateAvatar);


// ========== Dành cho người dùng đang đăng nhập ==========

// Lấy thông tin người dùng từ token
router.get('/me', authMiddleware, userController.getCurrentUser);

// Cập nhật ảnh đại diện cá nhân
router.put('/me/avatar', authMiddleware, userController.updateAvatar);

module.exports = router;