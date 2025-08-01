import React from 'react';

interface Props {
  selectedEvent: string;
  setSelectedEvent: (value: string) => void;
  eventOptions: string[];
}

const RegistrationFilter: React.FC<Props> = ({ selectedEvent, setSelectedEvent, eventOptions }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <label className="text-sm text-gray-600 font-medium">Lọc theo sự kiện:</label>
      <select
        value={selectedEvent}
        onChange={(e) => setSelectedEvent(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2"
      >
        {eventOptions.map((event, idx) => (
          <option key={idx} value={event}>{event}</option>
        ))}
      </select>
    </div>
  );
};

export default RegistrationFilter;
