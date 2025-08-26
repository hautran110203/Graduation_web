// controllers/user.controller.js

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE = 'users';
const USERS_TABLE = 'users';
const APPROVE_TABLE = 'graduation_approved'
// =================== AUTH ===================

// Đăng nhập
exports.login = async (req, res) => {
  const { user_code, password } = req.body;

  if (!user_code || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    const data = await docClient.get({ TableName: TABLE, Key: { user_code } }).promise();
    const user = data.Item;

    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Sai mật khẩu' });

    const token = jwt.sign(
      { user_code: user.user_code, role: user.role },
      process.env.JWT_SECRET || 'supersecret123',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        user_code: user.user_code,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (err) {
    console.error('Lỗi login:', err);
    res.status(500).json({ error: 'Lỗi đăng nhập' });
  }
};

// Lấy thông tin từ token
exports.getCurrentUser = async (req, res) => {
  const { user_code } = req.user;

  try {
    const data = await docClient.get({ TableName: TABLE, Key: { user_code } }).promise();
    if (!data.Item) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

    const { password, ...userInfo } = data.Item;
    res.json(userInfo);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi truy vấn người dùng' });
  }
};

// =================== USERS CRUD ===================

// Tạo người dùng
exports.createUser =  async (req, res) => {
  const { user_code, graduation_id, password, avatar_url } = req.body;

  if (!user_code || !graduation_id || !password) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  try {
    // 1. Kiểm tra người dùng đã tồn tại chưa
    const existing = await docClient.get({
      TableName: USERS_TABLE,
      Key: { user_code }
    }).promise();

    if (existing.Item) {
      return res.status(409).json({ error: 'Tài khoản đã tồn tại' });
    }

    // 2. Kiểm tra user_code + graduation_id có trong bảng APPROVE không
    const approveCheck = await docClient.get({
      TableName: APPROVE_TABLE,
      Key: {
        user_code,
        graduation_id: Number(graduation_id)
      }
    }).promise();

    const approveItem = approveCheck.Item;
    if (!approveItem) {
      return res.status(403).json({ error: 'Không tìm thấy thông tin xét duyệt tương ứng' });
    }

    // 3. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Tạo user mới từ thông tin trong bảng approve
    const newUser = {
      user_code,
      password: hashedPassword,
      avatar_url: avatar_url || null,
      email: approveItem.email || '',
      full_name: approveItem.full_name || '',
      unit_code: approveItem.unit_code || '',
      role: 'student',
      created_at: new Date().toISOString(),
    };

    await docClient.put({
      TableName: USERS_TABLE,
      Item: newUser,
    }).promise();

    res.json({ message: 'Tạo tài khoản thành công', user_code });
  } catch (err) {
    console.error('Lỗi tạo user:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Lấy tất cả người dùng
exports.getAllUsers = (req, res) => {
  let lastKey;
  try {
    lastKey = req.query.lastKey ? JSON.parse(req.query.lastKey) : undefined;
  } catch (e) {
    return res.status(400).json({ error: 'Tham số lastKey không hợp lệ' });
  }

  const params = {
    TableName: TABLE,
  };

  docClient.scan(params, (err, data) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi truy vấn người dùng' });

    res.json({
      users: data.Items,
      nextKey: data.LastEvaluatedKey ? JSON.stringify(data.LastEvaluatedKey) : null
    });
  });
};

// Lấy một người dùng
exports.getUser = (req, res) => {
  const { user_code } = req.params;
  const params = { TableName: TABLE, Key: { user_code } };

  docClient.get(params, (err, data) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy thông tin người dùng' });
    if (!data.Item) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

    res.json(data.Item);
  });
};


exports.updateUser = (req, res) => {
  const { user_code } = req.params;
  const { full_name, email, avatar_url, role, unit_code } = req.body;

  console.log('[📥] Yêu cầu cập nhật người dùng:', req.body);

  if (!user_code) {
    return res.status(400).json({ error: 'Thiếu user_code' });
  }

  const allowedFields = {
    full_name: full_name,
    email: email,
    avatar_url: avatar_url,
    role: role,
    unit_code: unit_code
  };

  const updateExpr = [];
  const exprAttrValues = {};
  const exprAttrNames = {};

  Object.entries(allowedFields).forEach(([key, value]) => {
    if (value !== undefined) {
      const attrName = `#${key}`;
      const attrValue = `:${key}`;
      updateExpr.push(`${attrName} = ${attrValue}`);
      exprAttrNames[attrName] = key;
      exprAttrValues[attrValue] = value;
    }
  });

  if (updateExpr.length === 0) {
    return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
  }

  const params = {
    TableName: TABLE,
    Key: { user_code },
    UpdateExpression: 'set ' + updateExpr.join(', '),
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: 'ALL_NEW'
  };

  docClient.update(params, (err, data) => {
    if (err) {
      console.error('[❌] Lỗi khi cập nhật:', err);
      return res.status(500).json({ error: 'Cập nhật thất bại', details: err });
    }
    console.log('[✅] Cập nhật thành công:', data.Attributes);
    res.json({ message: 'Cập nhật thành công', updated: data.Attributes });
  });
};

// Cập nhật avatar riêng
exports.updateAvatar = (req, res) => {
  const { user_code } = req.params;
  const { avatar_url } = req.body;

  if (!avatar_url) return res.status(400).json({ error: 'Thiếu avatar_url' });

  const params = {
    TableName: TABLE,
    Key: { user_code },
    UpdateExpression: 'set avatar_url = :a',
    ExpressionAttributeValues: {
      ':a': avatar_url
    },
    ReturnValues: 'ALL_NEW'
  };

  docClient.update(params, (err, data) => {
    if (err) return res.status(500).json({ error: 'Lỗi cập nhật avatar' });
    res.json({ message: 'Cập nhật avatar thành công', updated: data.Attributes });
  });
};

// Xoá người dùng
exports.deleteUser = (req, res) => {
  const { user_code } = req.params;
  const params = { TableName: TABLE, Key: { user_code } };

  docClient.delete(params, err => {
    if (err) return res.status(500).json({ error: 'Xoá người dùng thất bại' });
    res.json({ message: 'Xoá người dùng thành công' });
  });
};
