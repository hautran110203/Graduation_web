  import React, { useEffect, useState } from 'react';
  import { Link } from 'react-router-dom';
  import axios from 'axios';

  interface EventItem {
    event_id: number;
    title: string;
    start_time: string;
    end_time: string;
    location_id: string;
    location_name: string;
    description: string;
    unit_code: string;
  }

  function formatDateParts(dateStr: string) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const monthIndex = date.getMonth();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return {
      day,
      month: months[monthIndex] || '',
    };
  }

  const UpcomingEvents: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);

    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const res = await axios.get('http://localhost:3001/events');
          const sorted = res.data
            .sort((a: EventItem, b: EventItem) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
            .slice(0, 3);
          setEvents(sorted);
        } catch (err) {
          console.error('Lỗi khi lấy sự kiện:', err);
        }
      };
      fetchEvents();
    }, []);

    return (
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-extrabold text-center mb-4 text-gray-800">Events</h2>
          <p className="text-center text-lg text-gray-600 mb-12">
            Theo dõi lịch lễ tốt nghiệp – hoàn tất thủ tục dễ dàng, đúng thời gian.
          </p>

          <div className="space-y-6">
            {events.map((event) => {
              const { day, month } = formatDateParts(event.start_time);
              const timeRange = `${event.start_time?.slice(11, 16) || '??:??'} - ${event.end_time?.slice(11, 16) || '??:??'}`;

              return (
                <div
                  key={event.event_id}
                  className="bg-white rounded-lg shadow-sm border p-6 flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  {/* Left Date */}
                  <div className="flex-shrink-0 text-center mb-4 md:mb-0 md:mr-6">
                    <div className="text-4xl font-extrabold text-pink-600">{day}</div>
                    <div className="text-sm text-gray-500">
                      {month} | {timeRange}
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <div className="text-sm text-gray-500 mb-1">Event</div>
                    <div className="text-sm font-semibold text-pink-600">{event.location_name}</div>
                    <div className="text-sm text-gray-400">{event.description}</div>
                  </div>

                  {/* Right Button */}
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <Link
                      to={`/events/${event.unit_code}/${event.event_id}`}
                      className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition font-medium"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  export default UpcomingEvents;
