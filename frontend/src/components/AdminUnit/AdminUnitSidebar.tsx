  // src/components/AdminSidebar.tsx
  import React from 'react';
  import { NavLink } from 'react-router-dom';
  import {
    HiOutlineViewGrid,
    HiOutlineCalendar,
    HiOutlineClipboardList,
    HiOutlineDocumentText,
  } from 'react-icons/hi';

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role;

  const menuItems = [
    {
      label: 'Tổng quan',
      icon: <HiOutlineViewGrid className="w-5 h-5" />,
      path: '/adminunit',
    },
    {
      label: 'Danh sách sự kiện',
      icon: <HiOutlineCalendar className="w-5 h-5" />,
      path: '/adminunit/event',
    },
    
    {
      label: 'Danh sách tốt nghiệp',
      icon: <HiOutlineClipboardList className="w-5 h-5" />,
      path: '/adminunit/graduation',
    },
    {
      label: 'Danh sách đăng kí',
      icon: <HiOutlineDocumentText className="w-5 h-5" />,
      path: '/adminunit/form',
    },
    {
      label: 'Trình chiếu',
      icon: <HiOutlineDocumentText className="w-5 h-5" />,
      path: '/adminunit/ppt',
    },
    ... (role === 'admin'
        ?[{ label: 'Chuyển về hệ thống',icon: <HiOutlineDocumentText className="w-5 h-5" />, path: '/admin' },]
        :[])
  ];

  const AdminSidebar: React.FC = () => {
    return (
      <aside className="w-64 h-screen bg-white shadow-lg fixed left-0 top-0 z-10">
        <div className="text-xl font-bold text-gray-800 px-6 py-4 border-b">TailAdmin</div>
        <div className="mt-4">
          <div className="px-6 py-2">
          <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">Menu</span>
          </div>
          <nav className="flex flex-col gap-1 px-2">
            {menuItems.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                className="flex items-center gap-3 text-base mb-1 px-4 py-2.5 rounded text-gray-700 hover:bg-blue-50  hover:text-blue-600 transition"
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    );
  };

  export default AdminSidebar;
