import React from 'react';

interface LogItem {
  id: string;
  timestamp: string; // ISO date string
  user: string;
  action: string;
  detail: string;
}

interface Props {
  logs: LogItem[];
}

const RecentLogs: React.FC<Props> = ({ logs }) => {
  return (
    <div className="bg-white border rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-3">🛠 Nhật ký hoạt động gần đây</h2>
      <ul className="space-y-3 text-sm">
        {logs.length === 0 && <p className="text-gray-500">Không có hoạt động nào gần đây.</p>}
        {logs.map((log) => (
          <li key={log.id} className="flex flex-col border-b pb-2">
            <div>
              <span className="font-medium text-blue-600">{log.user}</span> {log.action}
            </div>
            <div className="text-gray-600 italic">{log.detail}</div>
            <div className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentLogs;
