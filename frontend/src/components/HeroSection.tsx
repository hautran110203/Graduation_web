import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const HeroSection: React.FC = () => (
  <section className="bg-dark text-light py-5">
    <Container>
      <Row className="align-items-center">
        <Col md={6}>
          <h2>Bạn sắp tốt nghiệp? Đừng lo, đã có chúng tôi!</h2>
          <p>Theo dõi và hoàn tất mọi bước tốt nghiệp nhanh chóng, tiện lợi.</p>
          <Button variant="primary" className="me-2">Bắt đầu ngay</Button>
        </Col>
        <Col md={6}>
          <div style={{ backgroundColor: '#6c757d', height: '300px' }} className="rounded w-100" />
        </Col>
      </Row>
    </Container>
  </section>
);

export default HeroSection;
