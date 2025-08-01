import React from 'react';
import  type {Student}  from '../AdminUnit/GraduationTable';


interface Props {
  students: Student[];
  eventName?: string;
  unitCode?: string;
  onClose: () => void;
}

const StudentListPopup: React.FC<Props> = ({ students, eventName, unitCode, onClose }) => {
  const handleDownload = () => {
    const csvContent = [
      ['STT', 'Họ tên', 'Mã số', 'Ngành học', 'GPA', 'Xếp loại', 'Danh hiệu'],
      ...students.map((s, i) => [
        i + 1,
        s.full_name,
        s.user_code,
        s.major,
        s.gpa,
        s.classification,
        s.degree_title,
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'danh_sach_sinh_vien.csv';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📋 Danh sách sinh viên</h2>

        {/* Thông tin sự kiện */}
        <div className="mb-4 text-sm text-gray-700 space-y-1">
          <div><strong>Sự kiện:</strong> {eventName || 'Không rõ'}</div>
          <div><strong>Đơn vị:</strong> {unitCode || 'Không rõ'}</div>
        </div>

        {/* Bảng danh sách */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">#</th>
                <th className="px-3 py-2 border">Họ tên</th>
                <th className="px-3 py-2 border">Mã số</th>
                <th className="px-3 py-2 border">Ngành học</th>
                <th className="px-3 py-2 border">GPA</th>
                <th className="px-3 py-2 border">Xếp loại</th>
                <th className="px-3 py-2 border">Danh hiệu</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-1">{i + 1}</td>
                  <td className="px-3 py-1">{s.full_name}</td>
                  <td className="px-3 py-1">{s.user_code}</td>
                  <td className="px-3 py-1">{s.major}</td>
                  <td className="px-3 py-1">{s.gpa}</td>
                  <td className="px-3 py-1">{s.classification}</td>
                  <td className="px-3 py-1">{s.degree_title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleDownload}
          >
            ⬇️ Tải xuống
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentListPopup;
