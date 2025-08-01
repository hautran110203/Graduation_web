import React, { useState } from 'react';

interface Props {
  renderRegistrationList: () => React.ReactNode;
  renderStatistics: () => React.ReactNode;
  renderLogs: () => React.ReactNode;
}

const EventTabs: React.FC<Props> = ({
  renderRegistrationList,
  renderStatistics,
  renderLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'stats' | 'logs'>('register');

  return (
    <div className="mt-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4">
        <button
          onClick={() => setActiveTab('register')}
          className={`pb-2 border-b-2 ${
            activeTab === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
          }`}
        >
          📝 Danh sách đăng ký
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-2 border-b-2 ${
            activeTab === 'stats' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
          }`}
        >
          📊 Thống kê
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2 border-b-2 ${
            activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
          }`}
        >
          🛠 Log hệ thống
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-white border p-4 rounded shadow">
        {activeTab === 'register' && renderRegistrationList()}
        {activeTab === 'stats' && renderStatistics()}
        {activeTab === 'logs' && renderLogs()}
      </div>
    </div>
  );
};

export default EventTabs;
