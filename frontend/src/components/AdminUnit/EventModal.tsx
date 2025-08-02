import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
  event: any;
  onClose: () => void;
  onSave: (event: any) => void;
  locations: { location_id: string; location_name: string }[];
}

const EventModal: React.FC<Props> = ({ event, onClose, onSave, locations }) => {
  const [units, setUnits] = useState<{ unit_code: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: '',
    location_id: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    unit_code: '',
    event_id: null,
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';
  const isAdminUnit = user?.role === 'admin_unit';

  useEffect(() => {
    axios.get('http://localhost:3001/units')
      .then(res => Array.isArray(res.data) && setUnits(res.data))
      .catch(err => {
        console.error('❌ Lỗi lấy đơn vị:', err);
        setUnits([]);
      });
  }, []);

  useEffect(() => {
    if (!event || units.length === 0) return;

    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const dateStr = start.toISOString().split('T')[0];
    const startTime = start.toTimeString().slice(0, 5);
    const endTime = end.toTimeString().slice(0, 5);

    const unit = units.find(u => u.unit_code === event.unit_code);
    const unitName = unit?.name || '';

    let title = event.title || '';
    if (unitName && title.endsWith(unitName)) {
      title = title.slice(0, -unitName.length).trim();
    }

    setForm({
      title,
      location_id: event.location_id || '',
      description: event.description || '',
      date: dateStr,
      start_time: startTime,
      end_time: endTime,
      unit_code: event.unit_code || '',
      event_id: event.event_id || null,
    });
  }, [event, units]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const { title, date, start_time, end_time, location_id, description } = form;

    if (
      !title || !date || !start_time || !end_time || !location_id ||
      (isAdmin && !form.unit_code)
    ) {
      alert('⛔ Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const start = new Date(`${date}T${start_time}`);
    const end = new Date(`${date}T${end_time}`);
    if (start >= end) {
      alert("⛔ Thời gian bắt đầu phải trước thời gian kết thúc!");
      return;
    }

    const unit_code = isAdminUnit ? user.unit_code : form.unit_code;

    const payload: any = {
      title: form.title.trim(),
      location_id,
      description,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      unit_code,
    };

    if (form.event_id) {
      payload.event_id = form.event_id;
    }

    console.log('[Form Submit] Payload gửi đi:', payload);
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-[95%] max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          {form.event_id ? '✏️ Chỉnh sửa sự kiện' : '➕ Tạo sự kiện'}
        </h3>

        <div className="space-y-5">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Tiêu đề"
            className="w-full border px-3 py-2 rounded"
          />

          {isAdmin && (
            <select
              name="unit_code"
              value={form.unit_code}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Chọn đơn vị --</option>
              {units.map(unit => (
                <option key={unit.unit_code} value={unit.unit_code}>
                  {unit.name}
                </option>
              ))}
            </select>
          )}

          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            type="date"
            className="w-full border px-3 py-2 rounded"
          />

          <div>
            <label className="block mb-1 font-medium">🕒 Thời gian</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                name="start_time"
                value={form.start_time}
                onChange={(e) => {
                  setForm({ ...form, start_time: e.target.value });
                  if (!form.end_time) {
                    const [h, m] = e.target.value.split(':').map(Number);
                    const suggested = `${(h + 1).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    setForm(f => ({ ...f, end_time: suggested }));
                  }
                }}
                type="time"
                className="w-full border px-3 py-2 rounded"
              />
              <span className="self-center hidden sm:inline">-</span>
              <input
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                type="time"
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <select
            name="location_id"
            value={form.location_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Chọn địa điểm --</option>
            {locations.map(loc => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.location_name}
              </option>
            ))}
          </select>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Hủy
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
