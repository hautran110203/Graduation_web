import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HiUserGroup, HiCalendar, HiClock, HiCheckCircle } from 'react-icons/hi';

import StatsCard from '../../components/AdminUnit/StatsCard';
import UpcomingEventList from '../../components/UpcomingEventList';
import RegistrationPieChart from '../../components/AdminUnit/RegistrationPieChart';

interface EventItem {
  title: string;
  date: string;
}

const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Tổng số sinh viên đăng ký', value: 0, icon: <HiUserGroup className="w-6 h-6" />, color: 'text-blue-600' },
    { label: 'Sự kiện sắp diễn ra', value: 0, icon: <HiCalendar className="w-6 h-6" />, color: 'text-green-600' },
    { label: 'Chờ duyệt', value: 0, icon: <HiClock className="w-6 h-6" />, color: 'text-yellow-600' },
    { label: 'Đã duyệt', value: 0, icon: <HiCheckCircle className="w-6 h-6" />, color: 'text-purple-600' },
  ]);

  const [events, setEvents] = useState<EventItem[]>([]);

 useEffect(() => {
  axios.get('http://localhost:3001/admin/units/overview')
    .then((res) => {
      const s = res.data?.stats;
      const e = res.data?.events;

      if (!s || !e) {
        console.error("❌ API trả về không đầy đủ:", res.data);
        return;
      }

      setStats([
        { label: 'Tổng số sinh viên đăng ký', value: s.total_registered, icon: <HiUserGroup className="w-6 h-6" />, color: 'text-blue-600' },
        { label: 'Sự kiện sắp diễn ra', value: s.upcoming_events, icon: <HiCalendar className="w-6 h-6" />, color: 'text-green-600' },
        { label: 'Chờ duyệt', value: s.pending, icon: <HiClock className="w-6 h-6" />, color: 'text-yellow-600' },
        { label: 'Đã duyệt', value: s.approved, icon: <HiCheckCircle className="w-6 h-6" />, color: 'text-purple-600' },
      ]);
      setEvents(e);
    })
    .catch((err) => {
      console.error("❌ Lỗi tải dữ liệu tổng quan:", err);
    });
}, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">🎓 Tổng quan</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatsCard key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RegistrationPieChart />
        <UpcomingEventList events={events} />
      </div>
    </div>
  );
};

export default AdminOverviewPage;
