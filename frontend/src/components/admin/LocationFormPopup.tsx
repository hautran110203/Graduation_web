import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSubmit: (data: { name: string; address: string }) => Promise<void>; // kiểu đúng
  initialData?: {
    id?: number ;
    name: string;
    address: string;
    seatMapUrl?: string;
  };
}

const LocationFormPopup: React.FC<Props> = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [seatMapUrl, setSeatMapUrl] = useState(initialData?.seatMapUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
  if (!name.trim() || !address.trim()) {
    setError('Vui lòng nhập đầy đủ thông tin.');
    return;
  }

  setLoading(true);
  setError('');

  try {
    await onSubmit({ name, address }); // ✅ Gọi đúng prop
  } catch (err) {
    console.error('Lỗi:', err);
    setError('Không thể lưu địa điểm. Vui lòng thử lại.');
  } finally {
    setLoading(false);
  }
};


  const handleSeatMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !initialData?.id) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('location_id', initialData.id.toString());

    try {
      const res = await fetch('http://localhost:3001/locations/seatmap', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setSeatMapUrl(data.url);
      }
    } catch (err) {
      console.error('Lỗi upload sơ đồ:', err);
      alert('Không thể tải sơ đồ. Vui lòng thử lại.');
    }
  };

  const handleDeleteSeatMap = async () => {
  if (!initialData || !initialData.seatMapUrl) return;

  // Tách key từ URL S3 (ví dụ: https://bucket.s3.amazonaws.com/map/abc123.png → map/abc123.png)
  const key = initialData.seatMapUrl.split('.com/')[1];

  const payload = {
    location_id: Number(initialData.id), // nên là number nếu backend yêu cầu
    key: key,
  };

  console.log('[DEBUG] Payload xoá seat map:', payload); // 👈 LOG ở UI

  try {
    const res = await fetch('http://localhost:3001/locations/${location_id}/seatmap', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log('[DEBUG] Kết quả xoá:', result); // 👈 log phản hồi từ backend
  } catch (err) {
    console.error('[ERROR] Xoá seat map thất bại:', err);
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[400px] space-y-4 shadow-lg relative">
        <h2 className="text-lg font-semibold">
          {initialData ? '✏️ Cập nhật địa điểm' : '➕ Thêm địa điểm'}
        </h2>

        <div>
          <label className="block text-sm font-medium mb-1">Tên địa điểm</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Địa chỉ</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {initialData?.id && (
          <div>
            <label className="block text-sm font-medium mb-1">Sơ đồ chỗ ngồi</label>
            <input type="file" accept="image/*" onChange={handleSeatMapUpload} />
            {seatMapUrl && (
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={seatMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Xem sơ đồ hiện tại
                </a>
                <button
                  className="text-red-500 text-sm underline"
                  onClick={handleDeleteSeatMap}
                >
                  🗑 Xoá sơ đồ
                </button>
              </div>
            )}
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose} disabled={loading}>
            Huỷ
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationFormPopup;
