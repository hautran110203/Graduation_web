import React from 'react';

interface ActionButtonsProps {
  onDemoClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onDemoClick }) => {
  return (
    <div className="flex gap-x-4">
      <button
        onClick={onDemoClick}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        🎬 Xem demo
      </button>
      <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
        📤 Xuất PDF / PowerPoint
      </button>
    </div>
  );
};

export default ActionButtons;