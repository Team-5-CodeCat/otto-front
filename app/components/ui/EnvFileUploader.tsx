'use client';

import React, { useRef, useState } from 'react';
import { Upload, File, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnvFileUploaderProps {
  onFileUpload: (envVars: Record<string, string>, file: File) => void;
  onFileRemove?: () => void;
  uploadedFile?: File | null;
  className?: string;
}

export const EnvFileUploader: React.FC<EnvFileUploaderProps> = ({
  onFileUpload,
  onFileRemove,
  uploadedFile: propUploadedFile,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // prop으로 받은 파일이 있으면 사용, 없으면 로컬 상태 사용
  const uploadedFile = propUploadedFile;

  // .env 파일 파싱 함수
  const parseEnvFile = (content: string): Record<string, string> => {
    const envVars: Record<string, string> = {};
    const lines = content.split('\n');

    lines.forEach((line, _index) => {
      // 빈 줄이나 주석 줄 무시
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }

      // KEY=VALUE 형식 파싱
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        let value = trimmedLine.substring(equalIndex + 1).trim();
        
        // 따옴표 제거
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        if (key) {
          envVars[key] = value;
        }
      }
    });

    return envVars;
  };

  // 파일 처리 함수
  const handleFile = async (file: File) => {
    if (!file.name.includes('.env')) {
      alert('Please upload a file containing ".env" in the filename');
      return;
    }

    setIsUploading(true);

    try {
      const content = await file.text();
      const envVars = parseEnvFile(content);
      
      if (Object.keys(envVars).length === 0) {
        alert('No valid environment variables found in the file');
        return;
      }

      onFileUpload(envVars, file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading the file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  // 파일 제거
  const clearFile = () => {
    if (onFileRemove) {
      onFileRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 파일 선택 버튼 클릭
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn(className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".env,.env.local,.env.production,.env.staging,.env.development"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!uploadedFile ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer',
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload 
              size={24} 
              className={cn(isDragOver ? 'text-blue-500' : 'text-gray-400')} 
            />
            <div className="text-sm">
              <p className={cn('font-medium', isDragOver ? 'text-blue-600' : 'text-gray-600')}>
                {isDragOver ? 'Drop .env file here' : 'Upload .env file'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Click to browse or drag and drop
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <File size={16} className="text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {isUploading ? 'Processing...' : 'Ready to apply'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isUploading && (
                <Check size={16} className="text-green-500" />
              )}
              <button
                onClick={clearFile}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Remove file"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvFileUploader;
