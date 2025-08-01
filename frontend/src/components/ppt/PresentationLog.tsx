import React from 'react';

interface PresentationLogProps {}

const PresentationLog: React.FC<PresentationLogProps> = () => {
  return (
    <div className="bg-white p-4 border rounded shadow">
      <h3 className="text-lg font-medium mb-2">📋 Log trình chiếu</h3>
      <ul className="text-sm space-y-1">
        <li>✔️ Trình chiếu bắt đầu lúc: 10:00</li>
        <li>✔️ Slide hiện tại: 3</li>
        <li>✔️ Số sinh viên đã trình chiếu: 25</li>
      </ul>
    </div>
  );
};

export default PresentationLog;
