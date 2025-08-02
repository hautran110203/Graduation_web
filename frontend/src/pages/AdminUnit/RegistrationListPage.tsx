import React, { useEffect, useState } from 'react';
import RegistrationFilter from '../../components/AdminUnit/RegistrationFilter';
import RegistrationTable from '../../components/AdminUnit/RegistrationTable';
import axios from 'axios';

interface Registration {
  user_code: string;
  name?: string;
  event_id: number;
  event_name?: string;
  registered_at: string;
  status: string; // 'qualified' | 'unqualified'
  unit_name?: string;
}

const RegistrationListPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('Tất cả');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/registrations/getAll');
        if (res.data.success) {
          setRegistrations(res.data.data);
        } else {
          console.error('❌ Lỗi lấy danh sách:', res.data.message);
        }
      } catch (err) {
        console.error('❌ Lỗi API:', err);
      }
    };
    fetchData();
  }, []);

  const eventOptions = [
    'Tất cả',
    ...Array.from(
      new Set(
        registrations.map(r => r.event_name).filter((name): name is string => Boolean(name))
      )
    )
  ];

  const filtered =
    selectedEvent === 'Tất cả'
      ? registrations
      : registrations.filter((r) => r.event_name === selectedEvent);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
        🧾 Danh sách đăng ký sự kiện
      </h2>

      <RegistrationFilter
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        eventOptions={eventOptions}
      />

      <div className="overflow-x-auto">
        <RegistrationTable data={filtered} />
      </div>
    </div>
  );
};

export default RegistrationListPage;
