import React from 'react';
import Chart from 'react-apexcharts';

const RegistrationPieChart: React.FC = () => {
  const options = {
    labels: ['Đủ điều kiện tốt nghiệp','Không đủ điều kiện tốt nghiệp'],
    colors: ['#10B981', '#EF4444'],
    legend: { position: 'bottom'as const },
  };

  const series = [372, 24];

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Biểu đồ trạng thái đăng ký</h3>
      <Chart options={options} series={series} type="pie" width="100%" height={280} />
    </div>
  );
};

export default RegistrationPieChart;
