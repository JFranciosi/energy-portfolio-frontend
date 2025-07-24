
import React from 'react';
import { AppSidebar } from './AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LegalFooter } from '@/components/legal/LegalFooter';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col pl-0">
        <div className="flex-grow w-full max-w-full overflow-x-hidden">
          {isMobile && (
            <div className="p-2 flex items-center">
              <SidebarTrigger>
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
            </div>
          )}
          <div className="w-full px-0">
            {children}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default Layout;
