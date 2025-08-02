const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE = 'units';
// Hàm test: chỉ trả về { code, name }
exports.getTestUnits = async (req, res) => {
  try {
    const params = { TableName: TABLE };
    const data = await docClient.scan(params).promise();

    const formatted = data.Items.map((item) => ({
      code: item.unit_code,
      name: item.name,
    }));

    console.log('🧪 [DEBUG] Test units:', formatted);
    res.json(formatted);
  } catch (err) {
    console.error('❌ Lỗi trong getTestUnits:', err);
    res.status(500).json({ error: 'Lỗi khi lấy đơn vị test' });
  }
};

// Lấy tất cả đơn vị
exports.getAllUnits = async (req, res) => {
  try {
    const params = { TableName: TABLE };
    const data = await docClient.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    console.error('Lỗi getAllUnits:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách đơn vị' });
  }
};

// Lấy đơn vị theo unit_code
exports.getUnitByCode = async (req, res) => {
  try {
    const params = {
      TableName: TABLE,
      Key: { unit_code: req.params.unit_code }
    };
    const data = await docClient.get(params).promise();
    if (!data.Item) return res.status(404).json({ error: 'Không tìm thấy đơn vị' });
    res.json(data.Item);
  } catch (err) {
    console.error('Lỗi getUnitByCode:', err);
    res.status(500).json({ error: 'Lỗi truy vấn đơn vị' });
  }
};

// Tạo mới đơn vị
exports.createUnit = async (req, res) => {
  const { unit_code, name, description } = req.body;
  if (!unit_code || !name) {
    return res.status(400).json({ error: 'Thiếu mã đơn vị hoặc tên đơn vị' });
  }

  const params = {
    TableName: TABLE,
    Item: {
      unit_code,
      name,
      description: description || '',
      created_at: new Date().toISOString()
    }
  };

  try {
    await docClient.put(params).promise();
    res.status(201).json({ message: 'Tạo đơn vị thành công', unit_code });
  } catch (err) {
    console.error('Lỗi createUnit:', err);
    res.status(500).json({ error: 'Lỗi tạo đơn vị' });
  }
};

// Cập nhật đơn vị
exports.updateUnit = async (req, res) => {
  const { unit_code } = req.params;
  const { name, description } = req.body;

  const params = {
    TableName: TABLE,
    Key: { unit_code },
    UpdateExpression: 'set #n = :n, description = :d',
    ExpressionAttributeNames: { '#n': 'name' },
    ExpressionAttributeValues: {
      ':n': name,
      ':d': description || ''
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const data = await docClient.update(params).promise();
    res.json({ message: 'Cập nhật thành công', updated: data.Attributes });
  } catch (err) {
    console.error('Lỗi updateUnit:', err);
    res.status(500).json({ error: 'Lỗi cập nhật đơn vị' });
  }
};

// Xoá đơn vị
exports.deleteUnit = async (req, res) => {
  const { unit_code } = req.params;
  const params = {
    TableName: TABLE,
    Key: { unit_code }
  };

  try {
    await docClient.delete(params).promise();
    res.json({ message: 'Đã xoá đơn vị' });
  } catch (err) {
    console.error('Lỗi deleteUnit:', err);
    res.status(500).json({ error: 'Lỗi xoá đơn vị' });
  }
};
