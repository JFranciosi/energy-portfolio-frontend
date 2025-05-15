
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  positive?: 'up' | 'down';
}

export function StatsCard({ 
  title, 
  value, 
  trend, 
  icon,
  valuePrefix = '', 
  valueSuffix = '',
  className,
  positive = 'down' // For energy consumption, down is typically positive
}: StatsCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {valuePrefix}{value}{valueSuffix}
        </div>
        
        {trend && (
          <div className="flex items-center mt-1 text-sm">
            <span className={cn(
              'flex items-center',
              trend.isPositive 
                ? (positive === 'up' ? 'text-energyAccent-success' : 'text-energyAccent-warning') 
                : (positive === 'up' ? 'text-energyAccent-warning' : 'text-energyAccent-success')
            )}>
              {trend.isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
