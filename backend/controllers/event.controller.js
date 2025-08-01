const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

// ✅ Helper xác định unit_code từ token



// ✅ Tính trạng thái thời gian
function getStatusFromTime(start, end) {
  const now = new Date();
  const startTime = new Date(start);
  const endTime = new Date(end);

  if (now < startTime) return 'upcoming';
  if (now >= startTime && now <= endTime) return 'ongoing';
  return 'finished';
}

const getLocationMap = async () => {
  const locationParams = { TableName: 'locations' };
  const data = await docClient.scan(locationParams).promise();

  // Trả về dạng: { loc001: 'Hội trường A', loc002: 'Phòng B2', ... }
  const map = {};
  data.Items.forEach(loc => {
    map[loc.location_id] = loc.location_name;
  });
  return map;
};
// ================== LẤY DANH SÁCH ==================
// exports.getAllEvents = async (req, res) => {
//   try {
//     const params = { TableName: 'events' };
//     const data = await docClient.scan(params).promise();

//     // Cập nhật status cho từng sự kiện
//     const updatedItems = data.Items.map(event => ({
//       ...event,
//       status: getStatusFromTime(event.start_time, event.end_time),
//     }));

//     res.json(updatedItems);
//   } catch (err) {
//     console.error('❌ Lỗi getAllEvents:', err);
//     res.status(500).json({ error: 'Lỗi lấy danh sách sự kiện' });
//   }
// };
exports.getAllEvents = async (req, res) => {
  try {
    const eventParams = { TableName: 'events' };
    const eventData = await docClient.scan(eventParams).promise();

    const locationMap = await getLocationMap();

    const updatedItems = eventData.Items.map(event => ({
      ...event,
      unit_code: event.unit_code,
      status: getStatusFromTime(event.start_time, event.end_time),
      location_name: locationMap[event.location_id] || 'Không rõ địa điểm'
    }));

    res.json(updatedItems);
  } catch (err) {
    console.error('❌ Lỗi getAllEvents:', err);
    res.status(500).json({ error: 'Lỗi lấy danh sách sự kiện' });
  }
};

// ================== LẤY DANH SÁCH ĐỊA ĐIỂM ==================
exports.getAllLocations = async (req, res) => {
  try {
    const params = {
      TableName: 'events',
      ProjectionExpression: '#loc',
      ExpressionAttributeNames: {
        '#loc': 'location',
      },
    };

    const data = await docClient.scan(params).promise();

    const uniqueLocations = [...new Set(data.Items.map(ev => ev.location).filter(Boolean))];

    res.json(uniqueLocations);
  } catch (err) {
    console.error('❌ Lỗi lấy location:', err);
    res.status(500).json({ error: 'Lỗi lấy địa điểm' });
  }
};

// ================== LẤY THEO ID ==================
exports.getEventById = async (req, res) => {
  try {
    const { unit_code, event_id } = req.params;

    const params = {
      TableName: 'events',
      Key: {
        unit_code,
        event_id: Number(event_id),
      },
    };

    const data = await docClient.get(params).promise();

    if (!data.Item) {
      return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
    }

    res.json(data.Item);
  } catch (err) {
    console.error('❌ Lỗi getEventById:', err);
    res.status(500).json({ error: 'Lỗi truy xuất sự kiện' });
  }
};

// ================== TẠO MỚI ==================



exports.createEvent = async (req, res) => {
  console.log('📥 [createEvent] req.body:', req.body);

  try {
    const {
      title,
      description = '',
      start_time,
      end_time,
      location_id, // 🔑 dùng location_id thay cho location
      slide_template_url = '',
      unit_code,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!title || !start_time || !end_time || !location_id || !unit_code) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Truy vấn tên địa điểm từ bảng 'locations'
    const locationResult = await docClient
      .get({
        TableName: 'locations',
        Key: { location_id: Number(location_id) },
      })
      .promise();

    const locationData = locationResult.Item;

    if (!locationData) {
      return res.status(400).json({ error: 'Không tìm thấy địa điểm' });
    }

    const item = {
      event_id: Date.now(),
      title,
      description,
      start_time,
      end_time,
      location_id: Number(location_id),
      location_name: locationData.location_name, // 👈 để frontend hiển thị
      slide_template_url,
      status: 'draft',
      unit_code,
    };

    console.log('🛠 Item gửi vào DynamoDB:', item);

    await docClient.put({ TableName: 'events', Item: item }).promise();
    res.status(201).json(item);
  } catch (err) {
    console.error('❌ Lỗi createEvent:', err);
    res.status(500).json({ error: 'Lỗi tạo sự kiện' });
  }
};




// ================== CẬP NHẬT ==================

exports.updateEvent = async (req, res) => {
  console.log('[DEBUG] req.user:', req.user);
  console.log('📥 [updateEvent] req.body:', req.body);

  try {
    const { id } = req.params;
    const {
      unit_code,
      title,
      description = '',
      start_time,
      end_time,
      location_id,
      slide_template_url = '',
    } = req.body;

    if (!unit_code || !title || !start_time || !end_time || !location_id) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const role = req.user?.role;
    const userUnitCode = req.user?.unit_code;

    if (role === 'admin_unit' && unit_code !== userUnitCode) {
      return res.status(403).json({ error: 'Bạn không thể chỉnh sửa sự kiện của đơn vị khác' });
    }

    if (role !== 'admin' && role !== 'admin_unit') {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật sự kiện' });
    }

    // 🔍 Truy vấn location_name từ bảng locations
    const locationResult = await docClient
      .get({
        TableName: 'locations',
        Key: { location_id: Number(location_id) },
      })
      .promise();

    const locationData = locationResult.Item;

    if (!locationData) {
      return res.status(400).json({ error: 'Không tìm thấy địa điểm' });
    }

    // 🔧 Cập nhật dữ liệu
    const params = {
      TableName: 'events',
      Key: {
        unit_code,
        event_id: Number(id),
      },
      UpdateExpression: `
        set #title = :t,
            #desc = :d,
            #start = :start,
            #end = :end,
            #loc_id = :loc_id,
            #loc_name = :loc_name,
            #slide = :slide
      `,
      ExpressionAttributeNames: {
        '#title': 'title',
        '#desc': 'description',
        '#start': 'start_time',
        '#end': 'end_time',
        '#loc_id': 'location_id',
        '#loc_name': 'location_name',
        '#slide': 'slide_template_url',
      },
      ExpressionAttributeValues: {
        ':t': title,
        ':d': description,
        ':start': start_time,
        ':end': end_time,
        ':loc_id': Number(location_id),
        ':loc_name': locationData.location_name,
        ':slide': slide_template_url,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const result = await docClient.update(params).promise();
    console.log('✅ [updateEvent] Cập nhật thành công:', result.Attributes);
    res.json(result.Attributes);
  } catch (err) {
    console.error('❌ Lỗi updateEvent:', err);
    res.status(500).json({ error: 'Lỗi cập nhật sự kiện' });
  }
};


// ================== XOÁ ==================
exports.deleteEvent = async (req, res) => {
  try {
    const unitCode = req.query.unit_code;
    const eventId = Number(req.params.id);

    if (!unitCode) {
      return res.status(400).json({ error: 'Thiếu unit_code' });
    }

    const params = {
      TableName: 'events',
      Key: { unit_code: unitCode, event_id: eventId },
    };

    console.log('🗑️ Delete key:', params.Key);
    await docClient.delete(params).promise();

    res.json({ message: '✅ Đã xoá sự kiện' });
  } catch (err) {
    console.error('❌ Lỗi deleteEvent:', err);
    res.status(500).json({ error: 'Lỗi xoá sự kiện' });
  }
};


