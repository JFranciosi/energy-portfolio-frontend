
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
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Home, Mail, Briefcase, User, LogIn, BarChart3, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const AppSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { title: 'Home', path: '/', icon: Home },
    { title: 'Servizi', path: '/services', icon: Briefcase },
    { title: 'Contatti', path: '/contact', icon: Mail },
    { title: 'Energy Portfolio', path: '/energy-portfolio', icon: BarChart3 },
    { title: 'Crea Utente', path: '/energy-portfolio/create-user', icon: User },
    { title: 'Profilo', path: '/profile', icon: User },
  ];

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "none"} className={!isMobile ? "fixed left-0 top-0 h-screen z-30" : ""}>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <Logo />
          {isMobile && <SidebarTrigger className="md:block lg:hidden" />}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="overflow-y-auto">
        {/* Login Button - Now positioned at the top */}
        <SidebarMenu className="mb-4">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive('/auth')}
              tooltip="Accedi"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/auth">
                <LogIn />
                <span>Accedi</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
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
      </SidebarContent>
      
      <SidebarFooter>
        {/* Footer content if needed */}
      </SidebarFooter>
    </Sidebar>
  );
};
