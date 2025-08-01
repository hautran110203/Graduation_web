import React from 'react';
import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import StatsSection from '../components/StatsSection';
import ImagePlaceholder from '../components/ImagePlaceholder';
import UpcomingEventCarousel from '../components/UpcomingEvents';
import AboutSection from '../components/AboutSection';

const HomePage: React.FC = () => (
  <>
    <HeroSection />
    <AboutSection/>
    <UpcomingEventCarousel/>
    <FeatureCards />
    <StatsSection />
    <ImagePlaceholder />

  </>
);

export default HomePage;
