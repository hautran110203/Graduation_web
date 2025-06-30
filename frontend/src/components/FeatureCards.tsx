import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const FeatureCards: React.FC = () => (
  <section className="py-5 bg-light">
    <Container>
      <h3 className="text-center mb-4">Những Tính Năng Nổi Bật</h3>
      <p className="text-center text-muted mb-5">Trải Nghiệm Đăng Ký Tốt Nghiệp Dễ Dàng Chưa Từng Có</p>
      <Row>
    
          <Col md={4} key={1}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Đăng Ký Nhanh Chóng</Card.Title>
                <Card.Text>Giao diện thân thiện giúp bạn hoàn tất đăng ký tốt nghiệp chỉ trong vài phút.</Card.Text>
                <Button variant="outline-primary" size="sm">Tìm hiểu thêm</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} key={2}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Theo Dõi Trạng Thái</Card.Title>
                <Card.Text>Luôn biết đơn đăng ký của bạn đang ở đâu trong quy trình xử lý.</Card.Text>
                <Button variant="outline-primary" size="sm">Tìm hiểu thêm</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} key={3}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Quản Lý Cá Nhân Hóa</Card.Title>
                <Card.Text>Theo dõi tiến trình tốt nghiệp cá nhân, xem trạng thái hồ sơ, và nhận thông báo phù hợp với từng sinh viên.
                </Card.Text>
                <Button variant="outline-primary" size="sm">Tìm hiểu thêm</Button>
              </Card.Body>
            </Card>
          </Col>
    
      </Row>
    </Container>
  </section>
);

export default FeatureCards;
