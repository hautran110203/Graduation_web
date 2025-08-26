import React from 'react';

// thêm prop
interface Props {
  onUploadSuccess?: () => void;
}

const GraduationUpload: React.FC<Props> = ({ onUploadSuccess }) => {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:3001/graduation/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log('📥 Upload result:', data);
      alert('✅ Tải lên thành công!');

      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('❌ Upload lỗi:', err);
      alert('❌ Tải lên thất bại!');
    }
  };

  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-gray-700 mr-4">Tải danh sách Excel:</label>
      <input type="file" accept=".xlsx,.xls" onChange={handleUpload} />
    </div>
  );
};


export default GraduationUpload;
