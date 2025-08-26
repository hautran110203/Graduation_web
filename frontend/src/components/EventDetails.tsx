import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft } from 'phosphor-react';

interface EventType {
  event_id: number;
  unit_code: string;
  title: string;
  start_time: string;
  end_time: string;
  location_id: string;    // ✅ dùng id địa điểm
  location_name: string;  // ✅ tên địa điểm (join từ bảng locations)
  description: string;
  attachments?: { name: string; url: string }[];
  images?: string[];
}

const EventDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { unit_code, event_id } = useParams<{ unit_code: string; event_id: string }>();

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // ✅ Lấy thông tin từ localStorage (giống ConfirmPortrait)
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const user_code = user?.user_code;
  const unit_code_from_user = user?.unit_code;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:3001/events/${unit_code}/${event_id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error('Không tìm thấy');
        const raw = await res.json();

        // Map dữ liệu để chắc chắn có location_id/location_name và event_id
        const mapped: EventType = {
          event_id: raw.event_id ?? Number(event_id),
          unit_code: raw.unit_code ?? unit_code!,
          title: raw.title,
          start_time: raw.start_time,
          end_time: raw.end_time,
          location_id: raw.location_id ?? '',
          location_name: raw.location_name ?? raw.location ?? '', // fallback từ field cũ 'location'
          description: raw.description,
          attachments: raw.attachments,
          images: raw.images,
        };

        setEvent(mapped);
      } catch (err) {
        console.error(err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (unit_code && event_id) fetchEvent();
  }, [unit_code, event_id, token]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN');

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleCheckAndNavigate = async () => {
    if (!event || !user_code || !unit_code_from_user || !token) {
      alert('⚠️ Thiếu thông tin đăng nhập hoặc sự kiện.');
      return;
    }

    // 🔎 Kiểm tra còn ít nhất 2 ngày trước start_time
    const now = new Date();
    const startTime = new Date(event.start_time);
    const diffTime = startTime.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 2) {
      alert('⛔ Đã hết hạn đăng ký sự kiện này (phải đăng ký trước ít nhất 2 ngày).');
      return;
    }

    setChecking(true);
try {
  const url = `http://localhost:3001/registrations/check-registration/${user_code}/${event.event_id}/${unit_code_from_user}`;
  const checkRes = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

      // 🔒 Bắt riêng các mã lỗi trước khi đọc JSON
      if (checkRes.status === 409) {
        // Đã đăng ký rồi
        setAlreadyRegistered(true);
        // cố gắng đọc message nếu backend trả JSON
        try {
          const body = await checkRes.json();
          alert(body?.message || '⛔ Bạn đã đăng ký sự kiện này rồi.');
        } catch {
          alert('⛔ Bạn đã đăng ký sự kiện này rồi.');
        }
        return;
      }

      if (checkRes.status === 403) {
        // Không đủ điều kiện (khác đơn vị / không trong danh sách)
        try {
          const body = await checkRes.json();
          alert(body?.message || '❌ Bạn không đủ điều kiện đăng ký.');
        } catch {
          alert('❌ Bạn không đủ điều kiện đăng ký.');
        }
        return;
      }

      if (checkRes.status === 404) {
        alert('Bạn không đủ điều kiện đăng ký.');
        return;
      }

      if (!checkRes.ok) {
        // các lỗi khác
        let msg = `⚠️ Lỗi: ${checkRes.status}`;
        try {
          const body = await checkRes.json();
          if (body?.message) msg = `⚠️ ${body.message}`;
        } catch {}
        alert(msg);
        return;
      }

      // ✅ 200 OK → đọc JSON và xử lý eligible
      const checkData = await checkRes.json();

      if (!checkData?.success || !checkData?.eligible) {
        // Phòng trường hợp backend trả 200 nhưng báo đã đăng ký
        if (checkData?.reason === 'already_registered') {
          setAlreadyRegistered(true);
          alert(checkData?.message || '⛔ Bạn đã đăng ký sự kiện này rồi.');
          return;
        }
        alert(checkData?.message || '❌ Bạn không thể đăng ký lễ tốt nghiệp của các đơn vị khác.');
        return;
      }

      // ✅ Hợp lệ → chuyển confirm
      navigate('/events/confirm', { state: { event } });
    } catch (error) {
      console.error('Lỗi khi kiểm tra điều kiện đăng ký:', error);
      alert('⚠️ Đã xảy ra lỗi trong quá trình kiểm tra.');
    } finally {
      setChecking(false);
    }

  };

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
            {event.location_name || '—'}
          </div>
        </div>

        <p className="text-gray-800 mb-4">{event.description}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCheckAndNavigate}
            disabled={checking}
            className={`px-4 py-2 rounded transition text-white ${
              checking ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {checking ? 'Đang kiểm tra...' : 'Đăng ký tham gia'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
