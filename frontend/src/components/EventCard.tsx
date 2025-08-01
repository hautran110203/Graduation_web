import React from 'react';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  unit_code: string;
  event_id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}


function formatDateParts(dateStr: string) {
  const [day, month] = dateStr.split('/');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return {
    day,
    month: months[parseInt(month, 10) - 1] || '',
  };
}


const EventCard: React.FC<EventCardProps> = ({
  unit_code,
  event_id,
  title,
  date,
  time,
  location,
  description,
}) => {
  const navigate = useNavigate();
  const { day, month } = formatDateParts(date);


  return (
    <div className="relative bg-white rounded-lg shadow p-10 flex items-start gap-11 hover:shadow-md transition">
      {/* Left: Date */}
      <div className="text-center w-[70px] flex-shrink-0">
        <div className="text-4xl font-extrabold text-pink-600">{day}</div>
        <div className="text-sm text-gray-600">{month}</div>
        <div className="text-xs text-gray-500 mt-1">
          {time.split(' - ')[0]}<br />–<br />{time.split(' - ')[1]}
        </div>
      </div>

      {/* Middle: Content */}
      <div className="flex-1">
        <h4 className="text-md font-semibold text-gray-900 leading-snug">{title}</h4>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="text-sm font-semibold text-pink-600 mt-3">{location}</div>
      </div>

      {/* Button: Bottom-right */}
      <button
        className="absolute bottom-4 right-4 bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition text-sm"
        
        onClick={() => {
          console.log(`/events/${unit_code}/${event_id}`);
          navigate(`/events/${unit_code}/${event_id}`);
        }}


      >
        Chi tiết
      </button>
    </div>
  );
};

export default EventCard;
