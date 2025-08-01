import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section  id="about" className="bg-[#ffffff] py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* Hình ảnh và background trang trí */}
        <div className="relative w-full md:w-1/2 flex justify-center items-center">
          {/* Backdrop oval shape */}
          

          {/* Ảnh chính */}
          <img
            src="/AboutImg.svg"
            alt="People working"
            className="relative scale-200"
          />

        
          
        </div>

        {/* Nội dung văn bản */}
        <div className="w-full md:w-1/2">
          <div className="text-blue-600 font-bold leading-tight">
        <h2>CTU <span className="text-gray-800">eGraduate</span></h2>
       
      </div>
          <p className="text-gray-700 mb-4">
            Hệ thống đăng ký tốt nghiệp là nền tảng trực tuyến hỗ trợ sinh viên đăng ký xét tốt nghiệp, theo dõi tiến độ xử lý hồ sơ và nhận thông báo từ nhà trường. 
          </p>
          <p className="text-gray-700 mb-6">
           Sinh viên có thể dễ dàng kiểm tra điều kiện tốt nghiệp, giảm bớt thủ tục giấy tờ và tiết kiệm thời gian. Hệ thống giúp tăng tính minh bạch và hiệu quả trong quản lý đào tạo.
          </p>
          
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
