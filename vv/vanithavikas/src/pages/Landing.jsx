import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default Landing;