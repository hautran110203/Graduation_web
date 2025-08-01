import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineLocationMarker,
  HiMenu,
  HiX,
} from 'react-icons/hi';

const user = JSON.parse(localStorage.getItem('user') || '{}');
const role = user?.role;


const menuItems = [
  { label: 'Tổng quan', icon: <HiOutlineHome className="w-5 h-5" />, path: '/admin' },
  { label: 'Đơn vị đào tạo', icon: <HiOutlineOfficeBuilding className="w-5 h-5" />, path: '/admin/unit' },
  { label: 'Tài khoản đơn vị', icon: <HiOutlineUserGroup className="w-5 h-5" />, path: '/admin/acc' },
  { label: 'Sự kiện & thống kê', icon: <HiOutlineChartBar className="w-5 h-5" />, path: '/admin/event-summary' },
  { label: 'Địa điểm tổ chức', icon: <HiOutlineLocationMarker className="w-5 h-5" />, path: '/admin/locations' },
  ... (role === 'admin'
    ?[{ label: 'Chuyển sang đơn vị đào tạo',icon: <HiOutlineLocationMarker className="w-5 h-5" />, path: '/adminunit' },]
    :[])
];

const AdminSidebar: React.FC = () => {
  const [open, setOpen] = useState(false);

  const SidebarContent = (
    <div className="h-full bg-white shadow-lg w-64 flex flex-col">
      <div className="text-xl font-bold text-gray-800 px-6 py-4 border-b flex items-center justify-between">
        TailAdmin
        <button className="lg:hidden" onClick={() => setOpen(false)}>
          <HiX className="w-6 h-6" />
        </button>
      </div>
      <div className="mt-4">
        <div className="px-6 py-2">
          <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">Menu</span>
        </div>
        <nav className="flex flex-col gap-1 px-2">
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
      {/* Toggle button for mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button onClick={() => setOpen(true)} className="bg-white p-2 rounded shadow">
          <HiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar for large screens */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-64 z-10">
        {SidebarContent}
      </aside>

      {/* Sidebar for small screens */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40" onClick={() => setOpen(false)}>
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;