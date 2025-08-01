import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft } from 'phosphor-react';

interface EventType {
  id: number;
  unit_code: string;
  event_id: number;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  attachments?: { name: string; url: string }[];
  images?: string[];
}

const EventDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { unit_code, event_id } = useParams<{ unit_code: string; event_id: string }>();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:3001/events/${unit_code}/${event_id}`);
        if (!res.ok) throw new Error('Không tìm thấy');
        const data = await res.json();
        setEvent({
          ...data,
          id: Number(event_id), // 🔁 THÊM id để ConfirmPortrait có thể dùng
        });
      } catch (err) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [unit_code, event_id]);

  if (loading) return <p className="text-center py-10">Đang tải sự kiện...</p>;

  if (!event) {
    return (
      <div className="text-center text-red-500 py-10">
        ❌ Không tìm thấy sự kiện.
        <div className="mt-4">
          <button onClick={() => navigate('/events')} className="bg-gray-200 px-4 py-2 rounded">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');
  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
        onClick={() => navigate('/events')}
      >
        <ArrowLeft size={18} /> Quay lại danh sách
      </button>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">🎓 {event.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 text-gray-600 text-sm gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            {formatDate(event.start_time)}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} />
            {formatTime(event.start_time)} - {formatTime(event.end_time)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            {event.location}
          </div>
        </div>

        <p className="text-gray-800 mb-4">{event.description}</p>

        <div className="mt-6 flex gap-3">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() =>
              navigate('/events/confirm', {
                state: { event }, // truyền sự kiện kèm event.id
              })
            }
          >
            Đăng ký tham gia
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
