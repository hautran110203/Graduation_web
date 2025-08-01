const AWS = require('aws-sdk');
const XLSX = require('xlsx');

// Cấu hình AWS
AWS.config.update({ region: 'ap-southeast-1' });
const docClient = new AWS.DynamoDB.DocumentClient();

// Map tên đơn vị sang mã đơn vị
const unitNameToCode = {
  "Trường Thủy sản": "TS",
  "Viện CN Sinh học và Thực phẩm": "DA",
  "Khoa Khoa học Chính trị": "KHCT",
  "Khoa Ngoại ngữ": "NN",
  "Khoa Môi trường và Tài nguyên thiên nhiên": "MTTN",
  "Trường Kinh tế": "KT",
  "Trường Nông nghiệp": "NNGHIEP",
  "Trường Công nghệ thông tin và Truyền thông": "CNTT",
  "Khoa Luật": "LUAT",
  "Khoa Phát triển Nông thôn": "PTNT",
  "Khoa Khoa học Tự nhiên": "KHTN",
  "Khoa Khoa học Xã hội và Nhân văn": "KHXHNV",
  "Khoa Giáo dục thể chất": "GDTC",
  "Trường Sư phạm": "SP",
  "Trường Bách khoa": "BK"
};

// Đọc dữ liệu từ file Excel
const workbook = XLSX.readFile("F:\\Graduation registration website\\Web\\backend\\datauser.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

// Hàm cập nhật DynamoDB
async function updateUser(user_code, unit_code) {
  const params = {
    TableName: 'users',
    Key: { user_code }, // Sử dụng user_code làm key
    UpdateExpression: 'set unit_code = :u',
    ExpressionAttributeValues: {
      ':u': unit_code,
    },
  };

  try {
    await docClient.update(params).promise();
    console.log(`✅ Cập nhật ${user_code} -> ${unit_code}`);
  } catch (err) {
    console.error(`❌ Lỗi cập nhật ${user_code}:`, err.message);
  }
}

// Chạy cập nhật
(async () => {
  for (const row of rows) {
    const user_code = row.user_code || row['User Code'] || row['userCode'];
    const rawUnit = Object.values(row).pop(); // Tên đơn vị nằm ở cột cuối
    const unit_code = unitNameToCode[rawUnit?.trim()];

    if (!user_code || !unit_code) {
      console.warn(`⚠️ Bỏ qua: ${user_code} - ${rawUnit}`);
      continue;
    }

    await updateUser(user_code, unit_code);
  }
})();
