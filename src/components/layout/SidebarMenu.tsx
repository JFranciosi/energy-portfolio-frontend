import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SidebarMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/services", label: "Servizi" },
    { path: "/contact", label: "Contatti" },
  ];

  const closeMenu = useCallback(() => setOpen(false), []);
  const toggleMenu = useCallback(() => setOpen((v) => !v), []);

  // Chiudi quando cambia route
  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  // ESC per chiudere + blocco scroll body + focus sul primo link
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      const originalOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      setTimeout(() => firstLinkRef.current?.focus(), 0);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.documentElement.style.overflow = originalOverflow;
      };
    }
  }, [open, closeMenu]);

  // swipe to close (verso destra)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    if (delta > 48) {
      closeMenu();
      touchStartX.current = null;
    }
  };
  const onTouchEnd = () => {
    touchStartX.current = null;
  };

  return (
    <>
      {/* Pulsante hamburger (solo mobile) */}
      <button
        onClick={toggleMenu}
        aria-label={open ? "Chiudi menu" : "Apri menu"}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        className="fixed top-4 right-4 z-50 md:hidden text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu di navigazione"
        className={cn(
          "fixed top-0 right-0 z-50 h-[100dvh] w-[88vw] max-w-80 md:hidden",
          "bg-background border-l border-border shadow-xl",
          "transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header con logo e close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <img
              src="/lovable-uploads/f33dc69c-12e2-4b05-a3eb-b3073381d202.png"
              alt="Mies"
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={closeMenu}
            className="p-2 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Chiudi menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100dvh-4rem)]">
          <nav className="flex-1 px-3 py-3 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item, idx) => {
                const active = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      ref={idx === 0 ? firstLinkRef : undefined}
                      to={item.path}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-md text-[15px] font-medium",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-1 rounded-full",
                          active ? "bg-primary" : "bg-transparent"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Divider */}
            <div className="my-4 border-t border-border/70" />

            {/* CTA */}
            <div className="px-1">
              <Button asChild className="w-full justify-center">
                <Link to="/auth" onClick={closeMenu}>
                  Area Clienti
                </Link>
              </Button>
            </div>
          </nav>

          {/* Footer sempre in basso */}
          <div className="px-3 py-4 text-xs text-muted-foreground/80 border-t border-border">
            © {new Date().getFullYear()} Mies — your daily energy!
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
