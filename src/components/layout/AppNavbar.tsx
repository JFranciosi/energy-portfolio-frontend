import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const AppNavbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/services", label: "Servizi" },
    { path: "/contact", label: "Contatti" },
  ];

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/f33dc69c-12e2-4b05-a3eb-b3073381d202.png"
              alt="Mies - your daily energy!"
              className="h-16 w-auto"
            />
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.path
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Bottone Area Clienti */}
            <Button asChild className="ml-4">
              <Link to="/auth">Area Clienti</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
