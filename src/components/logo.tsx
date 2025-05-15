
import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-bold">
        EM
      </div>
      {!collapsed && (
        <span className="ml-2 text-sidebar-foreground font-semibold text-lg">
          EnergyMon
        </span>
      )}
    </div>
  );
}
