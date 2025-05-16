
import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
  variant?: 'default' | 'light';
}

export function Logo({ className, collapsed = false, variant = 'default' }: LogoProps) {
  const logoColor = variant === 'light' ? 'text-white bg-white/20' : 'text-accent-foreground bg-accent';
  const textColor = variant === 'light' ? 'text-white' : 'text-sidebar-foreground';
  
  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="/lovable-uploads/5f4bb6f8-1237-4027-8821-15add583dd7d.png" 
        alt="Mies Logo" 
        className="h-8 w-auto"
      />
      {!collapsed && (
        <span className={cn("ml-2 font-semibold text-lg", textColor)}>
          Mies
        </span>
      )}
    </div>
  );
}
