const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ✅ S3 cấu hình (dùng chung với DynamoDB nếu đã config từ trước)
const s3 = new AWS.S3();
const BUCKET_NAME = 'graduation-avatar-bucket'; // 👉 sửa lại theo tên bucket thật của bạn

// ✅ Multer config để nhận file từ request (form-data)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('avatar'); // field name là 'avatar'

// ✅ Hàm upload file lên S3
exports.uploadAvatar = (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ error: 'Lỗi upload file' });
    if (!req.file) return res.status(400).json({ error: 'Không có file được gửi lên' });

    const file = req.file;
    const extension = path.extname(file.originalname);
    const filename = `avatars/${uuidv4()}${extension}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    try {
      const result = await s3.upload(params).promise();
      res.json({
        message: 'Upload thành công',
        avatar_url: result.Location
      });
    } catch (uploadError) {
      console.error('❌ Upload S3 thất bại:', uploadError);
      res.status(500).json({ error: 'Lỗi khi upload lên S3' });
    }
  });
};
