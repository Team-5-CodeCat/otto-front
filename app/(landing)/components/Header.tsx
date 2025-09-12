'use client';

import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { Cpu, Menu, X } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled && 'bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm'
      )}
    >
      <div className='container mx-auto px-6'>
        <div className='flex items-center justify-between py-4'>
          <div className='flex items-center space-x-2'>
            <div className='bg-gradient-to-r from-emerald-600 to-emerald-500 p-2 rounded-xl'>
              <Cpu className='w-6 h-6 text-white' />
            </div>
            <span className='text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent'>
              Otto
            </span>
          </div>

          {/* Desktop Nav - Empty for now */}
          <nav className='hidden md:flex items-center gap-4'>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='md:hidden text-gray-300 hover:text-white p-2'
          >
            {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200'>
          <nav className='flex flex-col space-y-4 p-6'>
            {/* Empty for now */}
          </nav>
        </div>
      )}
    </header>
  );
}
