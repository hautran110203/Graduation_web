const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE = 'users';

exports.login = async (req, res) => {
  const { user_code, password } = req.body;

  if (!user_code || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
  }

  const params = {
    TableName: TABLE,
    Key: { user_code }
  };

  try {
    const data = await docClient.get(params).promise();
    const user = data.Item;

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Sai mật khẩu' });
    }

    // ✅ Gói token gồm unit_code nếu có (dùng cho phân quyền theo khoa)
    const tokenPayload = {
      user_code: user.user_code,
      role: user.role,
      unit_code: user.unit_code || null
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'supersecret123',
      { expiresIn: '2h' }
    );

    // ✅ Trả về thông tin an toàn, không bao gồm password
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        user_code: user.user_code,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        unit_code: user.unit_code || null,
        avatar_url: user.avatar_url || null
      }
    });

  } catch (err) {
    console.error('❌ Lỗi login:', err);
    res.status(500).json({ error: 'Lỗi đăng nhập hệ thống' });
  }
};

