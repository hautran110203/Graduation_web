import React from 'react';

export interface EventOption {
  label: string;
  value: number;
  
}

interface EventSelectorProps {
  selectedEvent: number | null;
  eventOptions: EventOption[];
  onDownload?: () => void;
  onEventChange: (eventId: number) => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({
  selectedEvent,
  eventOptions,
  onDownload,
  onEventChange,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <label className="block text-lg font-medium px-2">Chọn sự kiện trình chiếu:</label>
        <select
          className="border border-gray-300 rounded px-4 py-2 mt-1"
          value={selectedEvent ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value) onEventChange(Number(value));
          }}
        >
          <option value="">-- Chọn sự kiện --</option>
          {eventOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onDownload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        📥 Tải danh sách
      </button>
    </div>
  );
};

export default EventSelector;
