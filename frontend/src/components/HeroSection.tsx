import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="pt-20 flex items-center bg-[url('/HeroImg.svg')] bg-no-repeat bg-[length:100%] bg-right min-h-[600px]">
    <div className="flex flex-col md:flex-row items-center justify-between w-full px-10 max-w-7xl mx-auto">
        <div className="md:w-1/2">
          <h1 className="text-4xl font-light !text-blue-700">Nền tảng đăng ký tốt nghiệp trực tuyến</h1>
          <h3 className="text-xl font-bold !text-yellow-400 mt-2 mb-4">
            Nhanh chóng, minh bạch và hiệu quả
          </h3>
          <p className="text-gray-600 mb-6">
            Đơn giản hóa quy trình tốt nghiệp, giải pháp công nghệ giúp sinh viên chủ động hoàn tất thủ tục tốt nghiệp.
          </p>
          <Link to="/events">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition">
            Tham gia ngay
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
