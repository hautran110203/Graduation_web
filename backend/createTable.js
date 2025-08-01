const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-1' });
const bcrypt = require('bcryptjs'); 

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

const createTableGraduation_approved={
  TableName: 'graduation_approved',
  KeySchema: [
    {AttributeName: 'user_code', KeyType: 'HASH'},
    {AttributeName: 'graduation_id', KeyType: 'RANGE'}
  ],
  AttributeDefinitions:[
    {AttributeName: 'user_code', AttributeType: 'S'},
    {AttributeName: 'graduation_id', AttributeType: 'N'}
  ],
    BillingMode: "PAY_PER_REQUEST"
}

const createTableLocations = {
  TableName: 'locations',
  KeySchema: [
    { AttributeName: 'location_id', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'location_id', AttributeType: 'N' },
  ],
  BillingMode: "PAY_PER_REQUEST"
};

async function createAllTable() {
  try{
    // const graduation_approved = await dynamodb.createTable(createTableGraduation_approved).promise();
    // console.log("Tao bang graduation_approved",graduation_approved.TableDescription.TableName);
    // const users = await dynamodb.createTable(createTableUsers).promise();
    // console.log("Tao bang user",users.TableDescription.TableName);
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
    const locations = await dynamodb.createTable(createTableLocations).promise();
    console.log("Tao bang locations",locations.TableDescription.TableName);
  }catch(err){
    console.error("❌ Lỗi tạo bảng:", err);
  }
}

// createAllTable();



const docClient = new AWS.DynamoDB.DocumentClient();

// Dữ liệu giả lập (tạm thời) để không bị lỗi khi put
async function putAllTable() {
  try {
    // 👇 Hash mật khẩu mặc định
    const hashedPassword = await bcrypt.hash('123456', 10);

    const userItem = {
      TableName: 'users',
      Item: {
        user_code: 'U001',
        full_name: 'Trần Trung Hậu',
        email: 'hau@example.com',
        avatar_url: 'https://example.com/avatar.jpg',
        password: hashedPassword, // ✅ Đã hash
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
        is_read: false,
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

    const graduation_approvedItem = {
      TableName: 'graduation_approved',
      Item: {
        user_code: 'U001',              // Mã sinh viên
        graduation_id: 1,               // ID của đợt tốt nghiệp
        unit_code: 'CNTT',              // Mã đơn vị (ví dụ: CNTT)
        uploaded_by: 'admin001',        // Mã người upload
        created_at: new Date().toISOString(), // Thời gian upload
        major: 'Khoa học máy tính',     // Ngành
        training_time: '2019 - 2024',   // Thời gian đào tạo
        gpa: 3.48,                      // Điểm trung bình
        classification: 'Giỏi',         // Xếp loại
        degree_title: 'Kỹ sư'           // Danh hiệu: "Kỹ sư" hoặc "Cử nhân"
      }
  };
    
     const locationItem = {
      TableName: 'locations',
      Item: {
        location_id: 1,
        location_name: 'Hội trường rùa',
        location_map:"",
        location_address: "Khu II, Đ. 3/2, P. Ninh Kiều, TP. Cần Thơ"
      }
    };
  
    // ✅ Ghi dữ liệu
    await docClient.put(locationItem).promise();
    console.log("✅ Đã ghi ");
    // await docClient.put(graduation_approvedItem).promise();
    // console.log("✅ Đã ghi ");
    // await docClient.put(userItem).promise();
    // console.log("✅ Đã ghi users");

    // Bạn bật các dòng dưới nếu muốn ghi thêm các bảng
    // await docClient.put(adminItem).promise();
    // await docClient.put(notificationsItem).promise();
    // await docClient.put(unitsItem).promise();
    // await docClient.put(event_logsItem).promise();
    // await docClient.put(registrationsItem).promise();
    // await docClient.put(eventItem).promise();

  } catch (err) {
    console.error("❌ Lỗi khi ghi dữ liệu:", err);
  }
}

putAllTable();