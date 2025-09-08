import React from 'react';
import { cn } from '@/lib/utils';

// Card 컴포넌트의 props 타입 정의
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// Card 컴포넌트
const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-md border border-gray-200 p-6', className)}>
      {children}
    </div>
  );
};

// CardHeader 컴포넌트
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return <div className={cn('mb-4', className)}>{children}</div>;
};

// CardContent 컴포넌트
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={cn(className)}>{children}</div>;
};

// CardFooter 컴포넌트
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return <div className={cn('mt-6 pt-4 border-t border-gray-200', className)}>{children}</div>;
};

// Card 컴포넌트에 하위 컴포넌트들을 추가
const CardComponent = Object.assign(Card, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});

export default CardComponent;
