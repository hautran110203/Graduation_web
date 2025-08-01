import React, { useState } from 'react';

interface Props {
  onUpload: (file: File) => void;
}

const SeatMapUpload: React.FC<Props> = ({ onUpload }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onUpload(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  return (
    <div className="space-y-2 mt-4">
      <label className="block font-medium">🪑 Tải sơ đồ chỗ ngồi:</label>
      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />

      {fileName && (
        <div className="text-sm text-gray-600">Đã chọn: {fileName}</div>
      )}

      {previewUrl && (
        <div className="mt-2">
          <img src={previewUrl} alt="Preview" className="max-h-64 rounded shadow" />
        </div>
      )}
    </div>
  );
};

export default SeatMapUpload;
