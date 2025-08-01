import React, { useState } from 'react';
import EventFilterBar from '../../components/admin/EventFilterBar';
import EventSummary from '../../components/admin/EventSummary';
import EventTabs from '../../components/admin/EventTabs';
import ExportButtons from '../../components/admin/ExportButtons';

// 👇 Dữ liệu mẫu giả lập
const mockEvents = [
  { id: 'event1', name: 'Sự kiện Tốt nghiệp 2025' },
  { id: 'event2', name: 'Lễ tổng kết Học kỳ 1' },
];

const EventStatisticsPage: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [showDetail, setShowDetail] = useState(false);

  // 👉 Dữ liệu thống kê mẫu
  const summary = {
    totalRegistered: 180,
    totalAttended: 125,
    totalCompleted: 100,
  };

  const handleExportPDF = () => {
    alert('🚧 Tính năng xuất PDF chưa được tích hợp!');
  };

  const handleExportExcel = () => {
    alert('🚧 Tính năng xuất Excel chưa được tích hợp!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📊 Quản lý & thống kê sự kiện</h1>

      {/* Bộ lọc sự kiện */}
      <EventFilterBar
        events={mockEvents}
        selectedEventId={selectedEventId}
        onChange={(id) => setSelectedEventId(id)}
        onView={() => setShowDetail(true)}
      />

      {/* Nếu có chọn sự kiện */}
      {showDetail && selectedEventId && (
        <>
          {/* Tổng quan */}
          <EventSummary
            totalRegistered={summary.totalRegistered}
            totalAttended={summary.totalAttended}
            totalCompleted={summary.totalCompleted}
          />

          {/* Tabs nội dung */}
          <EventTabs
            renderRegistrationList={() => (
              <div>📄 Hiển thị danh sách đăng ký (table)</div>
            )}
            renderStatistics={() => (
              <div>📈 Hiển thị thống kê chi tiết (biểu đồ, bảng,...)</div>
            )}
            renderLogs={() => (
              <div>🛠 Hiển thị log thao tác liên quan đến sự kiện</div>
            )}
          />

          {/* Nút xuất file */}
          <ExportButtons
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />
        </>
      )}
    </div>
  );
};

export default EventStatisticsPage;
