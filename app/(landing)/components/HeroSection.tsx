'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import BackgroundFlow from './BackgroundFlow';

export default function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/signin');
  };

  return (
    <section className='pt-32 pb-20 px-6'>
      <div className='container mx-auto max-w-6xl'>
        <div className='text-center'>
          {/* Main Title */}
          <AnimatedSection delay={200}>
            <h1 className='text-3xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight'>
              <span className='text-gray-900 font-bold'>복잡한 CI/CD는 그만.</span>
              <br />
              <span className='bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent'>
                Otto와 함께
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <p className='text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto px-4'>
              누구나 쉽게 CI/CD를 구성하다.
            </p>
          </AnimatedSection>

          {/* Pipeline Flow Visualization */}
          <AnimatedSection delay={350}>
            <div className='mb-12'>
              <BackgroundFlow />
            </div>
          </AnimatedSection>

          {/* CTA Buttons */}
          <AnimatedSection delay={400}>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <button
                onClick={handleGetStarted}
                className='group bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 flex items-center gap-2'
              >
                Start Now
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}