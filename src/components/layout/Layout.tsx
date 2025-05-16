
import React from 'react';
import { AppSidebar } from './AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LegalFooter } from '@/components/legal/LegalFooter';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const getBreadcrumbItems = (pathname: string) => {
  const parts = pathname.split('/').filter(p => p);
  const breadcrumbs = [];
  
  // Always add home
  breadcrumbs.push({
    label: 'Home',
    path: '/',
    isActive: parts.length === 0
  });
  
  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const isLast = index === parts.length - 1;
    
    // Format label to be more readable
    let label = part.replace(/-/g, ' ');
    label = label.charAt(0).toUpperCase() + label.slice(1);
    
    breadcrumbs.push({
      label,
      path: currentPath,
      isActive: isLast
    });
  });
  
  return breadcrumbs;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const breadcrumbItems = getBreadcrumbItems(pathname);
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
            <Breadcrumb className="mb-4 pl-2">
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.path}>
                    <BreadcrumbItem>
                      {item.isActive ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <a href={item.path}>{item.label}</a>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            {children}
          </div>
        </div>
        <LegalFooter />
      </SidebarInset>
    </div>
  );
};

export default Layout;
