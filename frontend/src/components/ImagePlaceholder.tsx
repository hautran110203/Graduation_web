import React from 'react';
import { Container } from 'react-bootstrap';

const ImagePlaceholder: React.FC = () => (
  <section className="py-5 bg-light text-center">
    <Container>
      <div style={{ backgroundColor: '#adb5bd', height: '250px' }} className="rounded mx-auto w-100" />
    </Container>
  </section>
);

export default ImagePlaceholder;
