import React from 'react';

interface PresentationControlsProps {
  autoSlide: boolean;
  setAutoSlide: (value: boolean) => void;
  slideInterval: number;
  setSlideInterval: (value: number) => void;
}

const PresentationControls: React.FC<PresentationControlsProps> = ({
  autoSlide,
  setAutoSlide,
  slideInterval,
  setSlideInterval,
}) => {
  return (
    <div className="bg-gray-100 p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">🖥️ Trình chiếu trực tiếp</h2>

      <div className="flex items-center gap-x-4">
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          ▶️ Bắt đầu trình chiếu
        </button>

        <label className="flex items-center gap-x-2">
          <input
            type="checkbox"
            checked={autoSlide}
            onChange={(e) => setAutoSlide(e.target.checked)}
          />
          <span>Tự động chuyển slide</span>
        </label>

        {autoSlide && (
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={slideInterval}
            onChange={(e) => setSlideInterval(Number(e.target.value))}
          >
            {[5, 10, 15, 20].map((s) => (
              <option key={s} value={s}>{s} giây</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-x-4">
        <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">⏮️ Quay lại</button>
        <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">⏭️ Tiếp theo</button>
        <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">⏹️ Dừng</button>
      </div>
    </div>
  );
};

export default PresentationControls;
