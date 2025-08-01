// ✅ Đã tích hợp backend events API vào giao diện
import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import EventFilter from '../components/EventFilter';
import axios from 'axios';

export interface Event {
  event_id: number;
  unit_code:string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  status: string;
}

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  const eventsPerPage = 6;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3001/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) {
        console.error('Lỗi lấy sự kiện:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const matchKeyword = e.title.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchLocation = selectedLocation === '' || e.location === selectedLocation;
    const matchDate = selectedDate === '' || e.start_time.slice(0, 10) === selectedDate;
    return matchKeyword && matchLocation && matchDate;
  });

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedLocation('');
    setSelectedDate('');
    setCurrentPage(1);
  };
  
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const indexOfLast = currentPage * eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfLast - eventsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const locations = [...new Set(events.map(e => e.location))];

  if (loading) return <p className="p-4">Đang tải sự kiện...</p>;

  return (
    <div className="px-4 py-6">
      <h3 className="text-2xl font-semibold mb-4">📅 Danh sách sự kiện</h3>

      <EventFilter
        searchKeyword={searchKeyword}
        selectedLocation={selectedLocation}
        selectedDate={selectedDate}
        locations={locations}
        onKeywordChange={setSearchKeyword}
        onLocationChange={setSelectedLocation}
        onDateChange={setSelectedDate}
        onResetFilters={handleResetFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentEvents.map(event => (
          <EventCard
            key={event.event_id}
            event_id={event.event_id}
            unit_code={event.unit_code} // thêm dòng này nếu bạn cần unit_code để điều hướng
            title={event.title}
            date={new Date(event.start_time).toLocaleDateString('vi-VN')}
            time={`${new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            location={event.location}
            description={event.description}
          />
        ))}
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
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
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Tiếp →
        </button>
      </div>
    </div>
  );
};

export default EventList;
