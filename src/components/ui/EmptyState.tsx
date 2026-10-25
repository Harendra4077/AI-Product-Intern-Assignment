import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-[#E7EDE4] flex items-center justify-center mb-4">
        {icon ?? <Calendar size={28} className="text-[#718B73]" aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-bold text-[#26352E] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#788078] max-w-xs mb-6 leading-relaxed">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-[#C76C64]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-[#26352E] mb-2">{title}</h3>
      <p className="text-sm text-[#788078] max-w-xs mb-6 leading-relaxed">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="md">
          Try again
        </Button>
      )}
    </div>
  );
}
