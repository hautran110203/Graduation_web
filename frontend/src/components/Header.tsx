import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const Header: React.FC = () => (
  <Navbar bg="light" expand="lg">
    <Container>
      <Navbar.Brand href="#">Logo</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav className="ms-auto">
          <Nav.Link href="#">Trang chủ</Nav.Link>
          <Nav.Link href="#">Hướng dẫn</Nav.Link>
          <Nav.Link href="#">Đăng kí tốt nghiệp</Nav.Link>
          <Nav.Link href="#">Lịch trình</Nav.Link>
          <Button variant="outline-primary" className="ms-3">Đăng nhập</Button>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default Header;
