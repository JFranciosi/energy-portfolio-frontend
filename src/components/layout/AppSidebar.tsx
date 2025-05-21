
import React, {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
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
import {Logo} from '@/components/logo';
import {Home, Mail, Briefcase, User, LogIn, BarChart3, FileText, LogOut, DollarSign} from 'lucide-react';
import {useIsMobile} from '@/hooks/use-mobile';
import {Button} from '@/components/ui/button';

export const AppSidebar = () => {
    const PATH_DEV = "http://localhost:8081";
    const [accessoEffettuato, setAccessoEffettuato] = useState(false);
    const [error, setError] = useState('');
    const [categoriaUtente, setCategoriaUtente] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();
    const isMobile = useIsMobile();
    const isActive = (path: string) => location.pathname === path;

    const checkAccesso = async () => {
        try {
            const response = await fetch(`${PATH_DEV}/Autentication/check`, {
                method: 'GET',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'}
            });
            if (response.ok) {
                setAccessoEffettuato(true);
            } else {
                setError("Errore durante il controllo dell'accesso");
            }
        } catch (error) {
            setError("Errore di rete");
        }
    };

    const checkCategoria = async () => {
        try {
            const response = await fetch(`${PATH_DEV}/Autentication/checkCategoria`, {
                method: 'GET',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'}
            });

            if (response.ok) {
                const data = await response.json();
                setCategoriaUtente(data.tipologia);
            } else {
                setError("Errore durante il controllo della categoria");
            }
        } catch (error) {
            setError("Errore di rete");
        }
    };

    // Funzione di logout
    const logOut = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch(`${PATH_DEV}/Autentication/logout`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'}
            });
            if (response.ok) {
                window.location.href = "/";
            } else {
                const text = await response.text();
                console.log('Errore durante il logout:', text);
                setError("Errore durante il logout");
            }
        } catch (error) {
            console.error("Errore di rete durante il logout:", error);
            setError("Errore di rete durante il logout");
        } finally {
            setIsLoggingOut(false);
        }
    };

    useEffect(() => {
        checkAccesso();
        checkCategoria();
    }, []);

    // Definiamo i menu items con condizioni di accesso
    const menuItems = [
        {title: 'Home', path: '/', icon: Home, visible: true},
        {title: 'Servizi', path: '/services', icon: Briefcase, visible: true},
        {title: 'Contatti', path: '/contact', icon: Mail, visible: true},
        {title: 'Energy Portfolio', path: '/energy-portfolio', icon: BarChart3, visible: accessoEffettuato},
        {
            title: 'Crea Utente',
            path: '/energy-portfolio/create-user',
            icon: User,
            visible: accessoEffettuato && categoriaUtente === 'Admin'
        },
        {
            title: 'Gestione Costi',
            path: '/admin/costi',
            icon: DollarSign,
            visible: accessoEffettuato && categoriaUtente === 'Admin'
        },
        {title: 'Profilo', path: '/profile', icon: User, visible: accessoEffettuato},
    ];

    return (
        <Sidebar collapsible={isMobile ? "offcanvas" : "none"}
                 className={!isMobile ? "fixed left-0 top-0 h-screen z-30" : ""}>
            <SidebarHeader className="bg-white/50">
                <div className="flex items-center justify-between p-2">
                    <Logo/>
                    {isMobile && <SidebarTrigger className="md:block lg:hidden"/>}
                </div>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto">
                {/* Login/Logout Buttons */}
                <SidebarMenu className="mb-4">
                    {!accessoEffettuato &&
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive('/auth')}
                                tooltip="Accedi"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Link to="/auth">
                                    <LogIn/>
                                    <span>Accedi</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    }
                </SidebarMenu>

                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Filtriamo i menu items in base alla proprietà visible */}
                            {menuItems
                                .filter(item => item.visible)
                                .map((item) => (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(item.path)}
                                            tooltip={item.title}
                                        >
                                            <Link to={item.path}>
                                                <item.icon/>
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Alternativa: pulsante di logout nel footer */}
            {accessoEffettuato && (
                <SidebarFooter className="border-t py-2">
                    <div className="px-3">
                        {error && (
                            <p className="text-xs text-red-500 mb-2">{error}</p>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={logOut}
                            disabled={isLoggingOut}
                        >
                            <LogOut className="h-4 w-4"/>
                            <span>{isLoggingOut ? "Uscita in corso..." : "Logout"}</span>
                        </Button>
                    </div>
                </SidebarFooter>
            )}
        </Sidebar>
    );
};
