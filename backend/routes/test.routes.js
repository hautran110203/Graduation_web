const express = require('express');
const router = express.Router();
const dynamoDb = require('../utils/dynamodb');

router.get('/test-connection', async (req, res) => {
  const params = {
    TableName: 'users', // tên bảng có sẵn của bạn
    Limit: 5
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    res.json({
      message: '✅ Kết nối thành công!',
      data: data.Items
    });
  } catch (err) {
    res.status(500).json({
      message: '❌ Lỗi khi kết nối DynamoDB',
      error: err.message
    });
  }
});

module.exports = router;
