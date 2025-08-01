import React, { useEffect, useState } from 'react';

interface Slide {
  name: string;
  major: string;
  classification: string;
  degree_title: string;
  avatar_url?: string;
}

const PresentationController: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [popup, setPopup] = useState<Window | null>(null);

  useEffect(() => {
    // Lấy dữ liệu từ localStorage hoặc backend (ở đây giả định đã lưu sẵn)
    const saved = localStorage.getItem('slide_data');
    if (saved) {
      setSlides(JSON.parse(saved));
    }
  }, []);

  const openPresentation = () => {
    const newPopup = window.open(
      '/presentation-window', // URL đến route hiển thị slide (chạy PresentationWindow)
      '_blank',
      'width=1280,height=720'
    );
    setPopup(newPopup);

    // Gửi dữ liệu sau khi popup sẵn sàng
    const interval = setInterval(() => {
      if (newPopup && newPopup.document.readyState === 'complete') {
        newPopup.postMessage(
          { type: 'init', slides, index },
          '*'
        );
        clearInterval(interval);
      }
    }, 300);
  };

  const goToSlide = (i: number) => {
    setIndex(i);
    if (popup) {
      popup.postMessage({ type: 'goto', index: i }, '*');
    }
  };

  const next = () => {
    if (index < slides.length - 1) goToSlide(index + 1);
  };

  const prev = () => {
    if (index > 0) goToSlide(index - 1);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">🎮 Điều khiển Slide</h2>
      <div className="flex space-x-4">
        <button onClick={prev} className="bg-blue-600 text-white px-4 py-2 rounded">
          ⏮️ Trước
        </button>
        <button onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded">
          ⏭️ Tiếp
        </button>
        <button onClick={openPresentation} className="bg-green-600 text-white px-4 py-2 rounded">
          🚀 Mở Trình chiếu
        </button>
      </div>
      <p className="text-gray-600">Hiện tại: {slides[index]?.name || 'Chưa có dữ liệu'}</p>
    </div>
  );
};

export default PresentationController;
