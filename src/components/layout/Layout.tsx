
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
        <div className="flex-grow w-full max-w-full overflow-x-hidden">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </div>
        <LegalFooter />
      </SidebarInset>
    </div>
  );
};

export default Layout;
