
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Badge } from '../ui/badge';

export function Header() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border h-16 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-medium">Energy Dashboard</h1>
        <p className="text-sm text-muted-foreground">{currentDate}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 h-9 w-64 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        
        <div className="relative">
          <Bell size={20} />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-xs">
            3
          </Badge>
        </div>
      </div>
    </header>
  );
}
