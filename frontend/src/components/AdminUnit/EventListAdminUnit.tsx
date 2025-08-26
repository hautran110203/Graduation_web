

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventModal from './EventModal';

const BASE_URL = 'http://localhost:3001';

interface EventItem {
  event_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  unit_code: string;
  location_id?: string;
  location_name?: string;
  slide_template_url?: string;
}

interface Unit {
  unit_code: string;
  name: string;
}

interface Location {
  location_id: string;
  location_name: string;
}

const EventListAdminUnit: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filterUnit, setFilterUnit] = useState<string>('');

  const token = localStorage.getItem('token') || '';

  const fetchEvents = async () => {
    try {
      const [eventRes, locationRes] = await Promise.all([
        axios.get(`${BASE_URL}/events`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/locations`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (Array.isArray(eventRes.data) && Array.isArray(locationRes.data)) {
        const locationMap = Object.fromEntries(
          locationRes.data.map((loc: Location) => [loc.location_id, loc.location_name])
        );
        setLocations(locationRes.data);

        const enrichedEvents: EventItem[] = eventRes.data.map((e: any) => ({
          ...e,
          location_name: locationMap[e.location_id] || 'Không rõ',
        }));

        const sorted = enrichedEvents.sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        setEvents(sorted);
        setFilteredEvents(sorted);
      }
    } catch (err) {
      console.error('❌ Lỗi khi tải sự kiện hoặc địa điểm:', err);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/units`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) setUnits(res.data);
    } catch (err) {
      console.error('❌ Lỗi lấy đơn vị:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUnits();
  }, []);

  useEffect(() => {
    const filtered = filterUnit ? events.filter((e) => e.unit_code === filterUnit) : events;
    setFilteredEvents(filtered);
  }, [filterUnit, events]);

  const handleCreate = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: EventItem) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  
  // const handleDelete: (id: number) => Promise<void> = async (id: number) => {
  //   try {
  //     const ev = events.find((e) => e.event_id === id);
  //     if (!ev) return;

  //     await axios.delete(`${BASE_URL}/events/${id}?unit_code=${ev.unit_code}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setEvents((prev) => prev.filter((e) => e.event_id !== id));
  //     setFilteredEvents((prev) => prev.filter((e) => e.event_id !== id));
  //   } catch (err) {
  //     console.error('❌ Lỗi xoá sự kiện:', err);
  //     alert('❌ Không thể xoá sự kiện.');
  //   }
  // };

  const handleDelete: (id: number) => Promise<void> = async (id: number) => {
    const ev = events.find((e) => e.event_id === id);
    if (!ev) return;

    // helper xoá (dùng chung cho mọi nhánh)
    const doDelete = async (opts?: { confirm?: boolean }) => {
      await axios.delete(`${BASE_URL}/events/${id}`, {
        params: {
          unit_code: ev.unit_code,
          ...(opts?.confirm ? { confirm: true } : {}),
        },
        headers: { Authorization: `Bearer ${token}` },
      });
    };

    try {
      // 1) Preflight: thử gọi nếu backend có
      let registrationCount = 0;
      let requiresConfirm = false;

      try {
        const checkRes = await axios.get(`${BASE_URL}/events/${id}/delete-check`, {
          params: { unit_code: ev.unit_code },
          headers: { Authorization: `Bearer ${token}` },
        });

        const { canDelete = false, message = '' } = checkRes.data || {};
        registrationCount = Number(checkRes.data?.registrationCount || 0);
        requiresConfirm = Boolean(checkRes.data?.requiresConfirm);

        if (!canDelete) {
          alert(message || 'Không thể xoá sự kiện.');
          return;
        }
      } catch (_preflightErr) {
        // Không có endpoint preflight -> fallback
        registrationCount = 0;
        requiresConfirm = false;
      }

      // 2) Xác nhận lần 1
      const ok1 = window.confirm(
        registrationCount > 0
          ? `Sự kiện "${ev.title}" có ${registrationCount} đăng ký.\n` +
            `Bạn có chắc chắn muốn xoá sự kiện này?`
          : `Bạn có chắc chắn muốn xoá sự kiện "${ev.title}"?`
      );
      if (!ok1) return;

      // 3) Nếu CÓ đăng ký -> Xác nhận lần 2 (bổ sung)
      if (registrationCount > 0) {
        const ok2 = window.confirm(
          `XÁC NHẬN LẦN CUỐI:\n` +
          `Hệ thống sẽ XOÁ VĨNH VIỄN sự kiện "${ev.title}" và ${registrationCount} đăng ký liên quan.\n` +
          `Thao tác này không thể hoàn tác. Tiếp tục?`
        );
        if (!ok2) return;
      }

      // 4) Thực hiện xoá: nếu có đăng ký, gửi confirm=true
      try {
        await doDelete({ confirm: requiresConfirm && registrationCount > 0 });
      } catch (err1: any) {
        // Trường hợp BE báo cần confirm (409) khi không có preflight
        const needConfirm =
          err1?.response?.status === 409 ||
          err1?.response?.data?.requiresConfirm;

        if (needConfirm) {
          // Nhắc lại 2 bước xác nhận khi BE yêu cầu
          const okA = window.confirm(
            `Sự kiện "${ev.title}" có đăng ký. Bạn chắc chắn muốn xoá không?`
          );
          if (!okA) return;
          const okB = window.confirm(
            `XÁC NHẬN LẦN CUỐI:\n` +
            `Sẽ xoá VĨNH VIỄN sự kiện và toàn bộ registrations liên quan. Tiếp tục?`
          );
          if (!okB) return;

          await doDelete({ confirm: true });
        } else {
          throw err1;
        }
      }

      // 5) Reload danh sách
      await fetchEvents();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Không thể xoá sự kiện.';
      alert(`❌ ${msg}`);
      await fetchEvents();
    }
  };



  // ===== helper để đọc/ghi field cho JSON hoặc FormData =====
  const isFD = (d: any): d is FormData => typeof FormData !== 'undefined' && d instanceof FormData;
  const getField = (d: any, k: string) => (isFD(d) ? (d.get(k) as string | null) ?? '' : d[k] ?? '');
  const setField = (d: any, k: string, v: any) =>
    isFD(d) ? d.set(k, String(v)) : (d[k] = v);

  const handleSave = async (data: any) => {
    try {
      // Lấy các field cần thiết dù là JSON hay FormData
      const event_id_raw = getField(data, 'event_id');
      const event_id = event_id_raw ? Number(event_id_raw) : undefined;
      const unit_code = getField(data, 'unit_code');
      const location_id = getField(data, 'location_id');
      const rawTitle = getField(data, 'title');

      if (!unit_code || !location_id || !rawTitle) {
        alert('Thiếu đơn vị, địa điểm hoặc tiêu đề.');
        return;
      }

      // Tìm tên đơn vị mới
      const newUnit = units.find((u) => u.unit_code === unit_code);
      if (!newUnit) {
        alert('Không tìm thấy đơn vị tương ứng.');
        return;
      }

      // Chuẩn hóa tiêu đề (bỏ tên đơn vị cũ nếu update)
      let newTitle = rawTitle.trim();
      if (event_id) {
        const oldEvent = events.find((e) => e.event_id === event_id);
        if (oldEvent) {
          const oldUnit = units.find((u) => u.unit_code === oldEvent.unit_code);
          if (oldUnit && newTitle.endsWith(oldUnit.name)) {
            newTitle = newTitle.slice(0, -oldUnit.name.length).trim();
          }
        }
      }
      const fullTitle = `${newTitle} ${newUnit.name}`.trim();
      setField(data, 'title', fullTitle); // áp lại cho cả JSON lẫn FormData

      // Quyết định tạo mới hay cập nhật
      if (event_id) {
        // UPDATE
        if (isFD(data)) {
          await axios.put(`${BASE_URL}/events/${event_id}`, data, {
            headers: { Authorization: `Bearer ${token}` }, // KHÔNG set Content-Type, để axios tự sinh boundary
          });
        } else {
          await axios.put(`${BASE_URL}/events/${event_id}`, data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } else {
        // CREATE
        if (isFD(data)) {
          await axios.post(`${BASE_URL}/events`, data, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await axios.post(`${BASE_URL}/events`, data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }
      }

      // Reload danh sách để đồng bộ (vì backend có thể sinh URL slide, location_name…)
      await fetchEvents();
      setIsModalOpen(false);
    } catch (err) {
      console.error('❌ Lỗi lưu sự kiện:', err);
      alert('❌ Không thể lưu sự kiện.');
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');
  const formatTime = (start: string, end: string) =>
    `${new Date(start).toTimeString().slice(0, 5)} - ${new Date(end)
      .toTimeString()
      .slice(0, 5)}`;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📅 Danh sách sự kiện</h2>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Tạo sự kiện
        </button>
      </div>

      <div className="mb-6">
        <select
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Tất cả đơn vị --</option>
          {units.map((unit) => (
            <option key={unit.unit_code} value={unit.unit_code}>
              {unit.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <div key={event.event_id} className="p-4 border rounded shadow-sm bg-white space-y-1">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p>
              <strong>📅</strong> {formatDate(event.start_time)} | <strong>⏰</strong>{' '}
              {formatTime(event.start_time, event.end_time)}
            </p>
            <p>
              <strong>📍</strong> {event.location_name || 'Không rõ'}
            </p>
            {event.slide_template_url && (
              <p className="text-sm">
                <strong>🖼 Nền slide:</strong>{' '}
                <a
                  href={event.slide_template_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  Xem ảnh
                </a>
              </p>
            )}
            <p>{event.description}</p>
            <div className="flex gap-4 mt-2">
              <button onClick={() => handleEdit(event)} className="text-blue-600 hover:underline">
                Chỉnh sửa
              </button>
              <button onClick={() => handleDelete(event.event_id)} className="text-red-600 hover:underline">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          locations={locations}
        />
      )}
    </div>
  );
};

export default EventListAdminUnit;
