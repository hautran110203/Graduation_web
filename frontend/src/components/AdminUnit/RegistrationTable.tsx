import React from 'react';

interface Registration {
  user_code: string;
  name?: string;
  event_id: number;
  event_name?: string;
  registered_at: string;
  status: string; // 'qualified' | 'unqualified'
  unit_name?: string;
}

interface Props {
  data: Registration[];
}

const RegistrationTable: React.FC<Props> = ({ data }) => {
  return (
    <table className="w-full text-sm border shadow-sm bg-white">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          <th className="p-3 text-left">STT</th>
          <th className="p-3 text-left">Sự kiện</th>
          <th className="p-3 text-left">MSSV</th>
          <th className="p-3 text-left">Họ tên sinh viên</th>
          <th className="p-3 text-left">Ngày đăng ký</th>
          <th className="p-3 text-left">Đơn vị</th>
          <th className="p-3 text-left">Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {data.map((r, index) => (
          <tr key={`${r.user_code}-${r.event_id}`} className="border-t hover:bg-gray-50">
            <td className="p-3">{index + 1}</td>
            <td className="p-3">{r.event_name || `Sự kiện ${r.event_id}`}</td>
            <td className="p-3">{r.user_code}</td>
            <td className="p-3">{r.name || '-'}</td>
            <td className="p-3">{new Date(r.registered_at).toLocaleDateString('vi-VN')}</td>
            <td className="p-3">{r.unit_name || '-'}</td>
            <td className="p-3">
              {r.status === 'qualified' ? (
                <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded">
                  Đủ điều kiện
                </span>
              ) : (
                <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                  Không đủ điều kiện
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RegistrationTable;
