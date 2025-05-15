
import React, { useState } from 'react';
import { 
  BarChart, 
  Bell, 
  CalendarClock, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Map, 
  Settings, 
  Thermometer,
  Info
} from 'lucide-react';
import { Logo } from '../logo';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, active, collapsed, onClick }: NavItemProps) => {
  return (
    <li className="mb-2">
      <button 
        onClick={onClick}
        className={cn(
          "w-full flex items-center px-3 py-2 rounded-md text-sidebar-foreground transition-colors",
          active 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "hover:bg-sidebar-accent/50"
        )}
      >
        <Icon size={20} className={active ? "text-accent" : ""} />
        {!collapsed && <span className="ml-3">{label}</span>}
      </button>
    </li>
  );
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const isMobile = useIsMobile();
  
  // On mobile, sidebar should be collapsed by default
  React.useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'consumption', label: 'Consumption', icon: Thermometer },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'schedule', label: 'Schedule', icon: CalendarClock },
    { id: 'zones', label: 'Zones', icon: Map },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: Info },
  ];

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <Logo collapsed={collapsed} />
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-sidebar-accent text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul>
          {navItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeItem === item.id}
              collapsed={collapsed}
              onClick={() => setActiveItem(item.id)}
            />
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-accent-foreground">
            UA
          </div>
          {!collapsed && (
            <div className="ml-3">
              <div className="text-sm font-medium text-sidebar-foreground">User Admin</div>
              <div className="text-xs text-sidebar-foreground/70">admin@company.com</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
