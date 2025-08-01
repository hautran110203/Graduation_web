import React, { useEffect, useState } from 'react';
import DemoPresentationView from './DemoPresentationView';
import type { Slide } from './DemoPresentationView';

const PresentationWindow: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [bgImage, setBgImage] = useState<string | undefined>(undefined);

  // ✅ Lắng nghe postMessage
  useEffect(() => { 
    console.log("✅ PresentationWindow mounted, waiting for slides...");
    const handler = (e: MessageEvent) => {
      
      if (e.data?.type === 'init') {
        setSlides(e.data.slides || []);
        setIndex(e.data.index || 0);
        if (e.data.bgImage) setBgImage(e.data.bgImage);
      }
      if (e.data?.type === 'goto') {
        setIndex(e.data.index);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <DemoPresentationView
      slides={slides}
      autoSlide={false} // hoặc true nếu muốn tự động
      slideInterval={5}
      bgImage={bgImage}
      showControls={false}
      isDemo={false}
    />
  );
};

export default PresentationWindow;
