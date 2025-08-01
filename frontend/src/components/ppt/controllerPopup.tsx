import React, { useState } from 'react';
import type { Slide } from './DemoPresentationView';

interface ControllerPopupProps {
  slides: Slide[];
  bgImage?: string;
}

const ControllerPopup: React.FC<ControllerPopupProps> = ({ slides, bgImage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [childWindow, setChildWindow] = useState<Window | null>(null);

  const openPresentation = () => {
    const win = window.open('/presentation', '_blank');
    if (win) {
      setChildWindow(win);
      win.onload = () => {
        win.postMessage(
          {
            type: 'init',
            slides,
            index: 0,
            bgImage,
          },
          '*'
        );
      };
    }
  };

  const gotoSlide = (index: number) => {
    if (!childWindow || index < 0 || index >= slides.length) return;
    childWindow.postMessage({ type: 'goto', index }, '*');
    setCurrentIndex(index);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-xl p-4 rounded-lg z-50 w-80 space-y-4">
      <h3 className="text-lg font-semibold">🕹️ Điều khiển trình chiếu</h3>

      <div className="flex justify-between items-center">
        <button
          onClick={() => gotoSlide(currentIndex - 1)}
          className="bg-gray-700 text-white px-3 py-1 rounded"
        >
          ⏮️ Lùi
        </button>
        <span>
          Slide {slides.length ? currentIndex + 1 : 0}/{slides.length}
        </span>
        <button
          onClick={() => gotoSlide(currentIndex + 1)}
          className="bg-gray-700 text-white px-3 py-1 rounded"
        >
          ⏭️ Tiếp
        </button>
      </div>

      <button
        onClick={openPresentation}
        className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
      >
        🚀 Mở cửa sổ trình chiếu
      </button>
    </div>
  );
};

export default ControllerPopup;
