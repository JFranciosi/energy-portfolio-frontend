
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsibleSidebarProps {
  children: React.ReactNode;
  title: string;
  defaultCollapsed?: boolean;
  className?: string;
}

export const CollapsibleSidebar = ({ 
  children, 
  title, 
  defaultCollapsed = false, 
  className 
}: CollapsibleSidebarProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div 
      className={cn(
        "flex flex-col h-full border-l border-border bg-card",
        "transition-all duration-300", 
        collapsed ? "w-16" : "w-80",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && <h3 className="font-medium truncate">{title}</h3>}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto rounded-full h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className={cn(
        "flex-1 overflow-y-auto p-4",
        collapsed && "items-center justify-center"
      )}>
        {collapsed ? null : children}
      </div>
    </div>
  );
};
