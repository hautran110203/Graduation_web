import React from 'react';

interface EventOption {
  id: string;
  name: string;
}

interface Props {
  events: EventOption[];
  selectedEventId: string;
  onChange: (id: string) => void;
  onView: () => void;
}

const EventFilterBar: React.FC<Props> = ({
  events,
  selectedEventId,
  onChange,
  onView,
}) => {
  return (
    <div className="flex items-center gap-4">
      <select
        className="border px-4 py-2 rounded w-80"
        value={selectedEventId}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">-- Chọn sự kiện --</option>
        {events.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>
      <button
        onClick={onView}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        🔍 Xem chi tiết
      </button>
    </div>
  );
};

export default EventFilterBar;
