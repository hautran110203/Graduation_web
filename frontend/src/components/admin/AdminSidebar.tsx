import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineLocationMarker,
  HiX,
} from 'react-icons/hi';

interface SidebarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    setRole(user?.role || null);
  }, []);

  const menuItems = [
    { label: 'Đơn vị đào tạo', icon: <HiOutlineOfficeBuilding className="w-5 h-5" />, path: '/admin/unit' },
    { label: 'Tài khoản đơn vị', icon: <HiOutlineUserGroup className="w-5 h-5" />, path: '/admin/acc' },
    { label: 'Sự kiện & thống kê', icon: <HiOutlineChartBar className="w-5 h-5" />, path: '/admin/event-summary' },
    { label: 'Địa điểm tổ chức', icon: <HiOutlineLocationMarker className="w-5 h-5" />, path: '/admin/locations' },
    ...(role === 'admin'
      ? [
          {
            label: 'Chuyển sang đơn vị đào tạo',
            icon: <HiOutlineLocationMarker className="w-5 h-5" />,
            path: '/adminunit/event',
          },
        ]
      : []),
  ];

  const SidebarContent = (
    <div className="h-full bg-white shadow-lg w-64 flex flex-col">
      <div className="text-xl font-bold text-gray-800 px-6 py-4 border-b flex items-center justify-between">
        TailAdmin
        {/* Nút đóng chỉ hiển thị khi mobile */}
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
              onClick={() => setOpen(false)} // đóng menu khi chọn mục
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
