import React, { useEffect, useState } from 'react';
import ConfirmPortrait from './ConfimPortrait';

interface Registration {
  user_code: string;
  unit_code: string;
  event_id: number;
  avatar_url?: string;
  [k: string]: any;
}

interface EventDetails {
  event_id: number;
  unit_code: string;
  title: string;
  start_time: string;
  end_time: string;
  location_id: string;
  location_name: string; 
  description: string;
  attachments?: { name: string; url: string }[];
  images?: string[];
}

type RegisteredEvent = Registration & EventDetails;

type ConfirmPortraitEvent = {
  id: number;
  date: string;     
  location: string;
  title: string;    
};

const toConfirmPortraitEvent = (e: RegisteredEvent): ConfirmPortraitEvent => ({
  id: e.event_id,
  date: new Date(e.start_time).toLocaleDateString('vi-VN'), 
  location: e.location_name ?? '',
  title: e.title ?? 'Không có tiêu đề',  
});


const UserDashboardPage: React.FC = () => {
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<RegisteredEvent | null>(null);
  const [userCode, setUserCode] = useState<string>('');

  const token = localStorage.getItem('token');

  // Helper: fetch danh sách registration + merge chi tiết event
  const fetchRegisteredEvents = async () => {
    const res = await fetch('http://localhost:3001/registrations', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const result = await res.json();
    const regs: Registration[] = result.data || [];

    if (regs.length > 0 && regs[0].user_code) {
      setUserCode(regs[0].user_code);
    }

    const fullEvents = await Promise.all(
      regs.map(async (reg) => {
        if (!reg.unit_code || !reg.event_id) {
          console.warn('Bỏ qua bản ghi thiếu unit_code hoặc event_id', reg);
          return null;
        }
        const evRes = await fetch(
          `http://localhost:3001/events/${reg.unit_code}/${reg.event_id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        );
        const evRaw = await evRes.json();

        // Map đảm bảo có location_name (fallback từ field cũ 'location' nếu backend chưa cập nhật)
        const ev: EventDetails = {
          event_id: evRaw.event_id ?? reg.event_id,
          unit_code: evRaw.unit_code ?? reg.unit_code,
          title: evRaw.title ?? '',
          start_time: evRaw.start_time ?? '',
          end_time: evRaw.end_time ?? '',
          location_id: evRaw.location_id ?? '',
          location_name: evRaw.location_name ?? evRaw.location ?? '', // ⬅️ dùng tên
          description: evRaw.description ?? '',
          attachments: evRaw.attachments,
          images: evRaw.images,
        };

        return { ...reg, ...ev } as RegisteredEvent;
      })
    );

    setRegisteredEvents(fullEvents.filter((e): e is RegisteredEvent => e !== null));
  };

  useEffect(() => {
    fetchRegisteredEvents().catch((err) => console.error('❌ Lỗi lấy sự kiện:', err));
  }, []);

  const handleChangeAvatarClick = (event: RegisteredEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCancel = async (eventId: number) => {
    if (!userCode) return;
    try {
      const deleteRes = await fetch(`http://localhost:3001/registrations/${userCode}/${eventId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!deleteRes.ok) {
        console.warn('❌ Lỗi xoá đăng ký:', await deleteRes.text());
        return;
      }
      await fetchRegisteredEvents(); 
    } catch (err) {
      console.error('❌ Lỗi khi huỷ đăng ký:', err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleAvatarUpdated = (newAvatar: string) => {
    if (!selectedEvent) return;
    setRegisteredEvents((prev) =>
      prev.map((e) => (e.event_id === selectedEvent.event_id ? { ...e, avatar_url: newAvatar } : e))
    );
    handleCloseModal();
  };

  return (
    <section className="max-w-5xl mx-auto px-5 py-10">
      <h2 className="m-3 text-3xl font-bold mb-6 text-center text-gray-800">Sự kiện đã đăng ký</h2>

      <div className="grid gap-6">
        {registeredEvents.length === 0 && (
          <div className="text-center text-gray-500">Bạn chưa đăng ký sự kiện nào.</div>
        )}

        {registeredEvents.map((event, idx) => (
          <div
            key={event.event_id ?? idx}
            className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              {event.avatar_url ? (
                <img
                  src={event.avatar_url}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  ?
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  {event.title || 'Không có tiêu đề'}
                </h4>
                <p className="text-sm text-gray-600">
                  {event.start_time && event.end_time
                    ? `${new Date(event.start_time).toLocaleDateString('vi-VN')} | ${new Date(
                        event.start_time
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} - ${new Date(event.end_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'Thời gian chưa xác định'}
                </p>
                {/* ⬇️ dùng location_name thay cho location */}
                <p className="text-sm text-pink-600 font-semibold">
                  {event.location_name || 'Địa điểm chưa rõ'}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <button
                onClick={() => handleChangeAvatarClick(event)}
                className="px-3 py-2 text-sm font-semibold text-blue-700 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition min-w-[130px] text-center"
              >
                <span className="whitespace-nowrap">Cập nhật ảnh</span>
              </button>
              <button
                onClick={() => handleCancel(event.event_id)}
                className="px-3 py-2 text-sm font-semibold text-red-700 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition min-w-[130px] text-center"
              >
                <span className="whitespace-nowrap">Huỷ đăng ký</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-700">Cập nhật ảnh chân dung</h3>
              <button className="text-sm text-gray-600 hover:text-red-600" onClick={handleCloseModal}>
                Đóng
              </button>
            </div>
            <ConfirmPortrait
              event={toConfirmPortraitEvent(selectedEvent)}
              onCompleted={handleAvatarUpdated}
              hideEventInfo={true}
              mode="update"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default UserDashboardPage;
