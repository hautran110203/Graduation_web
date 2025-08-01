import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

const DefaultLayout: React.FC = () => (
  <div className="d-flex flex-column min-vh-100">
    <Header />
    <main className="flex-grow-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default DefaultLayout;
