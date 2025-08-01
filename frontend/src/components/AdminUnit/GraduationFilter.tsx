import React, { useEffect, useState } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

interface Props {
  facultyFilter: string;
  setFacultyFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  faculties: { unit_code: string; unit_name: string }[];

}

const GraduationFilter: React.FC<Props> = ({
  facultyFilter,
  setFacultyFilter,
  searchQuery,
  setSearchQuery,
  faculties
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce tìm kiếm sau 300ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(localSearch.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [localSearch, setSearchQuery]);

  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Dropdown lọc khoa */}
      <select
        value={facultyFilter}
        onChange={(e) => setFacultyFilter(e.target.value)}
        className="border border-gray-300 px-3 py-2 rounded w-60"
      >
        <option value="">Tất cả khoa</option>
      {Array.isArray(faculties) && faculties.map(faculty => (
        <option key={faculty.unit_code} value={faculty.unit_code}>
          Khoa {faculty.unit_name}
        </option>
      ))}
      </select>

      {/* Ô tìm kiếm */}
      <div className="flex items-center border border-gray-300 px-2 py-1 rounded w-64 bg-white">
        <HiOutlineSearch className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc MSSV..."
          className="ml-2 flex-1 outline-none bg-transparent"
        />
      </div>
    </div>
  );
};

export default GraduationFilter;
