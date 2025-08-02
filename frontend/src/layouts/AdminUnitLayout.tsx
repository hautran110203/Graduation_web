import AdminSidebar from '../components/AdminUnit/AdminUnitSidebar';
import React, { useState } from 'react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar có props open + setOpen để điều khiển từ ngoài */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content, có margin trái trên desktop, còn mobile là full */}
      <div className="flex-1 p-4 lg:ml-64 min-h-screen bg-gray-50">{children}</div>
    </div>
  );
};

export default AdminLayout;
