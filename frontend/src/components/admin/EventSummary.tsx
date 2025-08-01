import React from 'react';

interface Props {
  totalRegistered: number;
  totalAttended: number;
  totalCompleted: number;
}

const EventSummary: React.FC<Props> = ({
  totalRegistered,
  totalAttended,
  totalCompleted,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      <div className="bg-blue-50 border p-4 rounded shadow text-center">
        <div className="text-sm text-gray-500">📝 Tổng đăng ký</div>
        <div className="text-2xl font-bold text-blue-700">{totalRegistered}</div>
      </div>

      <div className="bg-green-50 border p-4 rounded shadow text-center">
        <div className="text-sm text-gray-500">👥 Tham gia</div>
        <div className="text-2xl font-bold text-green-700">{totalAttended}</div>
      </div>

      <div className="bg-purple-50 border p-4 rounded shadow text-center">
        <div className="text-sm text-gray-500">✅ Hoàn tất</div>
        <div className="text-2xl font-bold text-purple-700">{totalCompleted}</div>
      </div>
    </div>
  );
};

export default EventSummary;
