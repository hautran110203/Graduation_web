module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin_system') {
    return res.status(403).json({ error: 'Chỉ admin hệ thống mới được phép truy cập' });
  }
  next();
};
