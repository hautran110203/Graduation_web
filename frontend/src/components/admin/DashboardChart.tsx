import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EventData {
  name: string;
  registrations: number;
}

interface Props {
  data: EventData[];
}

const DashboardChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white border rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-4">📊 Thống kê lượt đăng ký theo sự kiện</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="registrations" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;
