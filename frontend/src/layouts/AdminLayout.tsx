import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { HiMenu } from 'react-icons/hi';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Nút mở sidebar trên mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button onClick={() => setSidebarOpen(true)} className="bg-white p-3 rounded shadow">
          <HiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Nội dung chính */}
      <div className="w-full min-h-screen bg-gray-50 p-6 lg:ml-64">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
