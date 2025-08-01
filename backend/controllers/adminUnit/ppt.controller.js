const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const REG_TABLE = 'registrations';
const EVENT_TABLE = 'events';
const USER_TABLE = 'users'
const APPROVE_TABLE = 'graduation_approved';

exports.getEventsWithRegistrations = async (req, res) => {
  try {
    // 1. Lấy tất cả bản ghi từ bảng registrations
    const regRes = await docClient.scan({ TableName: REG_TABLE }).promise();
    const registrations = regRes.Items || [];

    // 2. Lấy danh sách event_id duy nhất
    const uniqueEventIds = [...new Set(registrations.map((r) => r.event_id))];

    if (uniqueEventIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 3. Scan toàn bộ events rồi filter theo event_id
    const allEventsRes = await docClient.scan({ TableName: EVENT_TABLE }).promise();
    const allEvents = allEventsRes.Items || [];

    const matchedEvents = allEvents.filter(e => uniqueEventIds.includes(e.event_id));

    // 4. Trả về danh sách
    return res.json({
      success: true,
      data: matchedEvents.map(e => ({
        event_id: e.event_id,
        title: e.title,
        unit_code: e.unit_code,
        start_time: e.start_time,
        end_time: e.end_time,
        slide_template_url: e.slide_template_url || ''
      }))
    });

  } catch (err) {
    console.error('❌ Lỗi getEventsWithRegistrations:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sự kiện có người đăng ký',
      error: err.message || err
    });
  }
};

// exports.getRegistrationsByEvent = async (req, res) => {
//   const eventIdNum = Number(req.params.event_id);
//   if (isNaN(eventIdNum)) {
//     return res.status(400).json({ success: false, message: 'event_id không hợp lệ' });
//   }

//   try {
//     // 1. Lấy tất cả đăng ký có event_id
//     const regRes = await docClient.scan({
//       TableName: REG_TABLE,
//       FilterExpression: 'event_id = :eid',
//       ExpressionAttributeValues: {
//         ':eid': eventIdNum,
//       },
//     }).promise();

//     const registrations = regRes.Items || [];
//     if (registrations.length === 0) {
//       return res.json({ success: true, data: [] });
//     }

//     // 2. Lấy danh sách user_code duy nhất
//     const userCodes = [...new Set(registrations.map((r) => r.user_code))];

//     // 3. Lấy thông tin người dùng tương ứng
//     const userData = [];
//     for (const code of userCodes) {
//       const userRes = await docClient.get({
//         TableName: USER_TABLE,
//         Key: { user_code: code },
//       }).promise();
//       if (userRes.Item) {
//         userData.push(userRes.Item);
//       }
//     }

//     // 4. Gộp lại: chỉ lấy thông tin cần thiết cho slide
//     const result = registrations.map((reg) => {
//       const user = userData.find((u) => u.user_code === reg.user_code) || {};
//       return {
//         user_code: reg.user_code,
//         full_name: user.full_name || 'Không rõ tên',
//         registered_at: reg.registered_at,
//         unit_code: user.unit_code || '',
//         avatar_url: user.avatar_url || '',
//       };
//     });

//     // 5. Trả về
//     result.sort((a, b) => new Date(a.registered_at) - new Date(b.registered_at));

//     return res.json({
//       success: true,
//       message: `Có ${result.length} sinh viên đăng ký`,
//       data: result,
//     });

//   } catch (err) {
//     console.error('❌ Lỗi getRegistrationsByEvent:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Lỗi hệ thống khi lấy danh sách đăng ký theo sự kiện',
//       error: err.message || err,
//     });
//     }
// };
// exports.getRegistrationsByEvent = async (req, res) => {
//   const eventIdNum = Number(req.params.event_id);
//   if (isNaN(eventIdNum)) {
//     return res.status(400).json({ success: false, message: 'event_id không hợp lệ' });
//   }

//   try {
//     // 1. Lấy tất cả đăng ký có event_id
//     const regRes = await docClient.scan({
//       TableName: REG_TABLE,
//       FilterExpression: 'event_id = :eid',
//       ExpressionAttributeValues: {
//         ':eid': eventIdNum,
//       },
//     }).promise();

//     const registrations = regRes.Items || [];
//     if (registrations.length === 0) {
//       return res.json({ success: true, data: [] });
//     }

//     // 2. Lấy danh sách user_code duy nhất
//     const userCodes = [...new Set(registrations.map((r) => r.user_code))];

//     // 3. Lấy toàn bộ bảng users và lọc theo user_code
//     const usersRes = await docClient.scan({ TableName: USER_TABLE }).promise();
//     const userData = (usersRes.Items || []).filter(u => userCodes.includes(u.user_code));

//     // 4. Lấy toàn bộ bảng graduation_approved và lọc theo user_code
//     const gradsRes = await docClient.scan({ TableName: APPROVE_TABLE }).promise();
//     const gradData = (gradsRes.Items || []).filter(g => userCodes.includes(g.user_code));

//     // 5. Gộp lại: thông tin user + graduation
//     const result = registrations.map((reg) => {
//       const user = userData.find((u) => u.user_code === reg.user_code) || {};
//       const grad = gradData.find((g) => g.user_code === reg.user_code) || {};

//       return {
//         user_code: reg.user_code,
//         full_name: user.full_name || 'Không rõ tên',
//         registered_at: reg.registered_at,
//         unit_code: user.unit_code || grad.unit_code || '',
//         avatar_url: reg.avatar_url || '',

//         // Thông tin tốt nghiệp
//         major: grad.major || '',
//         gpa: grad.gpa || '',
//         classification: grad.classification || '',
//         degree_title: grad.degree_title || '',
//       };
//     });

//     // 6. Sắp xếp theo thời gian đăng ký
//     result.sort((a, b) => new Date(a.registered_at) - new Date(b.registered_at));

//     // 7. Trả về
//     return res.json({
//       success: true,
//       message: `Có ${result.length} sinh viên đăng ký`,
//       data: result,
//     });

//   } catch (err) {
//     console.error('❌ Lỗi getRegistrationsByEvent:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Lỗi hệ thống khi lấy danh sách đăng ký theo sự kiện',
//       error: err.message || err,
//     });
//   }
// };



exports.getRegistrationsByEvent = async (req, res) => {
  const eventIdNum = Number(req.params.event_id);
  if (isNaN(eventIdNum)) {
    return res.status(400).json({ success: false, message: 'event_id không hợp lệ' });
  }

  try {
    // 🔍 1. Lấy thông tin sự kiện (bao gồm slide_template_url)
    const eventDataRes = await docClient.scan({
      TableName: EVENT_TABLE,
      FilterExpression: 'event_id = :eid',
      ExpressionAttributeValues: { ':eid': eventIdNum },
    }).promise();

    const eventData = eventDataRes.Items?.[0] || {};
    console.log('🧩 eventData:', eventData); // <<== Thêm dòng này

    if (!eventData.slide_template_url) {
      console.warn('⚠️ Không có slide_template_url trong eventData');
    } else {
      console.log('✅ slide_template_url:', eventData.slide_template_url);
    }

    // 🔍 2. Lấy tất cả đăng ký có event_id
    const regRes = await docClient.scan({
      TableName: REG_TABLE,
      FilterExpression: 'event_id = :eid',
      ExpressionAttributeValues: {
        ':eid': eventIdNum,
      },
    }).promise();

    const registrations = regRes.Items || [];
    if (registrations.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 🔍 3. Lấy danh sách user_code duy nhất
    const userCodes = [...new Set(registrations.map((r) => r.user_code))];

    // 🔍 4. Lấy toàn bộ bảng users và lọc theo user_code
    const usersRes = await docClient.scan({ TableName: USER_TABLE }).promise();
    const userData = (usersRes.Items || []).filter(u => userCodes.includes(u.user_code));

    // 🔍 5. Lấy toàn bộ bảng graduation_approved và lọc theo user_code
    const gradsRes = await docClient.scan({ TableName: APPROVE_TABLE }).promise();
    const gradData = (gradsRes.Items || []).filter(g => userCodes.includes(g.user_code));

    // 🔍 6. Gộp lại: thông tin user + graduation
    const result = registrations.map((reg) => {
      const user = userData.find((u) => u.user_code === reg.user_code) || {};
      const grad = gradData.find((g) => g.user_code === reg.user_code) || {};

      return {
        user_code: reg.user_code,
        full_name: user.full_name || 'Không rõ tên',
        registered_at: reg.registered_at,
        unit_code: user.unit_code || grad.unit_code || '',
        avatar_url: reg.avatar_url || '',

        // Thông tin tốt nghiệp
        major: grad.major || '',
        gpa: grad.gpa || '',
        classification: grad.classification || '',
        degree_title: grad.degree_title || '',

        // ✅ Slide background từ event
        slide_template_url: eventData.slide_template_url || ''      };
    });

    // 🔍 7. Sắp xếp theo thời gian đăng ký
    result.sort((a, b) => new Date(a.registered_at) - new Date(b.registered_at));

    // 🔍 8. Trả về
    return res.json({
      success: true,
      message: `Có ${result.length} sinh viên đăng ký`,
      data: result,
    });

  } catch (err) {
    console.error('❌ Lỗi getRegistrationsByEvent:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách đăng ký theo sự kiện',
      error: err.message || err,
    });
  }
};

