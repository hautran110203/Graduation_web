import React from 'react';
import { FiChevronDown, FiEdit, FiTrash2 } from 'react-icons/fi';

interface Props {
  selectedCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

const TableActionDropdown: React.FC<Props> = ({ selectedCount, onEdit, onDelete }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded"
      >
        Actions <FiChevronDown className="ml-1" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-40 rounded-md shadow bg-white border">
          <button
            onClick={() => {
              setOpen(false);
              if (selectedCount === 1) onEdit();
            }}
            disabled={selectedCount !== 1}
            className={`flex items-center w-full px-3 py-2 text-sm ${
              selectedCount === 1
                ? 'hover:bg-gray-100'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiEdit className="mr-2" /> Chỉnh sửa
          </button>
          <button
            onClick={() => {
              setOpen(false);
              if (selectedCount > 0) onDelete();
            }}
            disabled={selectedCount === 0}
            className={`flex items-center w-full px-3 py-2 text-sm ${
              selectedCount > 0
                ? 'hover:bg-gray-100 text-red-600'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiTrash2 className="mr-2" /> Xóa
          </button>
        </div>
      )}
    </div>
  );
};

export default TableActionDropdown;
