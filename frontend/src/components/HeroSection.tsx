import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="pt-16 md:pt-20 flex items-center 
      md:bg-[url('/HeroImg.svg')] md:bg-no-repeat md:bg-right-top md:bg-cover 
      min-h-[500px] md:min-h-[600px] bg-white">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full px-6 md:px-10 max-w-7xl mx-auto">
        <div className="w-full md:w-1/2 text-left">
          <h1 className="text-3xl md:text-4xl font-light text-blue-700">
            Nền tảng đăng ký tốt nghiệp trực tuyến
          </h1>
          <h3 className="text-lg md:text-xl font-bold text-yellow-400 mt-3 mb-4">
            Nhanh chóng, minh bạch và hiệu quả
          </h3>
          <p className="text-gray-700 mb-6 text-base md:text-lg">
            Đơn giản hóa quy trình tốt nghiệp, giải pháp công nghệ giúp sinh viên chủ động hoàn tất thủ tục tốt nghiệp.
          </p>
          <Link to="/events">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition w-full sm:w-auto">
              Tham gia ngay
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
