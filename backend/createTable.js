const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-1' });

const dynamodb = new AWS.DynamoDB();

const createTableUsers = {
  TableName: 'users',
  KeySchema: [
    { AttributeName: 'user_code', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'user_code', AttributeType: 'S' },
  ],
  BillingMode: "PAY_PER_REQUEST"
};

const createTableAdmins = {
  TableName: 'admins',
  KeySchema: [
    {AttributeName: 'user_code', KeyType: 'HASH'},
    {AttributeName: 'unit_code', KeyType: 'RANGE'}
  ],
  AttributeDefinitions:[
    {AttributeName: 'user_code', AttributeType: 'S'},
    {AttributeName: 'unit_code', AttributeType: 'S'}
  ],
    BillingMode: "PAY_PER_REQUEST"
}

const createTableNotifications = {
  TableName: 'notifications',
  KeySchema: [
    {AttributeName: 'user_code', KeyType: 'HASH'},
    {AttributeName: 'created_at', KeyType: 'RANGE'}
  ],
  AttributeDefinitions:[
    {AttributeName: 'user_code', AttributeType: 'S'},
    {AttributeName: 'created_at', AttributeType: 'S'}
  ],
    BillingMode: "PAY_PER_REQUEST"
}

const createTableEventLogs = {
  TableName: 'event_logs',
  KeySchema: [
    {AttributeName: 'id', KeyType: 'HASH'},
    {AttributeName: 'timestamp', KeyType: 'RANGE'}
  ],
  AttributeDefinitions:[
    {AttributeName: 'id', AttributeType: 'N'},
    {AttributeName: 'timestamp', AttributeType: "S"}
  ],
    BillingMode: "PAY_PER_REQUEST"
}

const createTableRegistrations = {
  TableName: 'registrations',
  KeySchema: [
    {AttributeName: 'event_id', KeyType: 'HASH'},
    {AttributeName: 'user_code', KeyType: 'RANGE'}
  ],
  AttributeDefinitions:[
    {AttributeName: 'event_id', AttributeType: 'N'},
    {AttributeName: 'user_code', AttributeType: "S"}
  ],
    BillingMode: "PAY_PER_REQUEST"
}

const createTableUnits = {
  TableName: 'units',
  KeySchema: [
    {AttributeName: 'unit_code', KeyType: 'HASH'},
  ],
  AttributeDefinitions:[
    {AttributeName: 'unit_code', AttributeType: 'S'},

  ],
    BillingMode: "PAY_PER_REQUEST"
}

const createTableEvents ={
  TableName: 'events',
  KeySchema: [
    {AttributeName: 'unit_code', KeyType: 'HASH'},
    {AttributeName: 'event_id', KeyType: 'RANGE'}
  ],
  AttributeDefinitions:[
    {AttributeName: 'unit_code', AttributeType: 'S'},
    {AttributeName: 'event_id', AttributeType: 'N'}
  ],
    BillingMode: "PAY_PER_REQUEST"
}



async function createAllTable() {
  try{
    const users = await dynamodb.createTable(createTableUsers).promise();
    console.log("Tao bang user",users.TableDescription.TableName);
    // const admin = await dynamodb.createTable(createTableAdmins).promise();
    // console.log("Tao bang admin", admin.TableDescription.TableName);
    // const notifications = await dynamodb.createTable(createTableNotifications).promise();
    // console.log("Tao bang notifications", notifications.TableDescription.TableName);
    // const event_logs = await dynamodb.createTable(createTableEventLogs).promise();
    // console.log("Tao bang event_logs", event_logs.TableDescription.TableName);
    // const registrations = await dynamodb.createTable(createTableRegistrations).promise();
    // console.log("Tao bang registrations", registrations.TableDescription.TableName);
    // const units = await dynamodb.createTable(createTableUnits).promise();
    // console.log("Tao bang units", units.TableDescription.TableName);
    // const events = await dynamodb.createTable(createTableEvents).promise();
    // console.log("Tao bang events", events.TableDescription.TableName);
  }catch(err){
    console.error("❌ Lỗi tạo bảng:", err);
  }
}

// createAllTable();



const docClient = new AWS.DynamoDB.DocumentClient();

// Dữ liệu giả lập (tạm thời) để không bị lỗi khi put
const userItem = {
  TableName: 'users',
  Item: {
    user_code: 'U001',
    full_name: 'Trần Trung Hậu',
    email: 'hau@example.com',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: new Date().toISOString()
  }
};

const adminItem = {
  TableName: 'admins',
  Item: {
    user_code: 'U001',
    unit_code: 'CNTT',
    permissions: 'manage_events'
  }
};


const notificationsItem = {
  TableName: 'notifications',
  Item: {
    user_code: 'U001',
    content: 'Bạn đã được duyệt đăng ký',
    is_read: false,  // boolean chứ không phải chuỗi
    created_at: new Date().toISOString()
  }
};

const unitsItem = {
  TableName: 'units',
  Item: {
    unit_code: 'CNTT',
    name: 'Công nghệ thông tin',
    description: 'Khoa CNTT',
    created_at: new Date().toISOString()
  }
};

const event_logsItem = {
  TableName: 'event_logs',
  Item: {
    id: 1,
    performed_by_user_code: 'U001',
    action: 'update_registration',
    change_details: 'status: pending → approved',
    timestamp: new Date().toISOString()
  }
};

const registrationsItem = {
  TableName: 'registrations',
  Item: {
    event_id: 101,
    user_code: 'U001',
    registration_status: 'approved',
    registration_photo_url: 'https://example.com/photo.jpg',
    created_at: new Date().toISOString()
  }
};

const eventItem = {
  TableName: 'events',
  Item: {
    event_id: 101,
    unit_code: 'CNTT',
    title: 'Lễ tốt nghiệp 2025',
    description: 'Buổi lễ tổ chức tại hội trường A',
    start_time: '2025-08-01T08:00:00Z',
    end_time: '2025-08-01T10:00:00Z',
    location: 'Hội trường A',
    status: 'upcoming',
    slide_template_url: 'https://example.com/template.pptx'
  }
};

async function putAllTable() {
  try {
    await docClient.put(userItem).promise();
    console.log("✅ Đã ghi users");

    // await docClient.put(adminItem).promise();
    // console.log("✅ Đã ghi admins");

    // await docClient.put(userRoleItem).promise();
    // console.log("✅ Đã ghi user_roles");

    // await docClient.put(notificationsItem).promise();
    // console.log("✅ Đã ghi notifications");

    // await docClient.put(event_logsItem).promise();
    // console.log("✅ Đã ghi event_logs");

    // await docClient.put(registrationsItem).promise();
    // console.log("✅ Đã ghi registrations");

    // await docClient.put(unitsItem).promise();
    // console.log("✅ Đã ghi units");

    // await docClient.put(eventItem).promise();
    // console.log("✅ Đã ghi events");

  } catch (err) {
    console.error("❌ Lỗi khi ghi dữ liệu:", err);
  }
}

putAllTable();