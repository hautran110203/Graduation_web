const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'locations';

// Lấy tất cả địa điểm
exports.getAllLocations = async (req, res) => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await docClient.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách địa điểm' });
  }
};

// Thêm địa điểm
exports.createLocation = async (req, res) => {
  const { location_id, location_name, location_address, location_map } = req.body;

  if (!location_id || !location_name || !location_address) {
    return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
  }

  const params = {
    TableName: TABLE_NAME,
    Item: {
      location_id,
      location_name,
      location_address,
      location_map: location_map || null,
    },
  };

  try {
    await docClient.put(params).promise();
    res.status(201).json({ message: 'Thêm địa điểm thành công' });
  } catch (err) {
    console.error('Lỗi thêm địa điểm:', err);
    res.status(500).json({ error: 'Không thể thêm địa điểm' });
  }
};

// Xoá địa điểm
exports.deleteLocation = async (req, res) => {
  const location_id = parseInt(req.params.id);

  const params = {
    TableName: TABLE_NAME,
    Key: { location_id },
  };

  try {
    await docClient.delete(params).promise();
    res.json({ message: 'Xoá thành công' });
  } catch (err) {
    console.error('Lỗi xoá địa điểm:', err);
    res.status(500).json({ error: 'Xoá thất bại' });
  }
};

// (Tùy chọn) Lấy 1 địa điểm theo ID
exports.getLocationById = async (req, res) => {
  const location_id = parseInt(req.params.id);

  const params = {
    TableName: TABLE_NAME,
    Key: { location_id },
  };

  try {
    const data = await docClient.get(params).promise();
    if (!data.Item) {
      return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
    }
    res.json(data.Item);
  } catch (err) {
    console.error('Lỗi khi lấy địa điểm:', err);
    res.status(500).json({ error: 'Không thể lấy thông tin địa điểm' });
  }
};
