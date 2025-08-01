import React from 'react';

interface Props {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  activeAdmins: number;
}

const OverviewStats: React.FC<Props> = ({
  totalEvents,
  upcomingEvents,
  totalRegistrations,
  activeAdmins,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <div className="bg-blue-50 border p-4 rounded shadow text-center">
        <div className="text-sm text-gray-500">📅 Tổng số sự kiện</div>
        <div className="text-2xl font-bold text-blue-700">{totalEvents}</div>
      </div>

      <div className="bg-yellow-50 border p-4 rounded shadow text-center">
        <div className="text-sm text-gray-500">🕒 Sự kiện sắp diễn ra</div>
        <div className="text-2xl font-bold text-yellow-700">{upcomingEvents}</div>
      </div>

      <div className="bg-green-50 border p-4 rounded shadow text-center">
        <div className="text-sm text-gray-500">📝 Đăng ký tốt nghiệp</div>
        <div className="text-2xl font-bold text-green-700">{totalRegistrations}</div>
      </div>

      <div className="bg-purple-50 border p-4 rounded shadow text-center">
        <div className="text-sm text-gray-500">🛡️ Quản trị viên hoạt động</div>
        <div className="text-2xl font-bold text-purple-700">{activeAdmins}</div>
      </div>
    </div>
  );
};

export default OverviewStats;
