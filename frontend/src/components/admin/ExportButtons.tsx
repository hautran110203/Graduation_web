import React from 'react';

interface ExportButtonsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ onExportPDF, onExportExcel }) => {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <button
        onClick={onExportExcel}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        📥 Xuất Excel
      </button>
      <button
        onClick={onExportPDF}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        📄 Xuất PDF
      </button>
    </div>
  );
};

export default ExportButtons;
