'use client';

import React from 'react';
import { Check, X, Circle, ChevronRight } from 'lucide-react';
import { PipelineStage } from './types';
import { formatTimestamp } from './utils/timeUtils';

interface PipelineTimelineProps {
  stages: PipelineStage[];
  isCompact?: boolean;
  showDurations?: boolean;
}

const PipelineTimeline: React.FC<PipelineTimelineProps> = ({ 
  stages, 
  isCompact = false, 
  showDurations = true 
}) => {
  const getStageIcon = (status: PipelineStage['status']) => {
    const iconClasses = 'w-4 h-4';
    
    switch (status) {
      case 'SUCCESS':
        return <Check className={`${iconClasses} text-green-600`} />;
      case 'FAILED':
        return <X className={`${iconClasses} text-red-600`} />;
      case 'IN_PROGRESS':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'PENDING':
        return <Circle className={`${iconClasses} text-gray-400`} />;
      default:
        return <Circle className={`${iconClasses} text-gray-400`} />;
    }
  };

  const getStageStatusClass = (status: PipelineStage['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'FAILED':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'IN_PROGRESS':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'PENDING':
        return 'bg-gray-50 border-gray-200 text-gray-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getConnectorClass = (status: PipelineStage['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-300';
      case 'FAILED':
        return 'bg-red-300';
      case 'IN_PROGRESS':
        return 'bg-blue-300';
      default:
        return 'bg-gray-300';
    }
  };

  if (isCompact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Pipeline Progress</h3>
        
        <div className="flex items-start gap-2">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.stage}>
              {/* 스테이지 컨테이너 */}
              <div className="flex flex-col items-center gap-2 relative">
                {/* 스테이지 아이콘 */}
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${getStageStatusClass(stage.status)}
                `}>
                  {getStageIcon(stage.status)}
                </div>
                
                {/* 스테이지 이름 */}
                <div className="text-xs text-gray-600 text-center min-w-0">
                  {stage.stage.split(' ')[0]} {/* 첫 단어만 표시 */}
                </div>
              </div>
              
              {/* 연결선 (마지막이 아닌 경우) - 노드 중앙 높이에 위치 */}
              {index < stages.length - 1 && (
                <div className="flex-1 flex items-center" style={{ height: '32px' }}>
                  <div className={`w-full h-0.5 ${getConnectorClass(stage.status)}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stages</h3>
      
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.stage} className="relative">
            {/* 연결선 (첫 번째가 아닌 경우) */}
            {index > 0 && stages[index - 1] && (
              <div className={`
                absolute left-4 -top-4 w-0.5 h-4 
                ${getConnectorClass(stages[index - 1]!.status)}
              `} />
            )}
            
            <div className="flex items-start gap-4">
              {/* 스테이지 아이콘 */}
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0
                ${getStageStatusClass(stage.status)}
              `}>
                {getStageIcon(stage.status)}
              </div>
              
              {/* 스테이지 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{stage.stage}</h4>
                  {showDurations && (
                    <span className="text-sm font-mono text-gray-600">
                      {stage.duration}
                    </span>
                  )}
                </div>
                
                {/* 상태 배지 */}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${getStageStatusClass(stage.status)}
                  `}>
                    {stage.status.replace('_', ' ')}
                  </span>
                  
                  {/* 시간 정보 */}
                  <div className="text-xs text-gray-500">
                    {formatTimestamp(stage.startTime, 'time')}
                    {stage.endTime && (
                      <>
                        <ChevronRight className="w-3 h-3 inline mx-1" />
                        {formatTimestamp(stage.endTime, 'time')}
                      </>
                    )}
                  </div>
                </div>
                
                {/* 추가 세부사항 (실패한 경우 등) */}
                {stage.status === 'FAILED' && (
                  <div className="mt-2 text-xs text-red-700 bg-red-50 rounded p-2">
                    Stage failed - check logs for details
                  </div>
                )}
                
                {stage.status === 'IN_PROGRESS' && (
                  <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded p-2">
                    Currently running...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 전체 파이프라인 요약 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {stages.filter(s => s.status === 'SUCCESS').length} of {stages.length} stages completed
          </span>
          {showDurations && (
            <span className="font-mono">
              Total: {calculateTotalDuration(stages)}
            </span>
          )}
        </div>
        
        {/* 진행률 바 */}
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(stages.filter(s => s.status === 'SUCCESS').length / stages.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

// 전체 소요 시간 계산 헬퍼 함수
const calculateTotalDuration = (stages: PipelineStage[]): string => {
  const completedStages = stages.filter(s => s.endTime);
  if (completedStages.length === 0) return '0s';
  
  const totalSeconds = completedStages.reduce((acc, stage) => {
    const duration = stage.duration;
    const match = duration.match(/(\d+)([hms])/g);
    if (!match) return acc;
    
    return match.reduce((stageAcc, part) => {
      const value = parseInt(part.slice(0, -1));
      const unit = part.slice(-1);
      
      switch (unit) {
        case 'h': return stageAcc + (value * 3600);
        case 'm': return stageAcc + (value * 60);
        case 's': return stageAcc + value;
        default: return stageAcc;
      }
    }, acc);
  }, 0);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export default PipelineTimeline;