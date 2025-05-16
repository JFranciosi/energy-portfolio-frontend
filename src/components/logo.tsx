
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
      <div className="h-8 flex items-center">
        <img 
          src="/lovable-uploads/17334720-efab-4229-b74d-449ed9fe1b14.png" 
          alt="Mies Logo" 
          className="h-full object-contain"
        />
      </div>
      {!collapsed && (
        <span className={cn("ml-2 font-semibold text-lg", textColor)}>
          {/* Logo image already includes the text "Mies" */}
        </span>
      )}
    </div>
  );
}
