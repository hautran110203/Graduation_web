import AdminSidebar from '../components/admin/AdminSidebar';
import React from 'react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full min-h-screen bg-gray-50">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
