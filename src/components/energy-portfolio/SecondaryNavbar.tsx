
import React from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
}

interface SecondaryNavbarProps {
  items: NavItem[];
  activeItemId: string;
  onItemClick: (id: string) => void;
  className?: string;
}

export const SecondaryNavbar = ({
  items,
  activeItemId,
  onItemClick,
  className
}: SecondaryNavbarProps) => {
  return (
    <nav className={cn("border-b border-border mb-6", className)}>
      <div className="flex overflow-x-auto hide-scrollbar">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              "px-4 py-3 text-sm font-medium relative transition-colors",
              "whitespace-nowrap",
              activeItemId === item.id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {activeItemId === item.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-fade-in" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
