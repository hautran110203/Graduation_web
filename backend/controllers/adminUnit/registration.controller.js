const {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });

// ✅ Controller chính
exports.approveRegistration = async (req, res) => {
  const { user_code, event_id } = req.params;
  const eventIdNum = Number(event_id);

  try {
    // Lấy sinh viên từ bảng graduation_approved
    const approvedRes = await client.send(
      new GetItemCommand({
        TableName: 'graduation_approved',
        Key: marshall({ user_code }),
      })
    );

    if (!approvedRes.Item) {
      await updateRegistrationStatus(
        user_code,
        eventIdNum,
        'rejected',
        'Không nằm trong danh sách tốt nghiệp'
      );
      return res.status(403).json({
        success: false,
        message: 'Người dùng không nằm trong danh sách tốt nghiệp.',
      });
    }

    const approvedStudent = unmarshall(approvedRes.Item);

    // Lấy sự kiện từ bảng events
    const eventRes = await client.send(
      new GetItemCommand({
        TableName: 'events',
        Key: marshall({ event_id: eventIdNum }),
      })
    );

    if (!eventRes.Item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện.',
      });
    }

    const event = unmarshall(eventRes.Item);

    // So sánh đơn vị
    if (approvedStudent.unit_code === event.unit_code) {
      await updateRegistrationStatus(user_code, eventIdNum, 'approved');
      return res.status(200).json({
        success: true,
        message: 'Phê duyệt thành công.',
      });
    } else {
      await updateRegistrationStatus(
        user_code,
        eventIdNum,
        'rejected',
        'Không cùng đơn vị tổ chức'
      );
      return res.status(403).json({
        success: false,
        message: 'Đơn vị không khớp. Từ chối phê duyệt.',
      });
    }
  } catch (err) {
    console.error('Lỗi khi xử lý phê duyệt:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi xử lý phê duyệt.' });
  }
};

// ✅ Hàm cập nhật status + lý do từ chối
async function updateRegistrationStatus(user_code, event_id, status, reason = null) {
  const updateParams = {
    TableName: 'registrations',
    Key: marshall({ user_code, event_id }),
    UpdateExpression: reason
      ? 'SET registration_status = :status, rejection_reason = :reason'
      : 'SET registration_status = :status REMOVE rejection_reason',
    ExpressionAttributeValues: marshall({
      ':status': status,
      ...(reason ? { ':reason': reason } : {}),
    }),
  };

  await client.send(new UpdateItemCommand(updateParams));
}

exports.getAllRegistrations = async (req, res) => {
  try {
    // Nếu có truyền event_id trên query string thì lọc theo
    const filterEventId = req.query.event_id ? Number(req.query.event_id) : null;

    const scanParams = {
      TableName: 'registrations',
    };

    const result = await client.send(new ScanCommand(scanParams));

    let items = (result.Items || []).map(unmarshall);

    if (filterEventId !== null) {
      items = items.filter((item) => item.event_id === filterEventId);
    }

    // Sắp xếp theo thời gian đăng ký mới nhất
    items.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));

    return res.status(200).json(items);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách đăng ký:', err);
    return res.status(500).json({ error: 'Không thể lấy dữ liệu đăng ký.' });
  }
};