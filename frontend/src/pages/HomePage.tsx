import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import StatsSection from '../components/StatsSection';
import ImagePlaceholder from '../components/ImagePlaceholder';
import Footer from '../components/Footer';

const HomePage: React.FC = () => (
  <>
    <Header />
    <HeroSection />
    <FeatureCards />
    <StatsSection />
    <ImagePlaceholder />
    <Footer />
  </>
);

export default HomePage;
