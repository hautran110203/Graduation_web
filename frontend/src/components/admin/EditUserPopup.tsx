import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSubmit: (data: { userId: string; role: string }) => void;
  initialData: {
    userId: string;
    name: string;
    email: string;
    role: string;
    unitName?: string;
  };
}

const roleOptions = ['admin', 'admin_unit','student'];

const EditUserRolePopup: React.FC<Props> = ({ onClose, onSubmit, initialData }) => {
  const [role, setRole] = useState(initialData.role);

  const handleSubmit = () => {
    if (!role) return;
    onSubmit({ userId: initialData.userId, role });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[450px] space-y-4 shadow-lg relative">
        <h2 className="text-lg font-semibold">✏️ Cập nhật vai trò</h2>

        {/* Thông tin người dùng */}
        <table className="w-full text-sm border">
          <tbody>
            <tr className="border-b">
              <td className="font-medium p-2 w-32">Mã người dùng</td>
              <td className="p-2">{initialData.userId}</td>
            </tr>
            <tr className="border-b">
              <td className="font-medium p-2">Họ tên</td>
              <td className="p-2">{initialData.name}</td>
            </tr>
            <tr className="border-b">
              <td className="font-medium p-2">Email</td>
              <td className="p-2">{initialData.email}</td>
            </tr>
            <tr className="border-b">
              <td className="font-medium p-2">Đơn vị</td>
              <td className="p-2">{initialData.unitName || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* Chọn vai trò */}
        <div>
          <label className="block text-sm font-medium mb-1">Vai trò mới</label>
          <div className="space-y-1">
            {roleOptions.map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                />
                {r === 'admin'
                  ? 'Quản trị hệ thống'
                  : r === 'admin_unit'
                  ? 'Quản trị đơn vị'
                  : 'Sinh viên'}
              </label>
            ))}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-2 pt-3">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Huỷ
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit}>
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserRolePopup;
