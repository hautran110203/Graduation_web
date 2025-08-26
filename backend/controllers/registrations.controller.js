const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE = 'registrations';
const REG_TABLE = 'registrations';
const EVENT_TABLE = 'events';
const USER_TABLE = 'users';
const UNIT_TABLE = 'units';


const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BUCKET_NAME = 'graduation-avatar-bucket';
const s3 = new AWS.S3();

// ✅ Cấu hình multer memory
const storage = multer.memoryStorage();
const upload = multer({ storage });


const verifyToken = require('../middlewares/auth.middleware');
exports.uploadAvatar = [
  verifyToken, // ⬅️ Middleware xác thực token JWT
  upload.single('file'),
  async (req, res) => {
    try {
      const file = req.file;
      const user_code = req.user?.user_code; // ⬅️ Lấy user_code từ token đã decode

      if (!file) {
        return res.status(400).json({ success: false, error: 'Thiếu file ảnh' });
      }

      if (!user_code) {
        return res.status(400).json({ success: false, error: 'Thiếu user_code trong token' });
      }

      const ext = path.extname(file.originalname);
      const key = `avatars/${user_code}${ext}`; // 🔑 Đặt tên file theo user_code

      const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      await s3.upload(params).promise();

      const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
      return res.status(200).json({ success: true, imageUrl });
    } catch (err) {
      console.error('❌ Upload thất bại:', err);
      return res.status(500).json({ success: false, error: 'Lỗi khi upload ảnh' });
    }
  }
];
exports.updateAvatar = async (req, res) => {
  const { event_id } = req.params;
  console.log(event_id)
  const { avatar_url, previous_avatar_url,user_code } = req.body;
 
  console.log("👉 PARAMS:", req.params); // event_id
  console.log("👉 BODY:", req.body); // avatar_url, previous_avatar_url

  if (!avatar_url || !event_id || !user_code) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin cần thiết' });
  }

  try {
    // Xoá ảnh cũ trên S3 nếu có và khác ảnh mới
    if (previous_avatar_url && previous_avatar_url !== avatar_url) {
      const key = previous_avatar_url.split('amazonaws.com/')[1];
      if (key) {
        await s3
          .deleteObject({
            Bucket: 'graduation-avatar-bucket',
            Key: key,
          })
          .promise();
        console.log(`✅ Đã xoá ảnh cũ: ${key}`);
      }
    }

    // Cập nhật avatar mới vào DynamoDB
    await docClient
      .update({
        TableName: 'registrations',
        Key: {
          event_id: parseInt(event_id),
          user_code,
        },
        UpdateExpression: 'set avatar_url = :url',
        ExpressionAttributeValues: {
          ':url': avatar_url,
        },
      })
      .promise();

    return res.json({ success: true, message: 'Avatar đã được cập nhật' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật avatar:', err);
    return res.status(500).json({ success: false, error: 'Cập nhật avatar thất bại' });
  }
};

// ================== TẠO ĐĂNG KÝ MỚI ==================
exports.registerForEvent = async (req, res) => {
  const { user_code, event_id, avatar_url } = req.body;

  if (!user_code || !event_id || !avatar_url) {
    return res.status(400).json({ error: 'Thiếu thông tin đăng ký' });
  }

  const params = {
    TableName: TABLE,
    Item: {
      user_code,
      event_id: Number(event_id),
      avatar_url,
      registered_at: new Date().toISOString(),
      status: 'qualified' // hoặc 'approved' tuỳ logic sau
    }
  };

  try {
    await docClient.put(params).promise();
    res.json({ message: 'Đăng ký thành công', data: params.Item });
  } catch (err) {
    console.error('❌ Lỗi registerForEvent:', err);
    res.status(500).json({ error: 'Lỗi đăng ký sự kiện' });
  }
};



// ================== LẤY DANH SÁCH ĐĂNG KÝ + JOIN EVENT ==================



exports.getRegistrations = async (req, res) => {
  try {
    const userCode = req.user?.user_code; // giả sử bạn decode từ JWT middleware
    console.log("📌 userCode từ token:", userCode);
    if (!userCode) {
      return res.status(400).json({ success: false, message: "Thiếu user_code từ token" });
    }

    // 1. Load toàn bộ registrations
    const regData = await docClient.scan({ TableName: REG_TABLE }).promise();
    const allRegistrations = regData.Items || [];

    // 2. Lọc theo user_code
    const registrations = allRegistrations.filter(r => r.user_code === userCode);
    console.log(`✅ Có ${registrations.length} bản ghi của user ${userCode}`);

    // 3. Load toàn bộ events
    const allEventsRes = await docClient.scan({ TableName: EVENT_TABLE }).promise();
    const allEvents = allEventsRes.Items || [];

    // 4. Tạo map event_id -> event
    const eventMap = {};
    for (const ev of allEvents) {
      eventMap[ev.event_id] = ev;
    }

    // 5. Merge thông tin event vào từng bản ghi đăng ký
    const merged = registrations.map(reg => {
      const event = eventMap[reg.event_id] || {};
      return {
        ...reg,
        title: event.title || 'Không có tiêu đề',
        start_time: event.start_time || null,
        end_time: event.end_time || null,
        location: event.location || '',
        unit_code: event.unit_code || '',
      };
    });

    // 6. Sắp xếp theo thời gian đăng ký mới nhất
    merged.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));

    // 7. Trả về kết quả
    return res.json({
      success: true,
      message: 'Lấy danh sách đăng ký thành công.',
      data: merged,
      lastEvaluatedKey: regData.LastEvaluatedKey || null,
    });

  } catch (err) {
    console.error("❌ Lỗi getRegistrations:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách đăng ký",
      error: err.message || err
    });
  }
};


exports.checkRegistrationEligibility = async (req, res) => {
  const user_code = String(req.params.user_code).trim();
  const eventIdNum = Number(req.params.event_id);
  const unit_code = String(req.params.unit_code).trim();

  if (!user_code || isNaN(eventIdNum) || !unit_code) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu hoặc sai định dạng user_code / event_id / unit_code.',
    });
  }

  try {
    // 1. Kiểm tra sinh viên trong bảng graduation_approved
    const params = {
      TableName: 'graduation_approved',
      FilterExpression: 'user_code = :uc',
      ExpressionAttributeValues: {
        ':uc': user_code
      }
    };

    const result = await docClient.scan(params).promise();
    console.log('📦 Kết quả scan:', result.Items);

    if (!result.Items || result.Items.length === 0) {
      return res.status(403).json({
        success: false,
        eligible: false,
        message: 'Người dùng không nằm trong danh sách tốt nghiệp.',
      });
    }

    const approvedStudent = result.Items[0];

    // 2. Lấy thông tin sự kiện từ bảng events (với cả partition key + sort key)
    console.log('🔍 Truy vấn sự kiện với event_id:', eventIdNum, 'và unit_code:', unit_code);

    const eventRes = await docClient.get({
      TableName: 'events',
      Key: {
        event_id: eventIdNum,
        unit_code: unit_code
      }
    }).promise();

    if (!eventRes.Item) {
      console.warn('⚠️ Không tìm thấy sự kiện phù hợp.');
      return res.status(404).json({
        success: false,
        eligible: false,
        reason: 'Không tìm thấy sự kiện.',
      });
    }

    const event = eventRes.Item;
    console.log('✅ Sự kiện tìm thấy:', event);

    // 3. So sánh đơn vị
    if (approvedStudent.unit_code !== event.unit_code) {
      return res.status(403).json({
        success: false,
        eligible: false,
        reason: 'Đơn vị không khớp.',
      });
    }

    let alreadyRegistered = false;
    try {
      const dupQuery = await docClient.query({
        TableName: 'registrations',
        IndexName: 'event_id-user_code-index', // ← đổi đúng tên GSI của bạn
        KeyConditionExpression: 'event_id = :e AND user_code = :u',
        ExpressionAttributeValues: {
          ':e': eventIdNum,
          ':u': user_code
        },
        ProjectionExpression: 'registration_id', // chỉ cần id là đủ
        Limit: 1
      }).promise();

      alreadyRegistered = (dupQuery?.Count ?? 0) > 0;
    } catch (gsiErr) {
      console.warn('⚠️ Không query được GSI, fallback sang scan (không khuyến nghị):', gsiErr?.message);
      // Fallback: nếu chưa có GSI, dùng scan (chỉ nên tạm thời)
      const dupScan = await docClient.scan({
        TableName: 'registrations',
        FilterExpression: 'event_id = :e AND user_code = :u',
        ExpressionAttributeValues: {
          ':e': eventIdNum,
          ':u': user_code
        },
        ProjectionExpression: 'registration_id'
      }).promise();
      alreadyRegistered = (dupScan?.Count ?? dupScan?.Items?.length ?? 0) > 0;
    }

    if (alreadyRegistered) {
      return res.status(409).json({
        success: false,
        eligible: false,
        reason: 'already_registered',
        message: 'Bạn đã đăng ký sự kiện này rồi.',
      });
    }
    // ✅ Đủ điều kiện đăng ký
    return res.status(200).json({
      success: true,
      eligible: true,
      message: 'Đủ điều kiện đăng ký.',
    });

  } catch (err) {
    console.error('❌ Lỗi khi kiểm tra eligibility:', err);
    return res.status(500).json({
      success: false,
      eligible: false,
      message: 'Lỗi hệ thống khi kiểm tra điều kiện.',
    });
  }
};




exports.getAllRegistrationsWithDetails = async (req, res) => {
  try {
    // 1. Lấy toàn bộ registrations
    const regRes = await docClient.scan({ TableName: REG_TABLE }).promise();
    const registrations = regRes.Items || [];

    // 2. Lấy toàn bộ events
    const eventRes = await docClient.scan({ TableName: EVENT_TABLE }).promise();
    const events = eventRes.Items || [];
    const eventMap = {};
    for (const ev of events) {
      eventMap[ev.event_id] = ev;
    }

    // 3. Lấy toàn bộ users
    const userRes = await docClient.scan({ TableName: USER_TABLE }).promise();
    const users = userRes.Items || [];
    const userMap = {};
    for (const u of users) {
      userMap[u.user_code] = u.full_name;
    }

    // 4. Lấy toàn bộ units
    const unitRes = await docClient.scan({ TableName: UNIT_TABLE }).promise();
    const units = unitRes.Items || [];
    const unitMap = {};
    for (const u of units) {
      unitMap[u.unit_code] = u.name;
    }

    // 5. Merge dữ liệu lại
    const merged = registrations.map(reg => {
      const event = eventMap[reg.event_id] || {};
      const unitCode = event.unit_code;
      return {
        ...reg,
        event_name: event.title || `Sự kiện ${reg.event_id}`,
        name: userMap[reg.user_code] || 'Không rõ',
        unit_code: unitCode || '',
        unit_name: unitMap[unitCode] || 'Không rõ',
      };
    });

    // 6. Sắp xếp theo thời gian đăng ký mới nhất
    merged.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));

    // 7. Trả kết quả
    return res.json({
      success: true,
      message: 'Lấy danh sách đăng ký (đầy đủ thông tin) thành công.',
      data: merged,
      lastEvaluatedKey: regRes.LastEvaluatedKey || null,
    });

  } catch (err) {
    console.log('🧾 reg.user_code:', reg.user_code);
    console.log('🔍 user name:', userMap[reg.user_code]);
    console.log('🏛 unit_code:', unitCode);
    console.log('🔍 unit name:', unitMap[unitCode]);

    console.error('❌ Lỗi getAllRegistrationsWithDetails:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách đăng ký đầy đủ.',
      error: err.message || err
    });
  }
};

exports.deleteRegistration = async (req, res) => {
  const { user_code, event_id } = req.params;

  if (!user_code || !event_id) {
    return res.status(400).json({ success: false, message: 'Thiếu user_code hoặc event_id' });
  }

  const params = {
    TableName: 'registrations',
    Key: {
      user_code: user_code,
      event_id: Number(event_id),
    }
  };

  try {
    await docClient.delete(params).promise();
    return res.json({
      success: true,
      message: `Xoá đăng ký thành công cho user ${user_code} và event ${event_id}`
    });
  } catch (err) {
    console.error('❌ Lỗi deleteRegistration:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xoá đăng ký', error: err.message });
  }
};
