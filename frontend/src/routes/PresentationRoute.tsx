import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PresentationRoute: React.FC = () => {
  const [slides, setSlides] = useState<{ name: string }[]>([]);
  const [index, setIndex] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('slideData');
    if (raw) {
      setSlides(JSON.parse(raw));
    } else {
      alert('Không có dữ liệu trình chiếu.');
      navigate('/');
    }
  }, [navigate]);

  const next = () => setIndex((i) => Math.min(i + 1, slides.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  if (!slides.length) return null;

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl mb-10">🎓 {slides[index].name}</h1>
      <div className="flex space-x-6">
        <button onClick={prev} className="bg-gray-700 px-6 py-2 rounded">⏮️ Quay lại</button>
        <button onClick={next} className="bg-gray-700 px-6 py-2 rounded">⏭️ Tiếp theo</button>
      </div>
    </div>
  );
};

export default PresentationRoute;
