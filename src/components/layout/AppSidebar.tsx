
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Home, Mail, Briefcase, User, LogIn, FileText, TrendingUp, BarChart3 } from 'lucide-react';

export const AppSidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isSubActive = (paths: string[]) => paths.some(path => location.pathname.includes(path));

  const menuItems = [
    { title: 'Home', path: '/', icon: Home },
    { title: 'Servizi', path: '/services', icon: Briefcase },
    { title: 'Contatti', path: '/contact', icon: Mail },
    { title: 'Profilo', path: '/profile', icon: User },
  ];

  // Energy portfolio items
  const portfolioItems = [
    { title: 'Overview', path: '/energy-portfolio', icon: BarChart3 },
    { title: 'Bollette', path: '/energy-portfolio/upload', icon: FileText },
    { title: 'Dashboard', path: '/energy-portfolio/dashboard', icon: BarChart3 },
    { title: 'Costi', path: '/energy-portfolio/costs', icon: FileText },
    { title: 'Futures', path: '/energy-portfolio/futures', icon: TrendingUp },
    { title: 'Crea Utente', path: '/energy-portfolio/create-user', icon: User },
  ];

  return (
    <Sidebar collapsible="none">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <Logo />
          <SidebarTrigger className="md:hidden" />
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

              {/* Energy Portfolio Section with Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={isSubActive(['/energy-portfolio'])}
                  tooltip="Energy Portfolio"
                >
                  <BarChart3 />
                  <span>Energy Portfolio</span>
                </SidebarMenuButton>
                
                <SidebarMenuSub>
                  {portfolioItems.map((item) => (
                    <SidebarMenuSubItem key={item.path}>
                      <SidebarMenuSubButton 
                        asChild 
                        isActive={isActive(item.path)}
                      >
                        <Link to={item.path}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
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
