import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-white py-4 mt-10">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
      <div>{/* Có thể thêm logo hoặc thông tin khác tại đây sau */}</div>
      <p className="text-sm text-gray-300">
        &copy; {new Date().getFullYear()} Graduation System
      </p>
    </div>
  </footer>
);

export default Footer;
