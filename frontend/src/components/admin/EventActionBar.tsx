import React from 'react';

interface EventOption {
  id: string;
  name: string;
}

interface EventActionBarProps {
  events: EventOption[];
  selectedEventId: string;
  onChange: (eventId: string) => void;
  onView: () => void;
  onDownload?: () => void; // tuỳ chọn
}

const EventActionBar: React.FC<EventActionBarProps> = ({
  events,
  selectedEventId,
  onChange,
  onView,
  onDownload,
}) => {
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div>
        <label className="block text-base font-medium mb-1">Chọn sự kiện:</label>
        <select
          className="border px-4 py-2 rounded min-w-[250px]"
          value={selectedEventId}
          onChange={handleSelect}
        >
          <option value="">-- Chọn sự kiện --</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onView}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={!selectedEventId}
      >
        🔍 Xem chi tiết
      </button>

      {onDownload && (
        <button
          onClick={onDownload}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📥 Tải danh sách
        </button>
      )}
    </div>
  );
};

export default EventActionBar;
