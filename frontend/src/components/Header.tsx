import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';// 👈 Điều hướng về trang đăng nhập
  };

  return (
    <header className="flex justify-between items-center px-6 md:px-20 py-3 bg-white shadow-sm relative z-50">
      {/* Logo */}
      <div className="text-blue-600 font-bold text-xl leading-tight">
        CTU <span className="text-gray-800">eGraduate</span>
        <div className="text-xs font-normal text-gray-400">
          Nền tảng tốt nghiệp trực tuyến 
        </div>
      </div>

      {/* Navigation */}

      {(role !== 'admin' && role !== 'admin_unit') && (
        <nav className="space-x-6 text-sm text-gray-700 font-medium hidden md:flex">
          <Link to="/home" className="hover:text-blue-600">TRANG CHỦ</Link>
          <Link to="/events" className="hover:text-blue-600">SỰ KIỆN</Link>
        </nav>
      )}

      

      {/* Avatar & Dropdown */}
      <div className="relative ml-4">
        <img
          src="/avatar1.jpg"
          alt="User avatar"
          className="w-10 h-10 rounded-full cursor-pointer border"
          onClick={() => setShowDropdown(!showDropdown)}
        />
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
            <Link to="/myevent" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              🎓 Sự kiện đã đăng ký
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              🚪 Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
