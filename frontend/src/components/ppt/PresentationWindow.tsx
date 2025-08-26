// import React, { useEffect, useState } from 'react';
// import DemoPresentationView from './DemoPresentationView';
// import type { Slide } from './DemoPresentationView';

// const PresentationWindow: React.FC = () => {
//   const [slides, setSlides] = useState<Slide[]>([]);
//   const [index, setIndex] = useState(0);
//   const [bgImage, setBgImage] = useState<string | undefined>(undefined);

//   // ✅ Lắng nghe postMessage
//   useEffect(() => { 
//     console.log("✅ PresentationWindow mounted, waiting for slides...");
//     const handler = (e: MessageEvent) => {
      
//       if (e.data?.type === 'init') {
//         setSlides(e.data.slides || []);
//         setIndex(e.data.index || 0);
//         if (e.data.bgImage) setBgImage(e.data.bgImage);
//       }
//       if (e.data?.type === 'goto') {
//         setIndex(e.data.index);
//       }
//     };
//     window.addEventListener('message', handler);
//     return () => window.removeEventListener('message', handler);
//   }, []);
// useEffect(() => {
//   console.log('✅ PresentationWindow mounted, waiting for slides...');
//   try {
//     // báo cho parent là đã sẵn sàng
//     window.opener?.postMessage({ type: 'ready' }, '*');
//   } catch {}
// }, []);

// useEffect(() => {
//   const handler = (e: MessageEvent) => {
//     const data = e.data;
//     if (!data || typeof data !== 'object') return;

//     if (data.type === 'init') {
//       setSlides(Array.isArray(data.slides) ? data.slides : []);
//       setIndex(Number(data.index ?? 0));
//       if (data.bgImage) setBgImage(String(data.bgImage));
//       try { window.opener?.postMessage({ type: 'ackInit' }, '*'); } catch {}
//     }

//     if (data.type === 'goto') {
//       const next = Math.max(0, Math.min(Number(data.index ?? 0), Math.max(0, slides.length - 1)));
//       setIndex(next);
//       try { window.opener?.postMessage({ type: 'ackGoto', index: next }, '*'); } catch {}
//     }
//   };
//   window.addEventListener('message', handler);
//   return () => window.removeEventListener('message', handler);
// }, [slides.length]);

//   return (
//     <DemoPresentationView
//       slides={slides}
//       autoSlide={false} // hoặc true nếu muốn tự động
//       slideInterval={5}
//       bgImage={bgImage}
//       showControls={false}
//       isDemo={false}
      
//     />
//   );
// };

// export default PresentationWindow;
import React, { useEffect, useState } from 'react';
import DemoPresentationView from './DemoPresentationView';
import type { Slide } from './DemoPresentationView';

const PresentationWindow: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [bgImage, setBgImage] = useState<string | undefined>(undefined);

  const clamp = (i: number, len: number) => Math.max(0, Math.min(i, Math.max(0, len - 1)));

  useEffect(() => {
    console.log('✅ PresentationWindow mounted, waiting for slides...');
    try {
      // ❗ yêu cầu opener không null
      window.opener?.postMessage({ type: 'ready' }, '*');
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;

      // DEBUG
      // console.log('[Child] receive', e.origin, data);

      if (data.type === 'init') {
        const arr: Slide[] = Array.isArray(data.slides) ? data.slides : [];
        const startIdx = clamp(Number(data.index ?? 0), arr.length);
        setSlides(arr);
        setIndex(startIdx);
        if (data.bgImage) setBgImage(String(data.bgImage));
        try { window.opener?.postMessage({ type: 'ackInit' }, '*'); } catch {}
      }

      if (data.type === 'goto') {
        const next = clamp(Number(data.index ?? 0), slides.length);
        setIndex(next);
        try { window.opener?.postMessage({ type: 'ackGoto', index: next }, '*'); } catch {}
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [slides.length]);

  useEffect(() => {
    setIndex((i) => clamp(i, slides.length));
  }, [slides.length]);

  return (
    <DemoPresentationView
      slides={slides}
      autoSlide={false}
      slideInterval={5}
      bgImage={bgImage}
      showControls={false}
      isDemo={false}
      currentIndex={index}
    />
  );
};

export default PresentationWindow;
