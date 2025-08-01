import React from 'react';

interface EventFilterProps {
  searchKeyword: string;
  selectedLocation: string;
  selectedDate: string;
  locations: string[];
  onKeywordChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onResetFilters?: () => void;
}

const EventFilter: React.FC<EventFilterProps> = ({
  searchKeyword,
  selectedLocation,
  selectedDate,
  locations,
  onKeywordChange,
  onLocationChange,
  onDateChange,
  onResetFilters
}) => {
  const canReset = !!(searchKeyword || selectedLocation || selectedDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Tìm kiếm */}
      <input
        type="text"
        placeholder="🔍 Tìm tiêu đề / mô tả / địa điểm..."
        className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        value={searchKeyword}
        onChange={(e) => onKeywordChange(e.target.value.trimStart())}
      />

      {/* Chọn địa điểm */}
      <select
        className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        value={selectedLocation}
        onChange={(e) => onLocationChange(e.target.value)}
      >
        <option value="">📍 Tất cả địa điểm</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>

      {/* Chọn ngày */}
      <input
        type="date"
        lang="vi"
        className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
      />

      {/* Nút xoá bộ lọc */}
      <button
        onClick={onResetFilters}
        disabled={!canReset}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border font-medium text-sm transition-all duration-200
          ${
            canReset
              ? 'bg-white text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
      >
        <span className="text-lg">🧹</span> Xoá bộ lọc
      </button>
    </div>
  );
};

export default EventFilter;
