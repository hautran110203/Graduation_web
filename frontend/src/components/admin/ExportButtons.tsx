import React from 'react';

interface EventOption {
  label: string;
  value: number;
}

interface EventSelectorProps {
  selectedEvent: string;
  setSelectedEvent: (value: string) => void;
  eventOptions: EventOption[];
  onDownload?: () => void;
  onEventChange?: (eventId: string) => void; // thêm prop callback
}

const EventSelector: React.FC<EventSelectorProps> = ({
  selectedEvent,
  setSelectedEvent,
  eventOptions,
  onDownload,
  onEventChange, // nhận vào
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEvent(value); // cập nhật selectedEvent
    if (onEventChange) {
      onEventChange(value); // gọi callback để load danh sách user từ eventId
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <label className="block text-lg font-medium px-2">Chọn sự kiện trình chiếu:</label>
        <select
          className="border border-gray-300 rounded px-4 py-2 mt-1"
          value={selectedEvent}
          onChange={handleChange}
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
        onClick={() => onDownload?.()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={!onDownload}
      >
        📥 Tải danh sách
      </button>

    </div>
  );
};

export default EventSelector;
