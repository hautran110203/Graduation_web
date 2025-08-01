import React from 'react';
import OverviewStats from '../../components/admin/OverviewStats';
import DashboardChart from '../../components/admin/DashboardChart';
import RecentLogs from '../../components/admin/RecentLogs';
import UpcomingEvents from '../../components/admin/UpcomingEvents';

const AdminDashboardPage: React.FC = () => {
  const stats = {
    totalEvents: 12,
    upcomingEvents: 3,
    totalRegistrations: 180,
    activeAdmins: 5,
  };

  const chartData = [
    { name: 'Tốt nghiệp 2025', registrations: 120 },
    { name: 'Tuyên dương SV giỏi', registrations: 45 },
    { name: 'Tổng kết Học kỳ 1', registrations: 78 },
  ];

  const logs = [
    {
      id: '1',
      timestamp: '2025-07-18T14:30:00Z',
      user: 'Nguyễn Văn A',
      action: 'đã phê duyệt đăng ký',
      detail: 'Sinh viên Trần Thị B - Sự kiện Tốt nghiệp 2025',
    },
    {
      id: '2',
      timestamp: '2025-07-18T10:00:00Z',
      user: 'Trần Thị C',
      action: 'đã tạo sự kiện',
      detail: 'Lễ tuyên dương sinh viên giỏi',
    },
  ];

  const upcoming = [
    { name: 'Tốt nghiệp 2025', date: '25/08/2025' },
    { name: 'Lễ khai giảng', date: '01/09/2025' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🎓 Trang tổng quan quản trị viên đơn vị</h1>

      <OverviewStats {...stats} />

      <DashboardChart data={chartData} />

      <div className="grid md:grid-cols-2 gap-6">
        <UpcomingEvents events={upcoming} />
        <RecentLogs logs={logs} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
