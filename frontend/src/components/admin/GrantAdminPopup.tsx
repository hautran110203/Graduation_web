import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Unit {
  id: string;
  name: string;
}

interface Props {
  users: User[];
  units: Unit[];
  onClose: () => void;
  onSubmit: (data: { userId: string; roles: string[]; unitId?: string }) => void;
  initialData?: { userId: string; roles: string[]; unitId?: string };
}

const roleOptions = ['admin_system', 'admin_unit'];

const GrantAdminPopup: React.FC<Props> = ({
  users,
  units,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [userId, setUserId] = useState(initialData?.userId || '');
  const [roles, setRoles] = useState<string[]>(initialData?.roles || []);
  const [unitId, setUnitId] = useState(initialData?.unitId || '');

  // check if "admin_unit" is selected
  const isAdminUnit = roles.includes('admin_unit');

  const handleToggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = () => {
    if (!userId || roles.length === 0) return;
    const data = { userId, roles, unitId: isAdminUnit ? unitId : undefined };
    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[400px] space-y-4 shadow-lg relative">
        <h2 className="text-lg font-semibold">
          {initialData ? '✏️ Cập nhật vai trò' : '➕ Cấp quyền'}
        </h2>

        {/* Người dùng */}
        <div>
          <label className="block text-sm font-medium mb-1">Người dùng</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={!!initialData}
          >
            <option value="">-- Chọn người dùng --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        {/* Vai trò */}
        <div>
          <label className="block text-sm font-medium mb-1">Vai trò</label>
          <div className="space-y-1">
            {roleOptions.map((role) => (
              <label key={role} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => handleToggleRole(role)}
                />
                {role === 'admin_system' ? 'Quản trị hệ thống' : 'Quản trị đơn vị'}
              </label>
            ))}
          </div>
        </div>

        {/* Đơn vị nếu có admin_unit */}
        {isAdminUnit && (
          <div>
            <label className="block text-sm font-medium mb-1">Đơn vị</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              <option value="">-- Chọn đơn vị --</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Huỷ
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit}>
            {initialData ? 'Cập nhật' : 'Cấp quyền'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrantAdminPopup;
