import React from 'react';

interface EventItem {
  title: string;
  date: string;
}

interface Props {
  events: EventItem[];
}

const UpcomingEventList: React.FC<Props> = ({ events }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-700">📅 Sự kiện sắp tới</h3>
      <div className="bg-white rounded shadow divide-y">
        {events.map((event, index) => (
          <div key={index} className="p-4 flex justify-between items-center">
            <span className="text-gray-800">{event.title}</span>
            <span className="text-sm text-gray-500">{event.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEventList;
