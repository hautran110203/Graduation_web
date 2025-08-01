const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.getAdminOverview = async (req, res) => {
  try {
    const regData = await docClient.scan({ TableName: 'registrations' }).promise();
    const total = regData.Count || 0;
    const approved = regData.Items.filter(i => i.registration_status === 'approved').length;
    const pending = regData.Items.filter(i => i.registration_status === 'pending').length;

    const eventData = await docClient.scan({ TableName: 'events' }).promise();
    const upcoming = eventData.Items
      .filter(ev => ev.status === 'upcoming' && new Date(ev.start_time) > new Date())
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 3)
      .map(ev => ({
        title: ev.title,
        date: new Date(ev.start_time).toLocaleDateString('vi-VN')
      }));

    return res.json({
      stats: {
        total_registered: total,
        upcoming_events: upcoming.length,
        pending,
        approved
      },
      events: upcoming
    });
  } catch (err) {
    console.error("❌ Lỗi thống kê:", err);
    return res.status(500).json({ message: "Lỗi lấy thống kê tổng quan" });
  }
};
