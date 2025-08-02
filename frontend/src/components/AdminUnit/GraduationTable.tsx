import React, { useState } from 'react';
import EditStudentModal from './EditStudentModal';
import TableActionDropdown from './TableActionDropdown';
export interface Student {
  id: number;
  user_code: string;
  full_name: string;
  major: string;
  training_time: string;
  gpa: number;
  classification: string;
  degree_title: string;
  faculty: string;
  graduation_id: number; 
  faculty_code:string
}

interface Props {
  students: Student[];
  onEdit: (updatedStudent: Student) => void; 
  onDelete: (user_codes: string[]) => void;
  onSelect: (user_code: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  selectedUserCodes: string[];
}

const GraduationTable: React.FC<Props> = ({ students, onDelete, onEdit }) => {
  const [selectedUserCodes, setSelectedUserCodes] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelect = (user_code: string, checked: boolean) => {
    setSelectedUserCodes((prev) =>
      checked ? [...prev, user_code] : prev.filter((c) => c !== user_code)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedUserCodes(checked ? students.map((s) => s.user_code) : []);
  };

  const handleEdit = () => {
    const selected = students.find((s) => s.user_code === selectedUserCodes[0]);
    if (selected) {
      setEditingStudent(selected);
      setModalOpen(true);
    }
  };

  const handleSave = (updated: Student) => {
    onEdit(updated);
    setModalOpen(false);
  };

  const allSelected = students.length > 0 && selectedUserCodes.length === students.length;

  return (
    <>
      {/* Action bar */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {selectedUserCodes.length > 0
            ? `${selectedUserCodes.length} mục được chọn`
            : 'Không có mục nào được chọn'}
        </span>
        <TableActionDropdown
          selectedCount={selectedUserCodes.length}
          onEdit={handleEdit}
          onDelete={() => onDelete(selectedUserCodes)}
        />
      </div>

      {/* Responsive Table Wrapper */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm text-left border-separate border-spacing-y-1">
          <thead className="bg-gray-100 text-gray-700 font-medium">
            <tr>
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="p-2 whitespace-nowrap">Mã SV</th>
              <th className="p-2 whitespace-nowrap">Tên SV</th>
              <th className="p-2 whitespace-nowrap">Số quyết định</th>
              <th className="p-2 whitespace-nowrap">Ngành</th>
              <th className="p-2 whitespace-nowrap">Thời gian đào tạo</th>
              <th className="p-2 whitespace-nowrap">GPA</th>
              <th className="p-2 whitespace-nowrap">Xếp loại</th>
              <th className="p-2 whitespace-nowrap">Danh hiệu</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.user_code} className="bg-white shadow-sm hover:shadow-md rounded">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedUserCodes.includes(s.user_code)}
                    onChange={(e) => handleSelect(s.user_code, e.target.checked)}
                  />
                </td>
                <td className="p-2 whitespace-nowrap">{s.user_code}</td>
                <td className="p-2 whitespace-nowrap">{s.full_name}</td>
                <td className="p-2 whitespace-nowrap">{s.graduation_id}</td>
                <td className="p-2 whitespace-nowrap">{s.major}</td>
                <td className="p-2 whitespace-nowrap">{s.training_time}</td>
                <td className="p-2 whitespace-nowrap">{s.gpa.toFixed(2)}</td>
                <td className="p-2 whitespace-nowrap">{s.classification}</td>
                <td className="p-2 whitespace-nowrap">{s.degree_title}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  Không có dữ liệu sinh viên.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup modal */}
      <EditStudentModal
        isOpen={modalOpen}
        student={editingStudent}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
};

export default GraduationTable;
