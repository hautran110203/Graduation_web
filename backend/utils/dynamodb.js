// utils/dynamodb.js
const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();


console.log("🔍 Loaded region:", process.env.AWS_REGION);

module.exports = dynamoDb;

