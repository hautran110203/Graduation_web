import React, { useEffect, useState } from 'react';
import OverviewStats from '../../components/admin/OverviewStats';
import DashboardChart from '../../components/admin/DashboardChart';
import RecentLogs from '../../components/admin/RecentLogs';
import UpcomingEvents from '../../components/admin/UpcomingEvents';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => {
   const fetchStats = async () => {
      try {
        const [eventRes, regisRes] = await Promise.all([
          fetch('http://localhost:3001/events'),
          fetch('http://localhost:3001/registrations/getAll'),
        ]);

        const events = await eventRes.json();
        const registrations = (await regisRes.json()).data || [];

        const today = new Date();
        const oneWeekLater = new Date();
        oneWeekLater.setDate(today.getDate() + 7);

        const totalEvents = events.filter((e: any) => new Date(e.date) >= today).length;

        const upcomingEvents = events.filter((e: any) => {
          const eventDate = new Date(e.date);
          return eventDate >= today && eventDate <= oneWeekLater;
        }).length;

        const eventIds = new Set(
          events
            .filter((e: any) => new Date(e.date) >= today)
            .map((e: any) => e.event_id)
        );

        const totalRegistrations = registrations.filter((r: any) =>
          eventIds.has(r.event_id)
        ).length;

        setStats({ totalEvents, upcomingEvents, totalRegistrations });
      } catch (err) {
        console.error('Lỗi khi load thống kê dashboard:', err);
      }
    };
    fetchStats();
  }, []);

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
