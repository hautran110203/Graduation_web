import React, { useState, useEffect } from 'react';
import GrantAdminPopup from '../../components/admin/GrantAdminPopup';
import axios from from 'axios';
const API_BASE = 'http://localhost:3001';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  roles: string[];
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [adminRes, userRes, unitRes] = await Promise.all([
        axios.get(`${API_BASE}/admin`),
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/units`),
      ]);

      const userMap = new Map<string, { name: string; email: string }>();
      userRes.data.forEach((u: any) => {
        userMap.set(u.user_code, {
          name: u.full_name,
          email: u.email,
        });
      });

      const unitMap = new Map<string, string>();
      unitRes.data.forEach((u: any) => {
        unitMap.set(u.id, u.name);
      });

      const formattedAccounts: UserAccount[] = adminRes.data.map((a: any) => {
        const user = userMap.get(a.user_code);
        return {
          id: a.user_code,
          name: user?.name || '(Không rõ)',
          email: user?.email || '',
          roles: a.permissions || [],
          unitId: a.unit_code || undefined,
          unitName: a.unit_code ? unitMap.get(a.unit_code) || '(?)' : '-',
        };
      });

      const assignedUserIds = new Set(formattedAccounts.map((a) => a.id));
      const unassignedUsers: UserOption[] = userRes.data
        .filter((u: any) => !assignedUserIds.has(u.user_code))
        .map((u: any) => ({
          id: u.user_code,
          name: u.full_name,
          email: u.email,
        }));

      setAccounts(formattedAccounts);
      setUsers(unassignedUsers);
      setUnits(unitRes.data);
    } catch (err) {
      console.error('❌ Lỗi khi tải dữ liệu:', err);
    }
  };

  const handleSubmit = async (data: { userId: string; roles: string[]; unitId?: string }) => {
    try {
      const payload = {
        user_code: data.userId,
        permissions: data.roles,
        unit_code: data.unitId || null,
      };
      await axios.post(`${API_BASE}/admin`, payload);
      fetchInitialData();
      setShowPopup(false);
    } catch (err) {
      console.error('❌ Lỗi khi cấp quyền:', err);
    }
  };

  const handleDelete = async (userId: string, unitId?: string) => {
    if (confirm('Bạn có chắc chắn muốn gỡ toàn bộ quyền của người dùng này?')) {
      try {
        await axios.delete(`${API_BASE}/admin/${userId}/${unitId || 'null'}`);
        fetchInitialData();
      } catch (err) {
        console.error('❌ Lỗi khi xoá quyền:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">🛡️ Quản lý phân quyền người dùng</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowPopup(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Cấp quyền
        </button>
      </div>

      <table className="w-full border mt-4 text-left bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Tên</th>
            <th className="p-3">Email</th>
            <th className="p-3">Vai trò</th>
            <th className="p-3">Đơn vị</th>
            <th className="p-3 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id} className="border-t">
              <td className="p-3">{acc.name}</td>
              <td className="p-3">{acc.email}</td>
              <td className="p-3">{acc.roles.join(', ')}</td>
              <td className="p-3">{acc.roles.includes('admin_unit') ? acc.unitName : '-'}</td>
              <td className="p-3 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    className="px-2 py-1 text-sm bg-yellow-400 text-white rounded"
                    onClick={() => {
                      setEditing(acc);
                      setShowPopup(true);
                    }}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                    onClick={() => handleDelete(acc.id, acc.unitId)}
                  >
                    🗑️ Gỡ
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPopup && (
        <GrantAdminPopup
          users={users}
          units={units}
          onClose={() => {
            setShowPopup(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
          initialData={
            editing
              ? {
                  userId: editing.id,
                  roles: editing.roles,
                  unitId: editing.unitId,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default AdminUnitAccountPage;
