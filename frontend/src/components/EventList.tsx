// ✅ Đã tích hợp backend events API vào giao diện & sắp xếp upcoming → past
import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import EventFilter from '../components/EventFilter';
import axios from 'axios';

export interface Event {
  event_id: number;
  unit_code: string;
  title: string;
  start_time: string; // ISO datetime
  end_time: string;   // ISO datetime
  location: string;
  description: string;
  status: string;
  location_id: string;  // <-- đổi sang id
  location_name: string;
}

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // yyyy-mm-dd
  const [loading, setLoading] = useState(true);

  const eventsPerPage = 6;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<Event[]>('http://localhost:3001/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data || []);
      } catch (err) {
        console.error('Lỗi lấy sự kiện:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // --- Lọc theo từ khóa, địa điểm, ngày ---
  const filteredEvents = events.filter((e) => {
    const matchKeyword = e.title.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchLocation = selectedLocation === '' || e.location === selectedLocation;
    const matchDate = selectedDate === '' || e.start_time.slice(0, 10) === selectedDate;
    return matchKeyword && matchLocation && matchDate;
  });

  // --- Sắp xếp: Upcoming trước (tăng dần), Past sau (giảm dần) ---
  const orderedEvents = [...filteredEvents].sort((a, b) => {
    const now = Date.now();

    // Nếu bạn muốn dựa theo hạn đăng ký, thay start_time bằng registration_deadline
    const aStart = new Date(a.start_time).getTime();
    const bStart = new Date(b.start_time).getTime();

    const aUpcoming = aStart >= now;
    const bUpcoming = bStart >= now;

    // Upcoming trước Past
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;

    // Cùng nhóm Upcoming → tăng dần (gần nhất trước)
    if (aUpcoming && bUpcoming) return aStart - bStart;

    // Cùng nhóm Past → giảm dần (mới hết hạn trước)
    return bStart - aStart;
  });

  // --- Phân trang ---
  const indexOfLast = currentPage * eventsPerPage;
  const currentEvents = orderedEvents.slice(indexOfLast - eventsPerPage, indexOfLast);
  const totalPages = Math.ceil(orderedEvents.length / eventsPerPage);

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedLocation('');
    setSelectedDate('');
    setCurrentPage(1);
  };

  const locations = [...new Set(events.map((e) => e.location).filter(Boolean))];

  if (loading) return <p className="p-4">Đang tải sự kiện...</p>;

  return (
    <div className="px-4 py-6">
      <h3 className="text-2xl font-semibold mb-4">📅 Danh sách sự kiện</h3>

      <EventFilter
        searchKeyword={searchKeyword}
        selectedLocation={selectedLocation}
        selectedDate={selectedDate}
        locations={locations}
        onKeywordChange={(v) => { setSearchKeyword(v); setCurrentPage(1); }}
        onLocationChange={(v) => { setSelectedLocation(v); setCurrentPage(1); }}
        onDateChange={(v) => { setSelectedDate(v); setCurrentPage(1); }}
        onResetFilters={handleResetFilters}
      />

      {orderedEvents.length === 0 ? (
        <div className="text-gray-500 mt-6">Không tìm thấy sự kiện phù hợp.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentEvents.map((event) => (
              <EventCard
                key={event.event_id}
                event_id={event.event_id}
                unit_code={event.unit_code}
                title={event.title}
                date={new Date(event.start_time).toLocaleDateString('vi-VN')}
                time={`${new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                location_id={event.location_id}
                location_name={event.location_name}
                description={event.description}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              ← Trước
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border ${
                  currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Tiếp →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EventList;
