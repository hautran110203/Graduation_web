import React, { useEffect, useState } from 'react';
import GraduationUpload from '../../components/AdminUnit/GraduationUpload';
import GraduationFilter from '../../components/AdminUnit/GraduationFilter';
import GraduationTable, { type Student } from '../../components/AdminUnit/GraduationTable';
import { toast } from 'react-toastify';

// 🔎 Bỏ dấu và chuẩn hóa chuỗi để tìm kiếm chính xác hơn
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

const GraduationPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedUserCodes, setSelectedUserCodes] = useState<string[]>([]);
  const [facultyFilter, setFacultyFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [faculties, setFaculties] = useState<{ unit_code: string; unit_name: string }[]>([]); // ✅ đúng kiểu

  const fetchGraduationList = async () => {
    try {
      const res = await fetch('http://localhost:3001/graduation/details');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('❌ Lỗi lấy danh sách sinh viên tốt nghiệp:', err);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await fetch('http://localhost:3001/graduation/faculties');
      const data = await res.json();
      setFaculties(data); // ✅ đúng rồi
    } catch (err) {
      console.error('❌ Lỗi lấy danh sách khoa:', err);
    }
  };

  const handleEdit = async (updatedStudent: Student) => {
    try {
      const res = await fetch(`http://localhost:3001/graduation/students/${updatedStudent.user_code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      });

      if (!res.ok) throw new Error('Cập nhật thất bại');

      const data = await res.json();
      console.log('✅ Đã cập nhật:', data);
      await fetchGraduationList();
      toast.success('✅ Cập nhật thành công!');
    } catch (err) {
      console.error('❌ Cập nhật thất bại:', err);
      toast.error('❌ Cập nhật thất bại!');
    }
  };

  const handleDelete = async (user_codes: string[]) => {
    try {
      await Promise.all(
        user_codes.map((code) => {
          const student = students.find((s) => s.user_code === code);
          if (!student) return;
          return fetch(
            `http://localhost:3001/graduation/students/${code}?graduation_id=${student.graduation_id}`,
            { method: 'DELETE' }
          );
        })
      );
      console.log('🗑️ Đã xóa:', user_codes);
      setSelectedUserCodes([]);
      await fetchGraduationList();
      toast.success(`🗑️ Đã xóa ${user_codes.length} sinh viên`);
    } catch (err) {
      console.error('❌ Xóa thất bại:', err);
      toast.error('❌ Xóa thất bại!');
    }
  };

  const handleSelect = (user_code: string, selected: boolean) => {
    setSelectedUserCodes((prev) =>
      selected ? [...prev, user_code] : prev.filter((code) => code !== user_code)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedUserCodes(selected ? filteredStudents.map((s) => s.user_code) : []);
  };

  useEffect(() => {
    fetchGraduationList();
    fetchFaculties();
  }, []);

 const filteredStudents = Array.isArray(students)
  ? students.filter((s) => {
      const matchFaculty = facultyFilter ? s.faculty_code === facultyFilter : true;
      const normalizedSearch = removeVietnameseTones(searchQuery.trim()).split(' ').filter(Boolean);
      const name = removeVietnameseTones(s.full_name);
      const code = s.user_code.toLowerCase();
      const matchSearch = normalizedSearch.every(keyword =>
        name.includes(keyword) || code.includes(keyword)
      );
      return matchFaculty && matchSearch;
    })
  : [];


  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Danh sách sinh viên tốt nghiệp</h2>

      <GraduationUpload onUploadSuccess={fetchGraduationList} />

      <GraduationFilter
        facultyFilter={facultyFilter}
        setFacultyFilter={setFacultyFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        faculties={faculties} // ✅ đúng type
      />

      <GraduationTable
        students={filteredStudents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        selectedUserCodes={selectedUserCodes}
      />
    </div>
  );
};

export default GraduationPage;
