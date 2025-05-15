
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type Status = 'success' | 'error' | 'loading' | 'idle';

interface StatusIndicatorProps {
  status: Status;
  text?: string;
  className?: string;
}

export const StatusIndicator = ({ status, text, className }: StatusIndicatorProps) => {
  const statusConfig = {
    success: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    loading: {
      icon: Loader2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    idle: {
      icon: null,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center px-3 py-1.5 rounded-full border",
      config.bgColor,
      config.borderColor,
      className
    )}>
      {Icon && (
        <Icon 
          className={cn(
            "h-4 w-4 mr-2", 
            config.color,
            status === 'loading' && "animate-spin"
          )} 
        />
      )}
      <span className={cn("text-sm font-medium", config.color)}>
        {text || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};
