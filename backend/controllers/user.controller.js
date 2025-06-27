const dynamoDb = require('../utils/dynamodb');
const TABLE = 'users';

exports.createUser = (req, res) => {
  const { user_code, full_name, email, avatar_url } = req.body;

  // Validate input
  if (!user_code || !full_name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const params = {
    TableName: TABLE,
    Item: {
      user_code,
      full_name,
      email,
      avatar_url,
      created_at: new Date().toISOString()
    }
  };

  dynamoDb.put(params, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User created successfully', user_code });
  });
};

//Lấy tất cả người dùng
exports.getAllUsers = (req, res) => {
  let lastKey;
  try {
    lastKey = req.query.lastKey ? JSON.parse(req.query.lastKey) : undefined;
  } catch (e) {
    return res.status(400).json({ error: 'lastKey không hợp lệ' });
  }

  const params = {
    TableName: TABLE,
    Limit: 20,
    ExclusiveStartKey: lastKey
  };

  dynamoDb.scan(params, (err, data) => {
    if (err) {
      console.error('Lỗi khi đọc dữ liệu:', err);
      return res.status(500).json({ error: 'Lỗi khi truy vấn người dùng' });
    }

    res.json({
      users: data.Items,
      nextKey: data.LastEvaluatedKey
        ? JSON.stringify(data.LastEvaluatedKey)
        : null
    });
  });
};


exports.getUser = (req,res) => {
  const { user_code } = req.params;
  const params = {
    TableName: TABLE,
    Key: {
      user_code: user_code
    }
  };
  dynamoDb.get(params, (err, data) => {
    if (err) {
      console.error('❌ Lỗi khi đọc dữ liệu:', err);
      return res.status(500).json({ error: 'Lỗi khi truy vấn người dùng' });
    }
    if(!data.Item){
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    res.json(data.Item);
  });
}