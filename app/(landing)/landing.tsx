import dynamic from 'next/dynamic';

const FakeGlowCanvas = dynamic(() => import('@/app/(landing)/components/three/FakeGlowCanvas'), {
  ssr: false,
});

export default function Landing() {
  return (
    <div className='relative min-h-screen w-screen overflow-hidden'>
      <FakeGlowCanvas centerType='text' centerText='Otto' centerSize={7} />
    </div>
  );
}
