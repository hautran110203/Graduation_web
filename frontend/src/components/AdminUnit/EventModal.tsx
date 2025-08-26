
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
  event: any;
  onClose: () => void;
  onSave: (data: any) => void; // có thể là JSON hoặc FormData
  locations: { location_id: string; location_name: string }[];
}

const MAX_SLIDE_MB = 20;
const ACCEPT_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

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
    event_id: null as number | null,
    slide_url: '' as string, // hiển thị slide hiện tại (nếu có)
  });

  // file slide người dùng chọn
  const [slideFile, setSlideFile] = useState<File | null>(null);
  const [slideError, setSlideError] = useState<string>('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';
  const isAdminUnit = user?.role === 'admin_unit';

  useEffect(() => {
    axios
      .get('http://localhost:3001/units')
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
      slide_url: event.slide_template_url || '', // <- thêm
    });
    // reset file khi mở modal chỉnh sửa
    setSlideFile(null);
    setSlideError('');
  }, [event, units]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // chọn file ảnh nền slide
  const handleSlideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlideError('');
    const file = e.target.files?.[0];
    if (!file) {
      setSlideFile(null);
      return;
    }
    if (!ACCEPT_MIME.includes(file.type)) {
      setSlideError('Định dạng không hợp lệ. Chỉ chấp nhận PNG/JPG/WEBP.');
      setSlideFile(null);
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SLIDE_MB) {
      setSlideError(`Kích thước tối đa ${MAX_SLIDE_MB}MB.`);
      setSlideFile(null);
      return;
    }
    setSlideFile(file);
  };

  const handleSubmit = () => {
    const { title, date, start_time, end_time, location_id, description } = form;

    if (
      !title ||
      !date ||
      !start_time ||
      !end_time ||
      !location_id ||
      (isAdmin && !form.unit_code)
    ) {
      alert('⛔ Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const start = new Date(`${date}T${start_time}`);
    const end = new Date(`${date}T${end_time}`);
    if (start >= end) {
      alert('⛔ Thời gian bắt đầu phải trước thời gian kết thúc!');
      return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // so sánh chỉ ngày
    if (start < now) {
      alert('⛔ Không thể tạo sự kiện cho ngày đã qua.');
      return;
    }

    const diffDays = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 10) {
      alert('⛔ Bạn chỉ có thể tạo sự kiện trước ít nhất 10 ngày.');
      return;
    }

    if (slideError) {
      alert('⛔ File slide không hợp lệ.');
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
    if (form.event_id) payload.event_id = form.event_id;

    // Nếu có file ảnh -> gửi FormData (multipart)
    if (slideFile) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append('slide', slideFile); // 👈 field name backend dùng multer.single('slide')
      console.log('[Form Submit] Gửi FormData + slide:', slideFile.name);
      onSave(fd);
    } else {
      // Không có file -> gửi JSON như cũ
      console.log('[Form Submit] Payload JSON:', payload);
      onSave(payload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-[95%] max-w-md max-h-[100vh] overflow-y-auto shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          {form.event_id ? '✏️ Chỉnh sửa sự kiện' : '➕ Tạo sự kiện'}
        </h3>

        <div className="space-y-5">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Tiêu đề"
            className="w-full border px-3 py-2 rounded "
          />

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
                    const suggested = `${(h + 1).toString().padStart(2, '0')}:${m
                      .toString()
                      .padStart(2, '0')}`;
                    setForm((f) => ({ ...f, end_time: suggested }));
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
            {locations.map((loc) => (
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

          {/* 📎 Ảnh nền slide */}
          <div>
            <label className="block mb-1 font-medium">📎 Ảnh nền slide (PNG/JPG/WEBP)</label>

            {/* Slide hiện tại (khi edit) */}
            {form.slide_url && !slideFile && (
              <div className="text-sm mb-2">
                Hiện tại:&nbsp;
                <a
                  href={form.slide_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {form.slide_url}
                </a>
              </div>
            )}

            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleSlideChange}
              className="w-full border px-3 py-2 rounded"
            />

            {/* Hiển thị file đã chọn + preview nhỏ */}
            {slideFile && (
              <div className="mt-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Đã chọn:</span>
                  <span className="font-medium">{slideFile.name}</span>
                  <button
                    type="button"
                    className="ml-auto text-red-600 hover:underline"
                    onClick={() => {
                      setSlideFile(null);
                      setSlideError('');
                    }}
                  >
                    Xóa
                  </button>
                </div>
                <img
                  src={URL.createObjectURL(slideFile)}
                  alt="Slide preview"
                  className="mt-2 w-40 h-auto rounded border"
                />
              </div>
            )}

            {slideError && <div className="text-sm text-red-600 mt-1">{slideError}</div>}
            <div className="text-xs text-gray-500 mt-1">
              Tối đa {MAX_SLIDE_MB}MB. Hỗ trợ: PNG, JPG, WEBP.
            </div>
          </div>
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

