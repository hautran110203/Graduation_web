import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';

interface EventFilterProps {
  searchKeyword: string;
  selectedLocation: string;
  selectedDate: string;
  locations: string[];
  onKeywordChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onDateChange: (val: string) => void;
}

const EventFilter: React.FC<EventFilterProps> = ({
  searchKeyword,
  selectedLocation,
  selectedDate,
  locations,
  onKeywordChange,
  onLocationChange,
  onDateChange
}) => {
  return (
    <Row className="mb-4">
      <Col md={4}>
        <Form.Control
          type="text"
          placeholder="🔍 Tìm kiếm theo tiêu đề..."
          value={searchKeyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </Col>
      <Col md={4}>
        <Form.Select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
        >
          <option value="">📍 Tất cả địa điểm</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </Form.Select>
      </Col>
      <Col md={4}>
        <Form.Control
          type="date"
          lang='vi'
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </Col>
    </Row>
  );
};

export default EventFilter;