const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE = 'admins';

// 📥 Lấy toàn bộ quyền của tất cả users (⚠️ chỉ dùng để debug nhỏ, nên dùng query với PK nếu cần)
exports.getAllAdmins = async (req, res) => {
  try {
    const result = await docClient.scan({ TableName: TABLE }).promise();
    res.json(result.Items);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách admin:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách quyền' });
  }
};

// ➕ Tạo hoặc cập nhật quyền của 1 user cho 1 unit
exports.createOrUpdateAdmin = async (req, res) => {
  const { user_code, unit_code, permissions } = req.body;

  if (!user_code || !unit_code || !permissions) {
    return res.status(400).json({ error: 'Thiếu user_code, unit_code hoặc permissions' });
  }

  const item = {
    user_code,     // Partition Key
    unit_code,     // Sort Key
    permissions,   // Array of strings
  };

  const params = {
    TableName: TABLE,
    Item: item,
  };

  try {
    await docClient.put(params).promise();
    res.json({ message: 'Đã cấp/cập nhật quyền thành công', item });
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật quyền:', err);
    res.status(500).json({ error: 'Không thể cập nhật quyền' });
  }
};

// 🗑️ Xoá quyền của 1 user trong 1 đơn vị cụ thể
exports.deleteAdmin = async (req, res) => {
  const { user_code, unit_code } = req.params;

  if (!user_code || !unit_code) {
    return res.status(400).json({ error: 'Thiếu user_code hoặc unit_code để xoá' });
  }

  const params = {
    TableName: TABLE,
    Key: {
      user_code,   // Partition Key
      unit_code,   // Sort Key
    },
  };

  try {
    await docClient.delete(params).promise();
    res.json({ message: `Đã xoá quyền của ${user_code} tại đơn vị ${unit_code}` });
  } catch (err) {
    console.error('❌ Lỗi khi xoá quyền:', err);
    res.status(500).json({ error: 'Không thể xoá quyền người dùng' });
  }
};
