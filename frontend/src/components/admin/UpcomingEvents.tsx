import React from 'react';

interface Event {
  name: string;
  date: string; // dd/mm/yyyy
}

interface Props {
  events: Event[];
}

const UpcomingEvents: React.FC<Props> = ({ events }) => {
  return (
    <div className="bg-white border rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-3">📅 Sự kiện sắp diễn ra</h2>
      {events.length === 0 ? (
        <p className="text-gray-500 text-sm">Không có sự kiện nào sắp diễn ra.</p>
      ) : (
        <ul className="divide-y">
          {events.map((e, idx) => (
            <li key={idx} className="py-2 flex justify-between items-center">
              <span className="text-sm">{e.name}</span>
              <span className="text-sm text-gray-600">{e.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingEvents;
