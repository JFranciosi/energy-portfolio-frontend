
import React from 'react';
import { AppSidebar } from './AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { LegalFooter } from '@/components/legal/LegalFooter';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <div className="flex-grow">
          {children}
        </div>
        <LegalFooter />
      </SidebarInset>
    </div>
  );
};

export default Layout;
