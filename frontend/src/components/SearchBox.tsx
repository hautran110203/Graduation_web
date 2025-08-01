import React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';

const SearchBox: React.FC = () => {
  return (
    <div className="flex items-center max-w-md mx-auto w-full">
      <input
        type="text"
        placeholder="🔍 Tìm kiếm sự kiện..."
        className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition"
      >
        <MagnifyingGlass size={20} />
      </button>
    </div>
  );
};

export default SearchBox;
