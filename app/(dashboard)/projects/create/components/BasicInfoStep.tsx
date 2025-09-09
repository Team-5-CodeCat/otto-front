'use client';

import React from 'react';
import { Card, Button, Input, Select } from '@/app/components/ui';
import type { ProjectBasicInfo } from '../hooks/useProjectCreation';

interface BasicInfoStepProps {
  basicInfo: ProjectBasicInfo;
  onBasicInfoChange: (info: Partial<ProjectBasicInfo>) => void;
  onNext: () => void;
  canProceed: boolean;
}

const LANGUAGE_OPTIONS = [
  { label: 'Node.js', value: 'node.js' as const },
  // { label: 'Python', value: 'python' as const },
];

const DEPLOY_OPTIONS = [{ label: 'Amazon EC2', value: 'EC2' as const }];

export function BasicInfoStep({
  basicInfo,
  onBasicInfoChange,
  onNext,
  canProceed,
}: BasicInfoStepProps) {
  const handleInputChange = (field: keyof ProjectBasicInfo, value: string) => {
    onBasicInfoChange({ [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      onNext();
    }
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Project Basic Information</h1>
        <p className='text-gray-600'>
          Please enter the basic information for your new CI/CD project.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className='p-8 space-y-6'>
          {/* Project Name */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-3'>Project Name *</label>
            <Input
              value={basicInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder='my-awesome-project'
              className='w-full'
              required
            />
            <p className='text-sm text-gray-500 mt-2'>Enter a name that identifies your project.</p>
          </div>

          {/* Development Language */}
          <div>
            <Select
              label='Development Language/Framework *'
              value={basicInfo.language}
              onChange={(e) =>
                handleInputChange('language', e.target.value as ProjectBasicInfo['language'])
              }
              options={LANGUAGE_OPTIONS}
              className='w-full'
            />
            <p className='text-sm text-gray-500 mt-2'>
              Select the main development language or framework for your project.
            </p>
          </div>

          {/* Deployment Environment */}
          <div>
            <Select
              label='Deployment Environment *'
              value={basicInfo.deploy}
              onChange={(e) =>
                handleInputChange('deploy', e.target.value as ProjectBasicInfo['deploy'])
              }
              options={DEPLOY_OPTIONS}
              className='w-full'
            />
            <p className='text-sm text-gray-500 mt-2'>
              Select the environment where your built application will be deployed.
            </p>
          </div>
        </Card>

        {/* Navigation Button */}
        <div className='flex justify-end mt-8'>
          <Button
            type='submit'
            disabled={!canProceed}
            className='bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-8 py-2'
          >
            Next Step
          </Button>
        </div>
      </form>
    </div>
  );
}
