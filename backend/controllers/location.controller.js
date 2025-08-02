const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'locations';

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();
const BUCKET_NAME = 'graduation-avatar-bucket';

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadSeatMap = [
  upload.single('file'),
  async (req, res) => {
    try {
      const file = req.file;
      const location_id = parseInt(req.body.location_id); // ✅ Lấy ID từ formData

      if (!file || !location_id) {
        return res.status(400).json({ error: 'Thiếu file hoặc location_id' });
      }

      const ext = path.extname(file.originalname);
      const key = `map/${uuidv4()}${ext}`;

      // 📤 Upload ảnh lên S3
      const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      await s3.upload(params).promise();
      const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

      // 📝 Cập nhật vào DynamoDB
      await docClient.update({
        TableName: TABLE_NAME,
        Key: { location_id },
        UpdateExpression: 'set location_map = :url',
        ExpressionAttributeValues: {
          ':url': fileUrl,
        },
        ReturnValues: 'UPDATED_NEW',
      }).promise();

      // ✅ Chỉ gọi res.json 1 lần
      res.json({ url: fileUrl });

    } catch (err) {
      console.error('Lỗi upload:', err);
      res.status(500).json({ error: 'Upload thất bại' });
    }
  },
];

exports.deleteSeatMap = async (req, res) => {
  const location_id = req.body.location_id; // bỏ parseInt vì đã là số
  const s3Key = req.body.key;

  console.log('[DEBUG] DELETE seatmap payload:', { location_id, s3Key });

  if (!location_id || !s3Key) {
    return res.status(400).json({ error: 'Thiếu thông tin' });
  }

  try {
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    }).promise();

    const result = await docClient.update({
      TableName: TABLE_NAME,
      Key: { location_id: location_id },
      UpdateExpression: 'REMOVE location_map',
    }).promise();

    console.log('[DEBUG] DynamoDB update result:', result);
    res.json({ message: 'Xoá thành công' });
  } catch (err) {
    console.error('Lỗi xoá sơ đồ:', err);
    res.status(500).json({ error: 'Không thể xoá sơ đồ' });
  }
};



// Cập nhật địa điểm
exports.updateLocation = async (req, res) => {
  const location_id = parseInt(req.params.id);
  if (isNaN(location_id)) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  const { location_name, location_address, location_map } = req.body;

  // Không có gì để update
  if (
    location_name === undefined &&
    location_address === undefined &&
    location_map === undefined
  ) {
    return res.status(400).json({ error: 'Không có thông tin cần cập nhật' });
  }

  // Build update expressions
  let UpdateExpression = 'SET';
  const ExpressionAttributeValues = {};
  const ExpressionAttributeNames = {};
  const updates = [];

  if (location_name !== undefined) {
    updates.push('#name = :name');
    ExpressionAttributeValues[':name'] = location_name;
    ExpressionAttributeNames['#name'] = 'location_name';
  }

  if (location_address !== undefined) {
    updates.push('#address = :address');
    ExpressionAttributeValues[':address'] = location_address;
    ExpressionAttributeNames['#address'] = 'location_address';
  }

  if (location_map !== undefined) {
    updates.push('#map = :map');
    ExpressionAttributeValues[':map'] = location_map;
    ExpressionAttributeNames['#map'] = 'location_map';
  }

  UpdateExpression += ' ' + updates.join(', ');

  const params = {
    TableName: TABLE_NAME,
    Key: { location_id },
    UpdateExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames,
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const result = await docClient.update(params).promise();
    res.json({ message: 'Cập nhật thành công', updated: result.Attributes });
  } catch (err) {
    console.error('Lỗi cập nhật:', err);
    res.status(500).json({ error: 'Không thể cập nhật địa điểm' });
  }
};


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
  console.log('[DEBUG] req.params.id =', req.params.id);
  const rawId = req.params.id;
  const location_id = parseInt(rawId, 10);
  console.log('[DEBUG] location_id =', location_id);
  if (isNaN(location_id)) {
    console.error('[ERROR] Invalid location_id:', rawId);
    return res.status(400).json({ error: 'location_id không hợp lệ' });
  }

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
