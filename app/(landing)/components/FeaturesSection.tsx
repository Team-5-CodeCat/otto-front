'use client';

import { Zap, Shield, BarChart3, CheckCircle, Workflow, Rocket, Eye } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const features = [
  {
    icon: Zap,
    title: '스마트 트리거',
    description:
      'Git Push, PR, 스케줄 등 다양한 이벤트를 감지하여 자동으로 파이프라인을 시작합니다.',
    color: 'blue',
    stats: '99.9% 정확도',
  },
  {
    icon: Workflow,
    title: '조건부 실행',
    description:
      '브랜치, 파일 변경사항, 시간 등의 조건을 확인하여 필요할 때만 파이프라인을 실행합니다.',
    color: 'purple',
    stats: '50% 리소스 절약',
  },
  {
    icon: Rocket,
    title: '빠른 배포',
    description: 'Build → Test → Deploy 단계를 순서대로 실행하며, 실패 시 자동으로 중단됩니다.',
    color: 'emerald',
    stats: '평균 10초',
  },
  {
    icon: Shield,
    title: '보안 강화',
    description: '모든 단계에서 보안 검사를 수행하고, 취약점을 사전에 차단합니다.',
    color: 'red',
    stats: '100% 보안 검증',
  },
  {
    icon: BarChart3,
    title: '실시간 모니터링',
    description: '파이프라인의 모든 단계를 실시간으로 모니터링하고 성능을 분석합니다.',
    color: 'orange',
    stats: '24/7 모니터링',
  },
  {
    icon: Eye,
    title: '투명한 가시성',
    description: '모든 빌드와 배포 과정을 투명하게 추적하고 로그를 제공합니다.',
    color: 'indigo',
    stats: '100% 추적 가능',
  },
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    accent: 'text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    accent: 'text-purple-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    accent: 'text-emerald-700',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    accent: 'text-red-700',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    accent: 'text-orange-700',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'text-indigo-600',
    accent: 'text-indigo-700',
  },
};

export default function FeaturesSection() {
  return (
    <section className='py-24 bg-white'>
      <div className='container mx-auto px-6 max-w-7xl'>
        {/* Header */}
        <AnimatedSection>
          <div className='text-center mb-20'>
            <div className='inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-200/50 rounded-full px-4 py-2 mb-6'>
              <CheckCircle className='w-4 h-4 text-emerald-500' />
              <span className='text-sm font-medium text-emerald-700'>핵심 기능</span>
            </div>

            <h2 className='text-4xl sm:text-5xl font-bold mb-6 text-gray-900'>
              개발팀이 사랑하는
              <br />
              <span className='bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent'>
                스마트한 기능들
              </span>
            </h2>

            <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
              Otto는 복잡한 CI/CD 과정을 간소화하고 자동화하여 개발팀이 코드 작성에만 집중할 수
              있도록 돕습니다.
            </p>
          </div>
        </AnimatedSection>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            const Icon = feature.icon;

            return (
              <AnimatedSection key={feature.title} delay={index * 100 + 200}>
                <div className='group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100/50 hover:-translate-y-1'>
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>

                  {/* Content */}
                  <h3 className='text-xl font-bold text-gray-900 mb-3'>{feature.title}</h3>

                  <p className='text-gray-600 mb-4 leading-relaxed'>{feature.description}</p>

                  {/* Stats */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 ${colors.bg} rounded-full`}
                  >
                    <div
                      className={`w-2 h-2 ${colors.bg} rounded-full ${colors.icon.replace('text-', 'bg-')}`}
                    ></div>
                    <span className={`text-sm font-medium ${colors.accent}`}>{feature.stats}</span>
                  </div>

                  {/* Hover Effect */}
                  <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <AnimatedSection delay={800}>
          <div className='text-center mt-16'>
            <div className='inline-flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-lg'>
              <div className='flex -space-x-2'>
                <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full border-2 border-white'></div>
                <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white'></div>
                <div className='w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white'></div>
              </div>
              <div className='text-left'>
                <p className='text-sm font-medium text-gray-900'>1,000+ 개발팀이 사용 중</p>
                <p className='text-xs text-gray-500'>매일 10,000+ 배포 성공</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
