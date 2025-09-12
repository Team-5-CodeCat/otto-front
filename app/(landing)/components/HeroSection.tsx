'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Zap } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import BackgroundFlow from './BackgroundFlow';

export default function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/signin');
  };

  return (
    <section className='relative pt-24 pb-12 px-6 overflow-hidden'>
      {/* Background Gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50'></div>

      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <svg className='w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <defs>
            <pattern
              id='hero-pattern'
              x='0'
              y='0'
              width='20'
              height='20'
              patternUnits='userSpaceOnUse'
            >
              <circle cx='2' cy='2' r='1' fill='#3b82f6' fillOpacity='0.1' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#hero-pattern)' />
        </svg>
      </div>

      <div className='relative w-full'>
        {/* Combined Title and Flow Section */}
        <AnimatedSection delay={200}>
          <div className='relative'>
            {/* Background Flow (Full Width) */}
            <div className='w-full'>
              <BackgroundFlow />
            </div>

            {/* Otto Title Overlay */}
            <div className='absolute inset-0 flex items-start justify-end pt-8 sm:pt-12 lg:pt-16 pr-8 sm:pr-12 lg:pr-16 pointer-events-none'>
              {/* <h1 className='text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tighter text-right'>
                <span className='bg-gradient-to-r from-blue-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent bg-size-200 animate-gradient drop-shadow-lg'>
                  Otto
                </span>
              </h1> */}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Buttons */}
        <AnimatedSection delay={450}>
          <div className='flex justify-center mt-8 mb-16'>
            <button
              onClick={handleGetStarted}
              className='group bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3 transform hover:scale-105'
            >
              <Zap className='w-5 h-5' />
              Start Now
              <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
            </button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
