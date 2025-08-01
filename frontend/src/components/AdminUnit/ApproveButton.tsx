import React from 'react';

interface ApproveButtonProps {
  onClick: () => void;
}

const ApproveButton: React.FC<ApproveButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
    >
      Duyệt
    </button>
  );
};

export default ApproveButton;
