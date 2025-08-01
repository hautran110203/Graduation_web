// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import EventModal from './EventModal';

// const BASE_URL = 'http://localhost:3001';

// interface EventItem {
//   event_id: number;
//   title: string;
//   location: string;
//   description: string;
//   start_time: string;
//   end_time: string;
//   unit_code: string;
// }

// interface Unit {
//   unit_code: string;
//   name: string;
// }

// const EventListAdminUnit: React.FC = () => {
//   const [events, setEvents] = useState<EventItem[]>([]);
//   const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [units, setUnits] = useState<Unit[]>([]);
//   const [filterUnit, setFilterUnit] = useState<string>('');

//   const fetchEvents = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/events`);
//       if (Array.isArray(res.data)) {
//         const sorted = res.data.sort(
//           (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
//         );
//         setEvents(sorted);
//         setFilteredEvents(sorted);
//       }
//     } catch (err) {
//       console.error('❌ Lỗi lấy danh sách sự kiện:', err);
//     }
//   };

//   const fetchUnits = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/units`);
//       if (Array.isArray(res.data)) setUnits(res.data);
//     } catch (err) {
//       console.error('❌ Lỗi lấy đơn vị:', err);
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//     fetchUnits();
//   }, []);

//   useEffect(() => {
//     const filtered = filterUnit
//       ? events.filter(e => e.unit_code === filterUnit)
//       : events;
//     setFilteredEvents(filtered);
//   }, [filterUnit, events]);

//   const handleCreate = () => {
//     setSelectedEvent(null);
//     setIsModalOpen(true);
//   };

//   const handleEdit = (event: EventItem) => {
//     setSelectedEvent(event);
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id: number) => {
//   try {
//     const event = events.find(e => e.event_id === id);
//     if (!event) return;

//     await axios.delete(`${BASE_URL}/events/${id}`, {
//       data: { unit_code: event.unit_code } // ✅ gửi kèm đơn vị để backend kiểm tra phân quyền
//     });

//     setEvents(prev => prev.filter(e => e.event_id !== id));
//   } catch (err) {
//     console.error('❌ Lỗi xoá sự kiện:', err);
//   }
// };


//  const handleSave = async (event: any) => {
//   try {
//     if (event.event_id) {
//       if (!event.unit_code) {
//         console.warn('⚠️ Thiếu unit_code khi cập nhật sự kiện:', event);
//         alert('Không thể cập nhật sự kiện do thiếu đơn vị (unit_code).');
//         return;
//       }

//       console.log('[DEBUG] Payload gửi PUT:', event);
//       await axios.put(`${BASE_URL}/events/${event.event_id}`, event);

//       setEvents(prev =>
//         prev.map(e => (e.event_id === event.event_id ? event : e))
//       );
//     } else {
//       if (!event.unit_code) {
//         console.warn('⚠️ Thiếu unit_code khi tạo sự kiện:', event);
//         alert('Không thể tạo sự kiện do thiếu đơn vị (unit_code).');
//         return;
//       }

//       console.log('[DEBUG] Payload gửi POST:', event);
//       const res = await axios.post(`${BASE_URL}/events`, event);
//       setEvents(prev => [...prev, res.data]);
//     }

//     setIsModalOpen(false);
//   } catch (err) {
//     console.error('❌ Lỗi lưu sự kiện:', err);
//     alert('❌ Không thể lưu sự kiện. Vui lòng kiểm tra console.');
//   }
// };


//   const formatDate = (iso: string) =>
//     new Date(iso).toLocaleDateString('vi-VN');
//   const formatTime = (start: string, end: string) =>
//     `${new Date(start).toTimeString().slice(0, 5)} - ${new Date(end)
//       .toTimeString()
//       .slice(0, 5)}`;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">📅 Danh sách sự kiện</h2>
//         <button
//           onClick={handleCreate}
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           + Tạo sự kiện
//         </button>
//       </div>

//       <div className="mb-6">
//         <select
//           value={filterUnit}
//           onChange={e => setFilterUnit(e.target.value)}
//           className="border px-3 py-2 rounded"
//         >
//           <option value="">-- Tất cả đơn vị --</option>
//           {units.map(unit => (
//             <option key={unit.unit_code} value={unit.unit_code}>
//               {unit.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="space-y-6">
//         {filteredEvents.map(event => (
//           <div
//             key={event.event_id}
//             className="p-4 border rounded shadow-sm bg-white space-y-1"
//           >
//             <h3 className="text-lg font-semibold">{event.title}</h3>
//             <p>
//               <strong>📅</strong> {formatDate(event.start_time)} |{' '}
//               <strong>⏰</strong>{' '}
//               {formatTime(event.start_time, event.end_time)}
//             </p>
//             <p>
//               <strong>📍</strong> {event.location}
//             </p>
//             <p>{event.description}</p>
//             <div className="flex gap-4 mt-2">
//               <button
//                 onClick={() => handleEdit(event)}
//                 className="text-blue-600 hover:underline"
//               >
//                 Chỉnh sửa
//               </button>
//               <button
//                 onClick={() => handleDelete(event.event_id)}
//                 className="text-red-600 hover:underline"
//               >
//                 Xóa
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {isModalOpen && (
//         <EventModal
//           event={selectedEvent}
//           onClose={() => setIsModalOpen(false)}
//           onSave={handleSave}
//         />
//       )}
//     </div>
//   );
// };

// export default EventListAdminUnit;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventModal from './EventModal';

const BASE_URL = 'http://localhost:3001';

interface EventItem {
  event_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  unit_code: string;
  location_id?: string;      // để lưu
  location_name?: string;    // để hiển thị
}

interface Unit {
  unit_code: string;
  name: string;
}

interface Location {
  location_id: string;
  location_name: string;
}

const EventListAdminUnit: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filterUnit, setFilterUnit] = useState<string>('');

  const fetchEvents = async () => {
    try {
      const [eventRes, locationRes] = await Promise.all([
        axios.get(`${BASE_URL}/events`),
        axios.get(`${BASE_URL}/locations`)
      ]);

      if (Array.isArray(eventRes.data) && Array.isArray(locationRes.data)) {
        const locationMap = Object.fromEntries(
          locationRes.data.map((loc: Location) => [loc.location_id, loc.location_name])
        );
        setLocations(locationRes.data);

        const enrichedEvents = eventRes.data.map((e: any) => ({
          ...e,
          location_name: locationMap[e.location_id] || 'Không rõ'
        }));

        const sorted = enrichedEvents.sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        setEvents(sorted);
        setFilteredEvents(sorted);
      }
    } catch (err) {
      console.error('❌ Lỗi khi tải sự kiện hoặc địa điểm:', err);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/units`);
      if (Array.isArray(res.data)) setUnits(res.data);
    } catch (err) {
      console.error('❌ Lỗi lấy đơn vị:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUnits();
  }, []);

  useEffect(() => {
    const filtered = filterUnit
      ? events.filter(e => e.unit_code === filterUnit)
      : events;
    setFilteredEvents(filtered);
  }, [filterUnit, events]);

  const handleCreate = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: EventItem) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

const handleDelete: (id: number) => Promise<void> = async (id: number) => {
  try {
    const event = events.find(e => e.event_id === id);
    if (!event) return;

    await axios.delete(`${BASE_URL}/events/${id}?unit_code=${event.unit_code}`);
    setEvents(prev => prev.filter(e => e.event_id !== id));
  } catch (err) {
    console.error('❌ Lỗi xoá sự kiện:', err);
    alert('❌ Không thể xoá sự kiện.');
  }
};



  const handleSave = async (event: EventItem) => {
  try {
    if (!event.unit_code || !event.location_id || !event.title) {
      alert('Thiếu đơn vị, địa điểm hoặc tiêu đề.');
      return;
    }

    // 🔍 Tìm tên đơn vị mới
    const newUnit = units.find(u => u.unit_code === event.unit_code);
    if (!newUnit) {
      alert('Không tìm thấy đơn vị tương ứng.');
      return;
    }

    let newTitle = event.title.trim();

    if (event.event_id) {
      // 🔍 Tìm sự kiện cũ
      const oldEvent = events.find(e => e.event_id === event.event_id);
      if (oldEvent) {
        // ✅ Nếu tiêu đề cũ có chứa tên đơn vị cũ → xóa ra
        const oldUnit = units.find(u => u.unit_code === oldEvent.unit_code);
        if (oldUnit && newTitle.endsWith(oldUnit.name)) {
          newTitle = newTitle.slice(0, -oldUnit.name.length).trim();
        }
      }
    }

    // ✅ Gộp tiêu đề mới với tên đơn vị mới
    const fullTitle = `${newTitle} ${newUnit.name}`.trim();

    if (event.event_id) {
      await axios.put(`${BASE_URL}/events/${event.event_id}`, {
        ...event,
        title: fullTitle,
      });

      setEvents(prev =>
        prev.map(e =>
          e.event_id === event.event_id ? { ...event, title: fullTitle } : e
        )
      );
    } else {
      const res = await axios.post(`${BASE_URL}/events`, {
        ...event,
        title: fullTitle,
      });
      setEvents(prev => [...prev, res.data]);
    }

    setIsModalOpen(false);
  } catch (err) {
    console.error('❌ Lỗi lưu sự kiện:', err);
    alert('❌ Không thể lưu sự kiện.');
  }
};


  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN');
  const formatTime = (start: string, end: string) =>
    `${new Date(start).toTimeString().slice(0, 5)} - ${new Date(end)
      .toTimeString()
      .slice(0, 5)}`;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📅 Danh sách sự kiện</h2>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Tạo sự kiện
        </button>
      </div>

      <div className="mb-6">
        <select
          value={filterUnit}
          onChange={e => setFilterUnit(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Tất cả đơn vị --</option>
          {units.map(unit => (
            <option key={unit.unit_code} value={unit.unit_code}>
              {unit.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {filteredEvents.map(event => (
          <div
            key={event.event_id}
            className="p-4 border rounded shadow-sm bg-white space-y-1"
          >
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p>
              <strong>📅</strong> {formatDate(event.start_time)} |{' '}
              <strong>⏰</strong> {formatTime(event.start_time, event.end_time)}
            </p>
            <p>
              <strong>📍</strong> {event.location_name || 'Không rõ'}
            </p>
            <p>{event.description}</p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => handleEdit(event)}
                className="text-blue-600 hover:underline"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => handleDelete(event.event_id)}
                className="text-red-600 hover:underline"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          locations={locations}
        />
      )}
    </div>
  );
};

export default EventListAdminUnit;
