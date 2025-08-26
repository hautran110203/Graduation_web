import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { List, X } from '@phosphor-icons/react';

const Header: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Tự động đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center px-4 md:px-20 py-3 bg-white shadow-sm relative z-50">
      {/* Logo */}
      <div className="text-blue-600 font-bold text-xl leading-tight">
        CTU <span className="text-gray-800">eGraduate</span>
        <div className="text-xs font-normal text-gray-400">Nền tảng tốt nghiệp trực tuyến</div>
      </div>

      {/* Hamburger menu for mobile */}
      {(role !== 'admin' && role !== 'admin_unit') && (
        <div className="md:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-gray-700"
          >
            {showMobileMenu ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      )}

      {/* Navigation desktop */}
      {(role !== 'admin' && role !== 'admin_unit') && (
        <nav className="space-x-6 text-sm text-gray-700 font-medium hidden md:flex">
          <Link to="/home" className="hover:text-blue-600">TRANG CHỦ</Link>
          <Link to="/events" className="hover:text-blue-600">SỰ KIỆN</Link>
        </nav>
      )}

      {/* Avatar + dropdown */}
      <div className="relative ml-4" ref={dropdownRef}>
        <img
          src="/avatar1.jpg"
          alt="User avatar"
          className="w-10 h-10 rounded-full cursor-pointer border"
          onClick={() => setShowDropdown(!showDropdown)}
        />
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
            <Link
              to="/profile"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              👤 Thông tin người dùng
            </Link>
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

      {/* Mobile menu nav */}
{showMobileMenu && (role !== 'admin' && role !== 'admin_unit') && (
  <div className="absolute top-full left-0 w-full bg-white border-t md:hidden shadow-md py-2 px-4 text-sm font-medium text-gray-700 z-[999]">
    <Link
      to="/home"
      className="block py-2 hover:text-blue-600"
      onClick={() => {
        setTimeout(() => setShowMobileMenu(false), 100);
      }}
    >
      TRANG CHỦ
    </Link>
    <Link
      to="/events"
      className="block py-2 hover:text-blue-600"
      onClick={() => {
        setTimeout(() => setShowMobileMenu(false), 100);
      }}
    >
      SỰ KIỆN
    </Link>
  </div>
)}


    </header>
  );
};

export default Header;
