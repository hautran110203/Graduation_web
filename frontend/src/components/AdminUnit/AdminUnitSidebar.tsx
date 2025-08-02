import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiMenu,
  HiX,
} from 'react-icons/hi';

interface SidebarProps {
  open: boolean;
  setOpen: (val: boolean) => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    setRole(user?.role || null);
  }, []);

  const menuItems = [
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
    ...(role === 'admin'
      ? [
          {
            label: 'Chuyển về hệ thống',
            icon: <HiOutlineDocumentText className="w-5 h-5" />,
            path: '/admin/acc',
          },
        ]
      : []),
  ];

  const SidebarContent = (
    <div className="h-full bg-white shadow-lg w-64 flex flex-col">
      <div className="text-xl font-bold text-gray-800 px-6 py-4 border-b flex items-center justify-between">
        TailAdmin
        <button className="lg:hidden" onClick={() => setOpen(false)}>
          <HiX className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-2">
          <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">Menu</span>
        </div>
        <nav className="flex flex-col gap-1 px-2 pb-6">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 text-base mb-1 px-4 py-2.5 rounded transition ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`
              }
              onClick={() => setOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Nút mở sidebar trên mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button onClick={() => setOpen(true)} className="bg-white p-3 rounded shadow">
          <HiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar cố định cho desktop */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-64 z-20">
        {SidebarContent}
      </aside>

      {/* Sidebar overlay cho mobile */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40" onClick={() => setOpen(false)}>
          <div
            className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
