// import React, { useState } from 'react';
// import { Button, Pagination, Row, Col, Card } from 'react-bootstrap';
// import { CalendarDots, MapPin, Clock } from '@phosphor-icons/react';
// const EventList: React.FC = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const eventsPerPage = 8; 

//   const indexOfLastEvent = currentPage * eventsPerPage;
//   const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
//   const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

//   const totalPages = Math.ceil(events.length / eventsPerPage);

//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//   };

//   return (
//     <>
//       <h3 className="mb-4">Danh sách sự kiện</h3>

//       <Row xs={1} md={2} className="g-4">
//         {currentEvents.map(event => (
//           <Col key={event.id}>
//             <Card className="h-100">
//               <Card.Body>
//                 <Card.Title><CalendarDots className="me-2" size={30} color="#2461f0" />{event.title}</Card.Title>
//                 <Card.Text className="mb-1">
//                   <Row></Row>
//                   <strong> <Clock className="me-2" size={30} color="#2461f0" />{event.date}</strong> • {event.time}
//                 </Card.Text>
//                 <Card.Text className="mb-1">
//                   <strong><MapPin className="me-2" size={30} color="#2461f0" /></strong> {event.location}
//                 </Card.Text>
//                 <Card.Text>{event.description}</Card.Text>
//                 <Button variant="primary">Xem chi tiết</Button>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       <div className="d-flex justify-content-center mt-4">
//         <Pagination>
//           <Pagination.Prev
//             onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
//             disabled={currentPage === 1}
//           />
//           {[...Array(totalPages).keys()].map(num => (
//             <Pagination.Item
//               key={num + 1}
//               active={num + 1 === currentPage}
//               onClick={() => handlePageChange(num + 1)}
//             >
//               {num + 1}
//             </Pagination.Item>
//           ))}
//           <Pagination.Next
//             onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
//             disabled={currentPage === totalPages}
//           />
//         </Pagination>
//       </div>
//     </>
//   );
// };

// export default EventList;


import React, { useState } from 'react';
import { Row, Col, Pagination } from 'react-bootstrap';
import EventCard from '../components/EventCard';
import EventFilter from '../components/EventFilter';

const events = [
  {
    id: 1,
    title: 'Lễ tốt nghiệp Khoa Công nghệ Thông tin',
    date: '15/07/2025',
    time: '08:00 - 11:00',
    location: 'Hội trường A',
    description: 'Buổi lễ trao bằng tốt nghiệp dành cho sinh viên Khoa CNTT.',
  },
  {
    id: 2,
    title: 'Lễ tổng kết và tuyên dương',
    date: '18/07/2025',
    time: '14:00 - 16:00',
    location: 'Hội trường B',
    description: 'Tuyên dương sinh viên xuất sắc năm học 2024 - 2025.',
  },
  {
    id: 3,
    title: 'Lễ tổng kết và tuyên dương',
    date: '18/07/2025',
    time: '14:00 - 16:00',
    location: 'Hội trường B',
    description: 'Tuyên dương sinh viên xuất sắc năm học 2024 - 2025.',
  },
  {
    id: 4,
    title: 'Lễ tổng kết và tuyên dương',
    date: '18/07/2025',
    time: '14:00 - 16:00',
    location: 'Hội trường B',
    description: 'Tuyên dương sinh viên xuất sắc năm học 2024 - 2025.',
  },
  {
    id: 5,
    title: 'Lễ tổng kết và tuyên dương',
    date: '18/07/2025',
    time: '14:00 - 16:00',
    location: 'Hội trường B',
    description: 'Tuyên dương sinh viên xuất sắc năm học 2024 - 2025.',
  },
  {
    id: 6,
    title: 'Lễ tổng kết và tuyên dương',
    date: '18/07/2025',
    time: '14:00 - 16:00',
    location: 'Hội trường B',
    description: 'Tuyên dương sinh viên xuất sắc năm học 2024 - 2025.',
  },
   {
    id: 7,
    title: 'Lễ trao bằng danh dự',
    date: '20/07/2025',
    time: '09:00 - 11:00',
    location: 'Hội trường A',
    description: 'Trao bằng danh dự cho sinh viên xuất sắc toàn khóa.',
  },
  {
    id: 8,
    title: 'Hội thảo hướng nghiệp sau tốt nghiệp',
    date: '21/07/2025',
    time: '13:30 - 15:30',
    location: 'Phòng hội thảo 101',
    description: 'Chia sẻ kinh nghiệm tìm việc và học cao học từ các cựu sinh viên.',
  },
  {
    id: 9,
    title: 'Triển lãm đồ án tốt nghiệp',
    date: '22/07/2025',
    time: '08:00 - 12:00',
    location: 'Sảnh khoa CNTT',
    description: 'Trưng bày và trình diễn các đồ án xuất sắc của sinh viên.',
  },
  {
    id: 10,
    title: 'Lễ vinh danh sinh viên 5 tốt',
    date: '23/07/2025',
    time: '14:00 - 16:00',
    location: 'Hội trường C',
    description: 'Vinh danh các sinh viên đạt danh hiệu “Sinh viên 5 tốt”.',
  },
  {
    id: 11,
    title: 'Buổi gặp mặt cựu sinh viên',
    date: '24/07/2025',
    time: '15:00 - 17:00',
    location: 'Phòng họp lớn',
    description: 'Kết nối các thế hệ sinh viên và chia sẻ cơ hội nghề nghiệp.',
  },
  {
    id: 12,
    title: 'Lễ tốt nghiệp Khoa Kinh tế',
    date: '25/07/2025',
    time: '07:30 - 10:30',
    location: 'Hội trường B',
    description: 'Lễ trao bằng tốt nghiệp dành cho sinh viên Khoa Kinh tế.',
  },
  {
    id: 13,
    title: 'Lễ tốt nghiệp Khoa Xây dựng',
    date: '26/07/2025',
    time: '08:00 - 11:00',
    location: 'Hội trường A',
    description: 'Buổi lễ tốt nghiệp cho sinh viên Khoa Xây dựng.',
  },
  {
    id: 14,
    title: 'Talkshow: Hành trang cho tân cử nhân',
    date: '27/07/2025',
    time: '09:00 - 11:00',
    location: 'Phòng truyền thống',
    description: 'Chia sẻ kỹ năng mềm, viết CV, phỏng vấn và học cao học.',
  },
  {
    id: 15,
    title: 'Lễ tuyên dương giảng viên hướng dẫn đồ án',
    date: '28/07/2025',
    time: '10:00 - 12:00',
    location: 'Hội trường B',
    description: 'Vinh danh những giảng viên có đóng góp tích cực trong hướng dẫn sinh viên.',
  },
  {
    id: 16,
    title: 'Lễ bế giảng toàn trường',
    date: '29/07/2025',
    time: '08:00 - 10:00',
    location: 'Sân vận động trường',
    description: 'Tổng kết năm học và chúc mừng sinh viên tốt nghiệp.',
  }
];

const EventList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const eventsPerPage = 6;

  const formatDateToYYYYMMDD = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

  const filteredEvents = events.filter(e => {
    const matchKeyword = e.title.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchLocation = selectedLocation === '' || e.location === selectedLocation;
    const matchDate = selectedDate === '' || formatDateToYYYYMMDD(e.date) === selectedDate;
    return matchKeyword && matchLocation && matchDate;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const indexOfLast = currentPage * eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfLast - eventsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const locations = [...new Set(events.map(e => e.location))];

  return (
    <>
      <h3 className="mb-3">📅 Danh sách sự kiện</h3>

      <EventFilter
        searchKeyword={searchKeyword}
        selectedLocation={selectedLocation}
        selectedDate={selectedDate}
        locations={locations}
        onKeywordChange={setSearchKeyword}
        onLocationChange={setSelectedLocation}
        onDateChange={setSelectedDate}
      />

      <Row xs={1} md={2} className="g-4">
        {currentEvents.map(event => (
          <Col key={event.id}>
            <EventCard {...event} />
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.Prev
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </>
  );
};

export default EventList;