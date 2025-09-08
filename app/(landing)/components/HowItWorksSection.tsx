'use client';

import AnimatedSection from './AnimatedSection';

const steps = [
  {
    number: '1',
    title: 'GitHub 연결',
    description: 'GitHub 레포지토리를 Otto와 연결하여 시작하세요',
    delay: 100,
  },
  {
    number: '2',
    title: '파이프라인 설계',
    description: '시각적 빌더로 원하는 워크플로우를 구성하세요',
    delay: 200,
  },
  {
    number: '3',
    title: '자동 배포',
    description: '코드를 푸시하면 Otto가 자동으로 빌드하고 배포합니다',
    delay: 300,
  },
];

export default function HowItWorksSection() {
  return (
    <section id='how-it-works' className='py-20 border-t border-gray-800'>
      <div className='container mx-auto px-6 max-w-6xl'>
        <AnimatedSection>
          <div className='text-center mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold mb-4 text-gray-900'>
              <span className='bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent'>
                간단한 3단계
              </span>
            </h2>
            <p className='text-gray-600 text-lg'>
              Otto로 CI/CD 파이프라인을 설정하는 것은 매우 간단합니다
            </p>
          </div>
        </AnimatedSection>

        <div className='grid sm:grid-cols-3 gap-8'>
          {steps.map((step) => (
            <AnimatedSection key={step.number} delay={step.delay}>
              <div className='text-center'>
                <div className='mb-6 mx-auto w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center text-2xl font-bold text-white'>
                  {step.number}
                </div>
                <h3 className='text-xl font-semibold mb-3 text-gray-900'>{step.title}</h3>
                <p className='text-gray-700'>{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}