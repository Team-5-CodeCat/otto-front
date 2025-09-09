import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='py-12 border-t border-gray-800'>
      <div className='container mx-auto px-6 max-w-6xl'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
          <div className='flex items-center space-x-2'>
            <div className='bg-gradient-to-r from-emerald-600 to-emerald-500 p-2 rounded-xl'>
              <Cpu className='w-5 h-5 text-white' />
            </div>
            <span className='text-lg font-bold text-gray-900'>Otto</span>
          </div>

          <div className='flex items-center gap-6 text-sm text-gray-700'>
            <a href='/privacy' className='hover:text-gray-900 transition-colors'>
              개인정보처리방침
            </a>
            <a href='/terms' className='hover:text-gray-900 transition-colors'>
              이용약관
            </a>
          </div>

          <div className='text-sm text-gray-700'>© 2025 Otto. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
