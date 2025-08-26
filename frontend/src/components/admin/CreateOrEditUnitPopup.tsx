import React, { useEffect, useState } from 'react';

interface TrainingUnit {
  unitCode: string;
  unitName: string;
  logo?: File;
  previewUrl?: string;
}

interface Props {
  onClose: () => void;
  onSubmit: (data: TrainingUnit) => void;
  initialData?: TrainingUnit;
}

const CreateOrEditUnitPopup: React.FC<Props> = ({ onClose, onSubmit, initialData }) => {
  const [unitCode, setUnitCode] = useState('');
  const [unitName, setUnitName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setUnitCode(initialData.unitCode);
      setUnitName(initialData.unitName);
      setPreviewUrl(initialData.previewUrl ?? null);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    onSubmit({
      unitCode,
      unitName,
      logo: logoFile ?? initialData?.logo,
      previewUrl: previewUrl ?? initialData?.previewUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[400px] space-y-4 shadow-lg relative">
        <h2 className="text-lg font-semibold">
          {initialData ? '✏️ Chỉnh sửa đơn vị' : '➕ Tạo đơn vị đào tạo'}
        </h2>
        <input
          type="text"
          placeholder="Mã đơn vị"
          value={unitCode}
          onChange={(e) => setUnitCode(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          disabled={!!initialData}
        />
        <input
          type="text"
          placeholder="Tên đơn vị"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Huỷ</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit}>
            {initialData ? 'Cập nhật' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrEditUnitPopup;
