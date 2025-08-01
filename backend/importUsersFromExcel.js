const AWS = require('aws-sdk');
const XLSX = require('xlsx');
const path = require('path');
const bcrypt = require('bcryptjs'); // 👈 cần cài thêm bcryptjs

// ⚙️ Cấu hình AWS DynamoDB
AWS.config.update({ region: 'ap-southeast-1' });
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE = 'users';

// 📥 Đọc file Excel
const filePath = path.join(__dirname, 'datauser.xlsx'); // không cần dấu "/"
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 🧾 Parse dữ liệu thành array object
const users = XLSX.utils.sheet_to_json(sheet);

// 📤 Hàm ghi từng dòng lên DynamoDB
async function importUsers() {
  for (const user of users) {
    const { user_code, full_name, email, role, password } = user;

    if (!user_code || !full_name || !email) {
      console.log(`⚠️ Bỏ qua dòng thiếu thông tin:`, user);
      continue;
    }

    // ✅ Hash mật khẩu
    const rawPassword = password || '123456'; // nếu không có thì dùng mặc định
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const params = {
      TableName: TABLE,
      Item: {
        user_code,
        full_name,
        email,
        avatar_url: null, // sẽ upload sau khi login
        role: role || 'student',
        password: hashedPassword,
        created_at: new Date().toISOString()
      }
    };

    try {
      await docClient.put(params).promise();
      console.log(`✅ Đã thêm: ${user_code}`);
    } catch (err) {
      console.error(`❌ Lỗi với ${user_code}:`, err.message);
    }
  }
}

importUsers();
