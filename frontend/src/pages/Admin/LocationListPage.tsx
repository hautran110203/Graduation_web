import React, { useEffect, useState } from 'react';
import LocationFormPopup from '../../components/admin/LocationFormPopup';
import SeatMapUpload from '../../components/admin/SeatMapUpload';

interface Location {
  id: number;
  name: string;
  address: string;
  seatMapUrl?: string;
}

const LocationListPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [editing, setEditing] = useState<Location | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/locations')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: any) => ({
          id: item.location_id,
          name: item.location_name,
          address: item.location_address,
          seatMapUrl: item.location_map || undefined,
        }));
        setLocations(formatted);
      });
  }, []);

  const handleCreateOrUpdate = async (data: { name: string; address: string }) => {
    if (editing) {
      await fetch(`http://localhost:3001/locations/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_name: data.name,
          location_address: data.address,
        }),
      });
    } else {
      const newId = Date.now();
      await fetch('http://localhost:3001/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: newId,
          location_name: data.name,
          location_address: data.address,
        }),
      });
    }

    const res = await fetch('http://localhost:3001/locations');
    const items = await res.json();
    const formatted = items.map((item: any) => ({
      id: item.location_id,
      name: item.location_name,
      address: item.location_address,
      seatMapUrl: item.location_map || undefined,
    }));

    setLocations(formatted);
    setEditing(null);
    setShowPopup(false);
  };

  const handleUploadSeatMap = async (file: File) => {
    if (!uploadingId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('location_id', String(uploadingId));
    const uploadRes = await fetch('http://localhost:3001/locations/seatmap', {
      method: 'POST',
      body: formData,
    });
    const uploadData = await uploadRes.json();
    const url = uploadData.url;

    await fetch(`http://localhost:3001/locations/${uploadingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_map: url }),
    });

    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === uploadingId ? { ...loc, seatMapUrl: url } : loc
      )
    );
    setUploadingId(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
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
                <td className="py-3 text-right">
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
      </div>

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
