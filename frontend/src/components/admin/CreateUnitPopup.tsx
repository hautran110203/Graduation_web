import React, { useState } from 'react';

interface CreateUnitPopupProps {
  onClose: () => void;
  onCreate: (data: TrainingUnit) => void;
}

interface TrainingUnit {
  unitCode: string;
  unitName: string;
  logo?: File;
  previewUrl?: string;
}

const CreateUnitPopup: React.FC<CreateUnitPopupProps> = ({ onClose, onCreate }) => {
  const [unitCode, setUnitCode] = useState('');
  const [unitName, setUnitName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!unitCode || !unitName) return;
    onCreate({
      unitCode,
      unitName,
      logo: logoFile ?? undefined,
      previewUrl: previewUrl ?? undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[400px] space-y-4 shadow-lg relative">
        <h2 className="text-lg font-semibold">➕ Tạo đơn vị đào tạo</h2>
        <input
          type="text"
          placeholder="Mã đơn vị"
          value={unitCode}
          onChange={(e) => setUnitCode(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Tên đơn vị"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Logo đơn vị</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl && (
            <img src={previewUrl} alt="preview" className="mt-2 h-20 object-contain rounded border" />
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Huỷ</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUnitPopup;
