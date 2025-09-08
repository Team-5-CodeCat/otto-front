import FloatingParticles from './FloatingParticles';

export default function BackgroundElements() {
  return (
    <>
      {/* Gradient Background */}
      <div className='absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-gray-50' />

      {/* Grid Pattern */}
      <div
        className='absolute inset-0 opacity-20'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(0,0,0,0.02)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating Particles */}
      <FloatingParticles />
    </>
  );
}