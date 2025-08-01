import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventSelector from '../../components/ppt/EventSelector';
import DemoPresentationView from '../../components/ppt/DemoPresentationView';
import StudentListPopup from '../../components/ppt/StudentListPopup';
import type { EventOption } from '../../components/ppt/EventSelector';
import type { Student } from '../../components/AdminUnit/GraduationTable';
import PptxGenJS from 'pptxgenjs';
import ControllerPopup from '../../components/ppt/controllerPopup';
import type { Slide } from '../../components/ppt/DemoPresentationView';

interface Event {
  event_id: number;
  title: string;
  unit_code: string;
  slide_template_url?: string;
}

interface ExtendedStudent extends Student {
  avatar_url?: string;
}

// ✅ Chuẩn hoá slide từ Student
const mapStudentToSlide = (s: ExtendedStudent): Slide => ({
  name: s.full_name,
  major: s.major,
  classification: s.classification,
  degree_title: s.degree_title,
  avatar_url: s.avatar_url,
});

const EventPresentationUI: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [autoSlide, setAutoSlide] = useState(false);
  const [slideInterval, setSlideInterval] = useState(5);
  const [showDemo, setShowDemo] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [slideList, setSlideList] = useState<ExtendedStudent[]>([]);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'ppt' | null>(null);
  const [showController, setShowController] = useState(false);

  const handleEventChange = async (eventId: number) => {
    const foundEvent = events.find(e => e.event_id === eventId) || null;
    setSelectedEvent(foundEvent);
    if (!foundEvent) {
      setSlideList([]);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3001/ppt/${eventId}/users`);
      if (res.data.success) {
        const mapped = res.data.data.map((u: any) => ({
          user_code: u.user_code || '',
          full_name: u.full_name || '',
          unit_code: u.unit_code || '',
          major: u.major || '',
          gpa: u.gpa ?? 0,
          classification: u.classification || '',
          degree_title: u.degree_title || '',
          avatar_url: u.avatar_url || '',
          slide_template_url: u.slide_template_url || '',
        }));
        setSlideList(mapped);
      }
    } catch (err) {
      console.error('❌ Lỗi khi lấy danh sách sinh viên:', err);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:3001/ppt/events');
        if (res.data.success) {
          const eventsData = res.data.data;
          setEvents(eventsData);

          const mapped = eventsData.map((e: Event) => ({
            label: e.title,
            value: e.event_id,
          }));
          setEventOptions(mapped);
        }
      } catch (err) {
        console.error('❌ Lỗi lấy sự kiện:', err);
      }
    };
    fetchEvents();
  }, []);

  const handleDownloadClick = () => {
    if (!slideList.length) {
      alert('Danh sách trống!');
      return;
    }
    setShowPopup(true);
  };

  const handleStartPresentation = () => {
    localStorage.setItem('slideData', JSON.stringify(slideList));
    const win = window.open('/presentation', '_blank');

    if (win) {
      win.onload = () => {
        win.postMessage({
          type: 'init',
          slides: slideList.map(mapStudentToSlide),
          index: 0,
          bgImage: selectedEvent?.slide_template_url || null,
        }, '*');
      };
    }

    setShowController(true);
  };

  const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
    const encodedUrl = encodeURIComponent(imageUrl);
    const proxyUrl = `http://localhost:3001/proxy-image?url=${encodedUrl}`;
    const res = await fetch(proxyUrl);
    const blob = await res.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleExportPPT = async () => {
    if (!slideList.length) {
      alert('Danh sách sinh viên trống.');
      return;
    }

    const pptx = new PptxGenJS();
    const bgImage = selectedEvent?.slide_template_url;
    let bgBase64: string | null = null;

    if (bgImage) {
      try {
        bgBase64 = await getBase64ImageFromUrl(bgImage);
      } catch (e) {
        console.warn("⚠️ Không thể tải ảnh nền:", e);
      }
    }

    for (const s of slideList) {
      const slide = pptx.addSlide();
      if (bgBase64) {
        slide.background = { data: bgBase64 };
      } else {
        slide.background = { fill: '1F2937' };
      }

      if (s.avatar_url) {
        try {
          const avatarBase64 = await getBase64ImageFromUrl(s.avatar_url);
          slide.addImage({
            data: avatarBase64,
            x: 7.0, y: 2.0, w: 2.5, h: 2.5,
            rounding: true,
          });
        } catch (err) {
          console.warn('⚠️ Không thể tải avatar:', err);
        }
      }

      slide.addText(`🎓 ${s.full_name}`, { x: 1, y: 2.3, fontSize: 28, bold: true, color: 'FFFFFF' });
      slide.addText(`📘 Ngành học: ${s.major}`, { x: 1, y: 2.9, fontSize: 20, color: 'FFFFFF' });
      slide.addText(`🏆 Xếp loại: ${s.classification}`, { x: 1, y: 3.4, fontSize: 20, color: 'FFFFFF' });
      slide.addText(`🎖️ Danh hiệu: ${s.degree_title}`, { x: 1, y: 3.9, fontSize: 20, color: 'FFFFFF' });
    }

    pptx.writeFile({ fileName: 'danh_sach_sinh_vien.pptx' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <EventSelector
        selectedEvent={selectedEvent?.event_id ?? null}
        eventOptions={eventOptions}
        onEventChange={handleEventChange}
        onDownload={handleDownloadClick}
      />

      {showPopup && (
        <StudentListPopup
          students={slideList}
          eventName={selectedEvent?.title}
          unitCode={selectedEvent?.unit_code}
          onClose={() => setShowPopup(false)}
        />
      )}

      <div className="flex gap-x-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setShowDemo(!showDemo)}
        >
          🎬 Xem demo
        </button>
      </div>

      {showDemo && (
        <div className="space-y-4 ">
          <div className='origin-left transition-all duration-300'
          style={{ transform: 'scaleX(0.75) scaleY(0.79)' }}>
          <DemoPresentationView
            slides={slideList.map(mapStudentToSlide)}
            autoSlide={autoSlide}
            slideInterval={slideInterval}
            bgImage={selectedEvent?.slide_template_url}
            showControls={true}
            isDemo={true}
          />
          </div>
          <div className="relative inline-block text-left">
            <button
              className="bg-purple-600  text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => setExportFormat(exportFormat ? null : 'pdf')}
            >
              📤 PowerPoint
            </button>

            {exportFormat && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow z-10">
                <button
                  onClick={handleExportPPT}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  📊 Xuất PowerPoint
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-100 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">🖥️ Trình chiếu trực tiếp</h2>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={handleStartPresentation}
          disabled={!slideList.length}
        >
          ▶️ Bắt đầu trình chiếu
        </button>

        {showController && (
          <ControllerPopup
            slides={slideList.map(mapStudentToSlide)}
            bgImage={selectedEvent?.slide_template_url}
            
          />
        )}
      </div>

    </div>
  );
};

export default EventPresentationUI;
