import React, { useState, useRef, useEffect } from 'react';
import EditUserPopup from '../../components/admin/EditUserPopup';
import axios from 'axios';
const API_BASE = 'http://localhost:3001';

interface UserAccount {
  user_code: string;
  name: string;
  email: string;
  role: string;
  unitId?: string;
  unitName?: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface UnitOption {
  id: string;
  name: string;
}

const AdminUnitAccountPage: React.FC = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserAccount; direction: 'asc' | 'desc' } | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [userRes, unitRes] = await Promise.all([
        axios.get(`${API_BASE}/user/getUsers`),
        axios.get(`${API_BASE}/units`),
      ]);

      const unitMap = new Map<string, string>();
      unitRes.data.forEach((u: any) => unitMap.set(u.unit_code, u.name));

      const formattedAccounts: UserAccount[] = userRes.data.users.map((u: any) => ({
        user_code: u.user_code,
        name: u.full_name,
        email: u.email,
        role: u.role || '',
        unitId: u.unit_code || undefined,
        unitName: u.unit_code ? unitMap.get(u.unit_code) || '(?)' : '-',
      }));

      const assignedUserIds = new Set(formattedAccounts.map((a) => a.user_code));
      const unassignedUsers: UserOption[] = userRes.data.users
        .filter((u: any) => !assignedUserIds.has(u.user_code))
        .map((u: any) => ({ id: u.user_code, name: u.full_name, email: u.email }));

      setAccounts(formattedAccounts);
      setUsers(unassignedUsers);
      setUnits(unitRes.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    }
  };

  const handleSubmit = async (data: { userId: string; role: string; unitId?: string }) => {
    try {
      await axios.put(`${API_BASE}/user/update/${data.userId}`, {
        role: data.role,
      });
      fetchInitialData();
      setShowPopup(false);
      alert('✅ Cập nhật vai trò thành công!');
    } catch (err) {
      console.error('[❌] Lỗi khi cập nhật vai trò:', err);
      alert('❌ Đã xảy ra lỗi khi cập nhật vai trò.');
    }
  };

  const handleDelete = async (userId: string) => {
    const confirmed = confirm('Bạn có chắc chắn muốn xoá hoàn toàn người dùng này khỏi hệ thống?');
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE}/user/delete/${userId}`);
      setSelectedAccounts((prev) => prev.filter((id) => id !== userId));
      await fetchInitialData();
    } catch (err) {
      console.error('❌ [Lỗi] Khi xoá người dùng:', err);
    }
  };

  const handleSort = (key: keyof UserAccount) => {
    setSortConfig((prev) =>
      prev?.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }
    );
  };

  const sortedAccounts = [...accounts].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAccounts(e.target.checked ? sortedAccounts.map((a) => a.user_code) : []);
  };

  const handleSelectOne = (userCode: string, isChecked: boolean) => {
    setSelectedAccounts((prev) =>
      isChecked ? [...prev, userCode] : prev.filter((code) => code !== userCode)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">🛡️ Quản lý phân quyền người dùng</h1>
        <div className="relative" ref={actionMenuRef}>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
            onClick={() => setShowActions((prev) => !prev)}
          >
            Actions ▾
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10">
              <button
                disabled={selectedAccounts.length !== 1}
                onClick={() => {
                  const acc = accounts.find((a) => a.user_code === selectedAccounts[0]);
                  if (acc) {
                    setEditing(acc);
                    setShowPopup(true);
                    setShowActions(false);
                  }
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedAccounts.length !== 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
              >
                Chỉnh sửa
              </button>
              <button
                disabled={selectedAccounts.length === 0}
                onClick={() => {
                  selectedAccounts.forEach((id) => handleDelete(id));
                  setShowActions(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${
                  selectedAccounts.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-red-50'
                }`}
              >
                Xoá
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table for desktop */}
      <table className="w-full border mt-4 text-left bg-white shadow rounded hidden sm:table">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={selectedAccounts.length === sortedAccounts.length && sortedAccounts.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            {[
              { label: 'ID', key: 'user_code' },
              { label: 'Tên', key: 'name' },
              { label: 'Email', key: 'email' },
              { label: 'Vai trò', key: 'role' },
              { label: 'Đơn vị', key: 'unitName' },
            ].map(({ label, key }) => (
              <th
                key={key}
                className="p-3 cursor-pointer select-none"
                onClick={() => handleSort(key as keyof UserAccount)}
              >
                {label}{' '}
                <span className={sortConfig?.key === key ? '' : 'text-gray-300'}>
                  {sortConfig?.key === key
                    ? sortConfig.direction === 'asc'
                      ? '▲'
                      : '▼'
                    : '▲▼'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedAccounts.map((acc) => (
            <tr key={acc.user_code} className="border-t hover:bg-gray-50">
              <td className="p-3">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={selectedAccounts.includes(acc.user_code)}
                  onChange={(e) => handleSelectOne(acc.user_code, e.target.checked)}
                />
              </td>
              <td className="p-3">{acc.user_code}</td>
              <td className="p-3">{acc.name}</td>
              <td className="p-3">{acc.email}</td>
              <td className="p-3">{acc.role}</td>
              <td className="p-3">{acc.unitName || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Card view for mobile */}
      <div className="sm:hidden space-y-4 mt-4">
        {sortedAccounts.map((acc) => (
          <div key={acc.user_code} className="border rounded shadow p-4 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{acc.name}</h2>
              <input
                type="checkbox"
                className="form-checkbox"
                checked={selectedAccounts.includes(acc.user_code)}
                onChange={(e) => handleSelectOne(acc.user_code, e.target.checked)}
              />
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <p><strong>ID:</strong> {acc.user_code}</p>
              <p><strong>Email:</strong> {acc.email}</p>
              <p><strong>Vai trò:</strong> {acc.role}</p>
              <p><strong>Đơn vị:</strong> {acc.unitName || '-'}</p>
            </div>
          </div>
        ))}
      </div>

      {showPopup && editing && (
        <EditUserPopup
          onClose={() => {
            setShowPopup(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
          initialData={{
            userId: editing.user_code,
            name: editing.name,
            email: editing.email,
            role: editing.role,
            unitName: editing.unitName,
          }}
        />
      )}
    </div>
  );
};

export default AdminUnitAccountPage;
