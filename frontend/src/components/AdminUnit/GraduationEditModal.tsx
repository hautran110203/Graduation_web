// src/components/AdminUnit/GraduationEditModal.tsx
import React, { useState, useEffect } from 'react';
import { type Student } from '../../components/AdminUnit/GraduationTable';

interface Props {
  student: Student | null;
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
}

const GraduationEditModal: React.FC<Props> = ({ student, onClose, onSave }) => {
  const [form, setForm] = useState<Student | null>(student);

  useEffect(() => {
    setForm(student);
  }, [student]);

  if (!form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[500px]">
        <h3 className="text-lg font-bold mb-4">🖊️ Chỉnh sửa sinh viên</h3>
        <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full border p-2 mb-2" placeholder="Tên SV" />
        <input name="major" value={form.major} onChange={handleChange} className="w-full border p-2 mb-2" placeholder="Ngành" />
        <input name="training_time" value={form.training_time} onChange={handleChange} className="w-full border p-2 mb-2" placeholder="Thời gian đào tạo" />
        <input name="gpa" value={form.gpa} onChange={handleChange} type="number" step="0.01" className="w-full border p-2 mb-2" placeholder="GPA" />
        <input name="classification" value={form.classification} onChange={handleChange} className="w-full border p-2 mb-2" placeholder="Xếp loại" />
        <input name="degree_title" value={form.degree_title} onChange={handleChange} className="w-full border p-2 mb-2" placeholder="Danh hiệu" />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Lưu</button>
        </div>
      </div>
    </div>
  );
};

export default GraduationEditModal;
