// import React, { useState } from 'react';
// import type { Slide } from './DemoPresentationView';

// interface ControllerPopupProps {
//   slides: Slide[];
//   bgImage?: string;
//   onClose?: () => void;
// }

// const ControllerPopup: React.FC<ControllerPopupProps> = ({ slides, bgImage,onClose }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [childWindow, setChildWindow] = useState<Window | null>(null);

//   const openPresentation = () => {
//     const win = window.open('/presentation', '_blank');
//     if (win) {
//       setChildWindow(win);
//       win.onload = () => {
//         win.postMessage(
//           {
//             type: 'init',
//             slides,
//             index: 0,
//             bgImage,
//           },
//           '*'
//         );
//       };
//     }
//   };

//   const gotoSlide = (index: number) => {
//     if (!childWindow || index < 0 || index >= slides.length) return;
//     childWindow.postMessage({ type: 'goto', index }, '*');
//     setCurrentIndex(index);
//   };

//   return (
//     <div className="fixed bottom-4 right-4 bg-white shadow-xl p-4 rounded-lg z-50 w-80 space-y-4">
//       {onClose && (
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
//           aria-label="Đóng"
//         >
//           &times;
//         </button>
//       )}
//       <h3 className="text-lg font-semibold">Điều khiển trình chiếu</h3>

//       <div className="flex justify-between items-center">
//         <button
//           onClick={() => gotoSlide(currentIndex - 1)}
//           className="bg-gray-700 text-white px-3 py-1 rounded"
//         >
//           ⏮️ Lùi
//         </button>
//         <span>
//           Slide {slides.length ? currentIndex + 1 : 0}/{slides.length}
//         </span>
//         <button
//           onClick={() => gotoSlide(currentIndex + 1)}
//           className="bg-gray-700 text-white px-3 py-1 rounded"
//         >
//           ⏭️ Tiếp
//         </button>
//       </div>

//       <button
//         onClick={openPresentation}
//         className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
//       >
//           Mở cửa sổ trình chiếu
//       </button>
//     </div>
//   );
// };

// export default ControllerPopup;
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Slide } from './DemoPresentationView';

interface ControllerPopupProps {
  slides: Slide[];
  bgImage?: string;
  onClose?: () => void;
}

const ControllerPopup: React.FC<ControllerPopupProps> = ({ slides, bgImage, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const childWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;

      // DEBUG
      // console.log('[Parent] receive', e.origin, data);

      if (data.type === 'ready') {
        setIsReady(true);
        childWindowRef.current?.postMessage(
          { type: 'init', slides, index: 0, bgImage },
          '*'
        );
      }
      if (data.type === 'ackInit') {
        // optional
      }
      if (data.type === 'ackGoto' && typeof data.index === 'number') {
        setCurrentIndex(data.index);
      }
    };

    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [slides, bgImage]);

  const clamp = (i: number) => Math.max(0, Math.min(i, Math.max(0, slides.length - 1)));

  const openPresentation = useCallback(() => {
    // ❗ Không dùng 'noopener,noreferrer' để giữ window.opener
    const win = window.open('/presentation', '_blank');
    if (!win) return;

    childWindowRef.current = win;
    setIsReady(false);
    setCurrentIndex(0);

    // Fallback nếu chưa nhận 'ready'
    setTimeout(() => {
      try {
        childWindowRef.current?.postMessage(
          { type: 'init', slides, index: 0, bgImage },
          '*'
        );
      } catch {}
    }, 400);
  }, [slides, bgImage]);

  const gotoSlide = (idx: number) => {
  // nếu chưa mở/ready thì bỏ qua (hoặc hiện toast)
  if (!childWindowRef.current || !isReady) return;

  const next = clamp(idx);
  childWindowRef.current.postMessage({ type: 'goto', index: next }, '*');
  setCurrentIndex(next);
};


  const canPrev = isReady && slides.length > 0 && currentIndex > 0;
  const canNext = isReady && slides.length > 0 && currentIndex < slides.length - 1;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-xl p-4 rounded-lg z-50 w-80 space-y-4">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
          aria-label="Đóng"
        >
          &times;
        </button>
      )}

      <h3 className="text-lg font-semibold">Điều khiển trình chiếu</h3>

      <div className="text-sm text-gray-600">
        Trạng thái: {childWindowRef.current ? (isReady ? 'Sẵn sàng' : 'Đang chờ...') : 'Chưa mở'}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => gotoSlide(currentIndex - 1)}
          disabled={!canPrev}
          className={`px-3 py-1 rounded ${canPrev ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          ⏮️ Lùi
        </button>

        <span>Slide {slides.length ? currentIndex + 1 : 0}/{slides.length}</span>

        <button
          onClick={() => gotoSlide(currentIndex + 1)}
          disabled={!canNext}
          className={`px-3 py-1 rounded ${canNext ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          ⏭️ Tiếp
        </button>
      </div>

      <button
        onClick={openPresentation}
        className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
      >
        Mở cửa sổ trình chiếu
      </button>
    </div>
  );
};

export default ControllerPopup;
