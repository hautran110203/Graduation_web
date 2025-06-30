import React from 'react';
import { Container, Row, Col} from 'react-bootstrap';

const Footer: React.FC = () => (
  <footer className="bg-dark text-light py-4 mt-5">
    <Container>
      <Row>
        <Col md={6}>          
        </Col>
        <Col md={6} className="text-end">
          <p className="mb-0">&copy; {new Date().getFullYear()} Graduation System</p>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
