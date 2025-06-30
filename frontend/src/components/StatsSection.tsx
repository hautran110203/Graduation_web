import React from 'react';
import { Container, Row, Col,} from 'react-bootstrap';

const StatsSection: React.FC = () => (
  <section className="py-5">
    <Container>
      <Row>
        <Col md={6}>
          <h4>Your Graduation Journey Starts Here</h4>
          <p>Join thousands of students who have successfully registered for graduation.</p>
        </Col>
        <Col md={6} className="d-flex justify-content-around">
          <div>
            <h2>95%</h2>
            <p>Successful Registration</p>
          </div>
          <div>
            <h2>99%</h2>
            <p>User Satisfaction</p>
          </div>
        </Col>
      </Row>
    </Container>
  </section>
);

export default StatsSection;
