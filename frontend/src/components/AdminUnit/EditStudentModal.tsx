import React, { useState, useEffect } from 'react';
import { type Student } from '../../components/AdminUnit/GraduationTable';

interface Props {
  isOpen: boolean;
  student: Student | null;  
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
}

const EditStudentModal: React.FC<Props> = ({ isOpen, student, onClose, onSave }) => {
  const [formData, setFormData] = useState<Student | null>(null);

  useEffect(() => {
    setFormData(student);
  }, [student]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (formData) {
      onSave({ ...formData, gpa: parseFloat(formData.gpa.toString()) }); // đảm bảo GPA là số
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl">
        <h2 className="text-lg font-semibold mb-4">Chỉnh sửa thông tin sinh viên</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-medium">Họ tên</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              disabled
              className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-medium">Ngành</label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block font-medium">Thời gian đào tạo</label>
            <input
              type="text"
              name="training_time"
              value={formData.training_time}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block font-medium">GPA</label>
            <input
              type="number"
              step="0.01"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block font-medium">Xếp loại</label>
            <input
              type="text"
              name="classification"
              value={formData.classification}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block font-medium">Danh hiệu</label>
            <input
              type="text"
              name="degree_title"
              value={formData.degree_title}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button onClick={onClose} className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
