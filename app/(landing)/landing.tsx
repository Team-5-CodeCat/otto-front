'use client';

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import WorkflowSection from './components/WorkflowSection';
import HowItWorksSection from './components/HowItWorksSection';
import Footer from './components/Footer';
import BackgroundElements from './components/BackgroundElements';

export default function Landing() {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900 relative overflow-hidden'>
      {/* Background Elements */}
      <BackgroundElements />

      {/* Content Layer */}
      <div className='relative z-10'>
        <Header />
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <HowItWorksSection />
        <Footer />
      </div>
    </div>
  );
}
