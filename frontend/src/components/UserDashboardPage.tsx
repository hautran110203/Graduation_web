import React, { useEffect, useState } from 'react';
import ConfirmPortrait from './ConfimPortrait';

const UserDashboardPage: React.FC = () => {
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [userCode, setUserCode] = useState<string>("");

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/registrations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      const regs = result.data || [];
      console.log("✅ API /registrations trả về:", regs);

      // Lưu user_code từ bản ghi đầu tiên
      if (regs.length > 0 && regs[0].user_code) {
        setUserCode(regs[0].user_code);
      }

      const fullEvents = await Promise.all(
        regs.map(async (reg: any) => {
          if (!reg.unit_code || !reg.event_id) {
            console.warn("Bỏ qua bản ghi thiếu unit_code hoặc event_id", reg);
            return null;
          }
          const evRes = await fetch(`http://localhost:3001/events/${reg.unit_code}/${reg.event_id}`);
          const evData = await evRes.json();
          return { ...reg, ...evData };
        })
      );

      setRegisteredEvents(fullEvents.filter(e => e !== null));
    };
    fetchEvents();
  }, []);

  const handleChangeAvatarClick = (event: any) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCancel = async (eventId: number) => {
    const token = localStorage.getItem("token");

    try {
      const deleteRes = await fetch(`http://localhost:3001/registrations/${userCode}/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!deleteRes.ok) {
        console.warn("❌ Lỗi xoá đăng ký:", await deleteRes.text());
        return;
      }

      // Gọi lại danh sách sau khi xoá
      const res = await fetch("http://localhost:3001/registrations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();

      const regs = result.data || [];
      const fullEvents = await Promise.all(
        regs.map(async (reg: any) => {
          if (!reg.unit_code || !reg.event_id) return null;
          const evRes = await fetch(`http://localhost:3001/events/${reg.unit_code}/${reg.event_id}`);
          const evData = await evRes.json();
          return { ...reg, ...evData };
        })
      );

      setRegisteredEvents(fullEvents.filter(e => e !== null));
    } catch (err) {
      console.error("❌ Lỗi khi huỷ đăng ký:", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleAvatarUpdated = (newAvatar: string) => {
    setRegisteredEvents(prev =>
      prev.map(e =>
        e.event_id === selectedEvent.event_id ? { ...e, avatar_url: newAvatar } : e
      )
    );
    handleCloseModal();
  };

  return (
    <section className="max-w-5xl mx-auto px-5 py-10">
      <h2 className="m-3 text-3xl font-bold mb-6 text-center text-gray-800">Sự kiện đã đăng ký</h2>

      <div className="grid gap-6">
        {registeredEvents
          .filter((event, idx) => {
            const valid = event && typeof event === 'object';
            if (!valid) {
              console.warn(`⚠️ Sự kiện thứ ${idx} không hợp lệ:`, event);
            }
            return valid;
          })
          .map((event, idx) => {
            try {
              return (
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
                          ? `${new Date(event.start_time).toLocaleDateString('vi-VN')} | ${new Date(event.start_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} - ${new Date(event.end_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : 'Thời gian chưa xác định'}
                      </p>
                      <p className="text-sm text-pink-600 font-semibold">{event.location || 'Địa điểm chưa rõ'}</p>
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
              );
            } catch (err) {
              console.error(`❌ Lỗi khi render event thứ ${idx}:`, event, err);
              return (
                <div key={idx} className="text-red-500">
                  ⚠️ Lỗi hiển thị sự kiện. Xem console để biết thêm.
                </div>
              );
            }
          })}
      </div>

      {/* Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-700">
                Cập nhật ảnh chân dung
              </h3>
              <button
                className="text-sm text-gray-600 hover:text-red-600"
                onClick={handleCloseModal}
              >
                Đóng
              </button>
            </div>
            <ConfirmPortrait
              event={selectedEvent}
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
