import React, { useEffect, useState } from 'react';

export interface Slide {
  name: string;
  major: string;
  classification: string;
  degree_title: string;
  avatar_url?: string;
}

interface DemoPresentationViewProps {
  slides: Slide[];
  autoSlide: boolean;
  slideInterval: number;
  bgImage?: string;
  showControls?: boolean;
  isDemo ?:boolean;
}

const DemoPresentationView: React.FC<DemoPresentationViewProps> = ({
  slides,
  autoSlide,
  slideInterval,
  bgImage,
  showControls = true,
  isDemo = true, // mặc định hiển thị điều khiển
}) => {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    if (!autoSlide) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, slideInterval * 1000);
    return () => clearInterval(timer);
  }, [autoSlide, slideInterval, slides.length]);

  const next = () => setIndex((i) => Math.min(i + 1, slides.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  if (!slides.length)
    return (
      <div className="text-center text-lg text-gray-500">
        Không có slide để hiển thị
      </div>
    );

  const current = slides[index];

  return (
    <div
      className={`w-screen h-screen flex items-end justify-center bg-black relative overflow-hidden
        ${isDemo ? 'scale-[0.4]' : ''}transition-transform duration-300`}
      
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: '105% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: bgImage ? undefined : '#1F2937',
      }}
    >
      <div className="w-full mb-50 max-w-6xl px-3 flex justify-between items-center">
        {/* Thông tin bên trái */}
        <div className="text-white space-y-4 w-2/3">
          <span className="text-6xl font-bold drop-shadow-md  ">{current.name}</span>
          <p className="text-4xl px-15 pt-7">
            <span className="font-semibold">Ngành học:</span> {current.major}
          </p>
          <p className="text-4xl px-15">
            <span className="font-semibold">Xếp loại:</span> {current.classification}
          </p>
          <p className="text-4xl px-15">
            <span className="font-semibold">Danh hiệu:</span> {current.degree_title}
          </p>
        </div>

        {/* Avatar bên phải */}
        {current.avatar_url && (
          <div className="w-1/3 flex justify-center">
            <img
              src={current.avatar_url}
              alt={current.name}
              className="w-70 h-70 rounded-full object-cover border-2 border-white shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Nút điều khiển */}
      {showControls && (
        <div className="absolute bottom-10 w-full flex justify-center space-x-4 z-10">
          <button
            onClick={prev}
            className="bg-gray-700 px-4 py-2 mx-3 rounded hover:bg-gray-600 text-white"
          >
            ⏮️ Quay lại
          </button>
          <button
            onClick={next}
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 text-white"
          >
            ⏭️ Tiếp theo
          </button>
        </div>
      )}
    </div>
  );
};

export default DemoPresentationView;
