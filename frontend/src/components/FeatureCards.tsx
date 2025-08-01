import React from 'react';

const features = [
  {
    title: 'Đăng Ký Nhanh Chóng',
    description:
      'Giao diện thân thiện giúp bạn hoàn tất đăng ký tốt nghiệp chỉ trong vài phút.',
  },
  {
    title: 'Theo Dõi Trạng Thái',
    description:
      'Luôn biết đơn đăng ký của bạn đang ở đâu trong quy trình xử lý.',
  },
  {
    title: 'Quản Lý Cá Nhân Hóa',
    description:
      'Theo dõi tiến trình tốt nghiệp cá nhân, xem trạng thái hồ sơ, và nhận thông báo phù hợp với từng sinh viên.',
  },
];

const FeatureCards: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-2xl font-semibold text-center mb-2">Những Tính Năng Nổi Bật</h3>
        <p className="text-center text-gray-500 mb-10">
          Trải Nghiệm Đăng Ký Tốt Nghiệp Dễ Dàng Chưa Từng Có
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <button className="text-sm text-blue-600 hover:underline">
                Tìm hiểu thêm
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
