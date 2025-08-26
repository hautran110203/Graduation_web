// src/pages/UserProfilePage.tsx
import React, { useEffect, useState } from 'react';

interface User {
  user_code: string;
  full_name: string;
  email?: string;
  unit_name?: string;
  graduation_id?: string;
  role?: string;
}

const UserProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const user_code = user?.user_code;
    const token = localStorage.getItem("token");

    if (!user_code || !token) return;

    fetch(`http://localhost:3001/user/get/${user_code}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(err => console.error("❌ Lỗi lấy thông tin người dùng:", err));
  }, []);

  if (!userData) return <div className="p-6">Đang tải thông tin người dùng...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Thông tin cá nhân</h2>
      <div className="space-y-3 text-gray-800">
        <p><strong>Mã người dùng:</strong> {userData.user_code}</p>
        <p><strong>Họ tên:</strong> {userData.full_name}</p>
        {userData.email && <p><strong>Email:</strong> {userData.email}</p>}
        {userData.unit_name && <p><strong>Đơn vị:</strong> {userData.unit_name}</p>}
        {userData.graduation_id && <p><strong>Số quyết định:</strong> {userData.graduation_id}</p>}
        {userData.role && <p><strong>Vai trò:</strong> {userData.role}</p>}
      </div>
    </div>
  );
};

export default UserProfilePage;
