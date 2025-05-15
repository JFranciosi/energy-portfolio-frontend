
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
  SidebarRail
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Home, BarChart, Mail, Briefcase, User, LogIn, DollarSign, UserPlus } from 'lucide-react';

export const AppSidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { title: 'Home', path: '/', icon: Home },
    { title: 'Dashboard', path: '/dashboard', icon: BarChart },
    { title: 'Servizi', path: '/services', icon: Briefcase },
    { title: 'Contatti', path: '/contact', icon: Mail },
    { title: 'Profilo', path: '/profile', icon: User },
  ];

  // Energy portfolio items
  const portfolioItems = [
    { title: 'Overview', path: '/energy-portfolio', icon: BarChart },
    { title: 'Dashboard', path: '/energy-portfolio/dashboard', icon: BarChart },
    { title: 'Costi', path: '/energy-portfolio/costs', icon: DollarSign },
    { title: 'Upload Bollette', path: '/energy-portfolio/upload', icon: Briefcase },
    { title: 'Futures', path: '/energy-portfolio/futures', icon: BarChart },
    { title: 'Crea Utente', path: '/energy-portfolio/create-user', icon: UserPlus },
  ];

  return (
    <Sidebar>
      <SidebarRail />
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <Logo />
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Energy Portfolio Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Energy Portfolio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {portfolioItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive('/auth')}
              tooltip="Accedi"
            >
              <Link to="/auth">
                <LogIn />
                <span>Accedi</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
