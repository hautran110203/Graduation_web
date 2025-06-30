import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EventList from '../components/EventList';



const EventPage: React.FC = () => (
  <>
    <Header />
    <EventList/>
    <Footer />
  </>
);

export default EventPage;