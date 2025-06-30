import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Calendar, MapPin } from 'phosphor-react';

interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

const EventCard: React.FC<EventCardProps> = ({ title, date, time, location, description }) => {
  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text className="d-flex align-items-center mb-1">
          <Calendar size={18} className="me-2 text-primary" />
          <strong>{date}</strong> • {time}
        </Card.Text>
        <Card.Text className="d-flex align-items-center mb-1">
          <MapPin size={18} className="me-2 text-muted" />
          {location}
        </Card.Text>
        <Card.Text>{description}</Card.Text>
        <div className="d-flex justify-content-end">
          <Button variant="outline-primary" size="sm">Xem chi tiết</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EventCard;