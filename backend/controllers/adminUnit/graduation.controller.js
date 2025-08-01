const AWS = require('aws-sdk');
const XLSX = require('xlsx');
const fs = require('fs');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const APPROVE_TABLE = 'graduation_approved';
const USERS_TABLE = 'users';
const UNITS_TABLE = 'units';
// GET /api/graduation/details
exports.getGraduationDetails = async (req, res) => {
  try {
    // 1. Lấy toàn bộ bản ghi tốt nghiệp
    const gradData = await dynamoDb.scan({ TableName: APPROVE_TABLE }).promise();
    const grads = gradData.Items || [];

    // 2. Lấy danh sách user_code và unit_code duy nhất
    const userCodes = grads.map(g => g.user_code);
    const unitCodes = [...new Set(grads.map(g => g.unit_code))];

    if (!Array.isArray(grads)) {
      console.error('❌ grads không phải mảng:', gradData);
      return res.status(500).json({ error: 'Dữ liệu không hợp lệ' });
    }

    // 3. Lấy thông tin user
    const userBatches = [];
    while (userCodes.length) userBatches.push(userCodes.splice(0, 100));

    const userResults = await Promise.all(
      userBatches.map(batch =>
        dynamoDb.batchGet({
          RequestItems: {
            [USERS_TABLE]: {
              Keys: batch.map(code => ({ user_code: code })),
              ProjectionExpression: 'user_code, full_name',
            },
          },
        }).promise()
      )
    );

    const users = userResults.flatMap(r => r.Responses[USERS_TABLE]);
    const userMap = Object.fromEntries(users.map(u => [u.user_code, u.full_name || '']));

    // 4. Lấy thông tin tên đơn vị (unit_name từ name)
    const unitBatches = [];
    while (unitCodes.length) unitBatches.push(unitCodes.splice(0, 100));

    const unitResults = await Promise.all(
      unitBatches.map(batch =>
        dynamoDb.batchGet({
          RequestItems: {
            [UNITS_TABLE]: {
              Keys: batch.map(code => ({ unit_code: code })),
              ProjectionExpression: 'unit_code, #name',
              ExpressionAttributeNames: {
              '#name': 'name'
              }
            },
          },
        }).promise()
      )
    );

    const units = unitResults.flatMap(r => r.Responses[UNITS_TABLE]);
    const unitMap = Object.fromEntries(units.map(u => [u.unit_code, u.name || u.unit_code]));

    // 5. Gộp dữ liệu
    const result = grads.map((g, index) => ({
      id: index + 1,
      user_code: g.user_code,
      full_name: userMap[g.user_code] || '',
      major: g.major,
      training_time: g.training_time,
      gpa: g.gpa,
      classification: g.classification,
      degree_title: g.degree_title,
      graduation_id: g.graduation_id || '',
      faculty: unitMap[g.unit_code] || g.unit_code, 
      faculty_code: g.unit_code,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Lỗi lấy thông tin tốt nghiệp:", err);
    res.status(500).json({ error: "Lỗi truy xuất dữ liệu tốt nghiệp" });
  }
};


// POST /api/graduation/upload
exports.uploadGraduationList = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const graduation_id = rows[0]?.graduation_id || Date.now();
    const uploaded_by = req.user?.user_code || 'admin';
    const created_at = new Date().toISOString();

    const savedItems = [];

    for (const row of rows) {
      const user_code = row.user_code?.trim();
      if (!user_code) continue;

      const userData = await dynamoDb.get({
        TableName: USERS_TABLE,
        Key: { user_code },
      }).promise();

      const user = userData.Item;
      if (!user) {
        console.warn(`⚠️ Không tìm thấy user: ${user_code}`);
        continue;
      }

      const item = {
        TableName: APPROVE_TABLE,
        Item: {
          user_code,
          graduation_id: Number(graduation_id),
          unit_code: user.unit_code || '',
          uploaded_by,
          created_at,

          email: user.email || '',
          full_name: user.full_name || '',
          major: row.major || '',
          training_time: row.training_time || '',
          gpa: parseFloat(row.gpa) || null,
          classification: row.classification || '',
          degree_title: row.degree_title || '',
        },
      };

      await dynamoDb.put(item).promise();
      savedItems.push(user_code);
    }

    fs.unlinkSync(filePath); // dọn file tạm

    res.json({
      message: '✅ Upload thành công',
      saved: savedItems.length,
      failed: rows.length - savedItems.length,
    });
  } catch (err) {
    console.error('❌ Upload lỗi:', err);
    res.status(500).json({ error: 'Lỗi xử lý file Excel' });
  }
};

// PUT /api/graduation/students/:user_code
exports.updateStudent = async (req, res) => {
  const { user_code } = req.params;
  const {
    major,
    training_time,
    gpa,
    classification,
    degree_title,
    id,
    graduation_id // ✅ Phải có để định danh bản ghi
  } = req.body;

  if (!graduation_id) {
    return res.status(400).json({ error: 'Thiếu graduation_id để update' });
  }

  const params = {
    TableName: APPROVE_TABLE,
    Key: {
      user_code,
      graduation_id: Number(graduation_id), // ✅ BẮT BUỘC: phải có sort key
    },
    UpdateExpression: `
      SET major = :major,
          training_time = :training_time,
          gpa = :gpa,
          classification = :classification,
          degree_title = :degree_title,
          id = :id
    `,
    ExpressionAttributeValues: {
      ':major': major || '',
      ':training_time': training_time || '',
      ':gpa': Number(gpa) || 0,
      ':classification': classification || '',
      ':degree_title': degree_title || '',
      ':id': id || '',
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    console.log('📦 Update params:', params);
    const result = await dynamoDb.update(params).promise();
    return res.json({ message: '✅ Cập nhật thành công', updated: result.Attributes });
  } catch (error) {
    console.error('❌ DynamoDB update error:', error);
    return res.status(500).json({ error: 'Cập nhật thất bại', detail: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  const { user_code } = req.params;
  const { graduation_id } = req.query;
  if (!user_code) {
    return res.status(400).json({ error: 'Thiếu user_code để xóa' });
  }

  const params = {
    TableName: APPROVE_TABLE,
    Key: {
      user_code,
      graduation_id: Number(graduation_id), 
    },
  };

  try {
    await dynamoDb.delete(params).promise();
    res.json({ message: `🗑️ Đã xóa sinh viên với user_code: ${user_code}` });
  } catch (err) {
    console.error('❌ Lỗi khi xóa sinh viên:', err);
    res.status(500).json({ error: 'Xóa thất bại', detail: err.message });
  }
};

exports.getFaculties = async (req, res) => {
  const params = {
    TableName: UNITS_TABLE,
    ProjectionExpression: 'unit_code, #name',
     ExpressionAttributeNames: {
      '#name': 'name'
    }
  };

  try {
    const result = await dynamoDb.scan(params).promise();

    const faculties = result.Items.map(item => ({
      unit_code: item.unit_code,
      unit_name: item.name, 
    }));

    res.json(faculties);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách khoa:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách khoa' });
  }
};
