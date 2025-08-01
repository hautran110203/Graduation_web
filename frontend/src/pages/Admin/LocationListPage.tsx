import React, { useState } from 'react';
import LocationFormPopup from '../../components/admin/LocationFormPopup';
import SeatMapUpload from '../../components/admin/SeatMapUpload';

interface Location {
  id: string;
  name: string;
  address: string;
  seatMapUrl?: string;
}

const LocationListPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: 'Hội trường A', address: 'Khu A, ĐHQG' },
    { id: '2', name: 'Sảnh chính', address: 'Tòa nhà B, CS2' },
  ]);

  const [editing, setEditing] = useState<Location | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleCreateOrUpdate = (data: { name: string; address: string }) => {
    if (editing) {
      setLocations((prev) =>
        prev.map((l) => (l.id === editing.id ? { ...l, ...data } : l))
      );
    } else {
      const newLocation: Location = {
        id: Date.now().toString(),
        name: data.name,
        address: data.address,
      };
      setLocations((prev) => [...prev, newLocation]);
    }

    setEditing(null);
    setShowPopup(false);
  };

  const handleUploadSeatMap = (file: File) => {
    // 📌 Replace with API upload later
    const fakeUrl = URL.createObjectURL(file);
    if (uploadingId) {
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === uploadingId ? { ...loc, seatMapUrl: fakeUrl } : loc
        )
      );
      setUploadingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">📍 Quản lý địa điểm tổ chức</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowPopup(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Thêm địa điểm
        </button>
      </div>

      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Tên địa điểm</th>
            <th className="p-3">Địa chỉ</th>
            <th className="p-3">Sơ đồ</th>
            <th className="p-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.id} className="border-t">
              <td className="p-3">{loc.name}</td>
              <td className="p-3">{loc.address}</td>
              <td className="p-3">
                {loc.seatMapUrl ? (
                  <a
                    href={loc.seatMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Xem sơ đồ
                  </a>
                ) : (
                  <button
                    onClick={() => setUploadingId(loc.id)}
                    className="text-sm bg-gray-200 px-2 py-1 rounded"
                  >
                    🪑 Tải sơ đồ
                  </button>
                )}
              </td>
              <td className="flex justify-baseline py-3">
                <button
                  className="px-3 py-1 text-sm bg-yellow-400 text-white rounded"
                  onClick={() => {
                    setEditing(loc);
                    setShowPopup(true);
                  }}
                >
                  ✏️ Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPopup && (
        <LocationFormPopup
          onClose={() => {
            setShowPopup(false);
            setEditing(null);
          }}
          onSubmit={handleCreateOrUpdate}
          initialData={editing ?? undefined}
        />
      )}

      {uploadingId && (
        <div className="border p-4 rounded bg-white shadow mt-4">
          <h3 className="text-lg font-semibold mb-2">🪑 Tải sơ đồ chỗ ngồi</h3>
          <SeatMapUpload onUpload={handleUploadSeatMap} />
        </div>
      )}
    </div>
  );
};

export default LocationListPage;
