import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSubmit: (data: { name: string; address: string }) => void;
  initialData?: { name: string; address: string };
}

const LocationFormPopup: React.FC<Props> = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');

  const handleSubmit = () => {
    if (name.trim() && address.trim()) {
      onSubmit({ name, address });
      onClose();
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

        <div className="flex justify-end gap-2 pt-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Huỷ</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit}>
            {initialData ? 'Cập nhật' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationFormPopup;
