const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-southeast-1', // hoặc dùng process.env nếu có .env
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
});

const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE = 'users';

const users = [];

for (let i = 1; i <= 50; i++) {
  const code = `U${String(i).padStart(3, '0')}`; // U001 → U050
  users.push({
    user_code: code,
    full_name: `Người dùng ${i}`,
    email: `user${i}@example.com`,
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=user${i}`,
    created_at: new Date().toISOString()
  });
}

async function seedUsers() {
  for (const user of users) {
    const params = {
      TableName: TABLE,
      Item: user
    };

    try {
      await docClient.put(params).promise();
      console.log(`✅ Đã thêm ${user.user_code}`);
    } catch (err) {
      console.error(`❌ Lỗi khi thêm ${user.user_code}:`, err);
    }
  }

  console.log("🎉 Đã thêm xong 50 user mẫu.");
}

seedUsers();
