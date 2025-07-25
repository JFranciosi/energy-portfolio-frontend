import React from 'react';
import AppNavbar from './AppNavbar';
import { LegalFooter } from '@/components/legal/LegalFooter';

interface LayoutPublicProps {
  children: React.ReactNode;
}

const LayoutPublic: React.FC<LayoutPublicProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen max-w-[1920px] mx-auto">
      {/* Navbar */}
      <header className="bg-white border-b border-border">
        <AppNavbar />
      </header>

      {/* Main content */}
      <main className="flex-grow mx-auto w-full max-w-[1920px]">
        {children}
      </main>

      {/* Footer */}
      <footer>
        <LegalFooter maxWidth="1920px" paddingY="3rem" />
      </footer>
    </div>
  );
};

export default LayoutPublic;
