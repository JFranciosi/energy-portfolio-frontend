
import React, {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
    Sidebar,
    SidebarContent,
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
import {Home, Mail, Briefcase, User, LogIn, BarChart3, FileText} from 'lucide-react';
import {useIsMobile} from '@/hooks/use-mobile';

export const AppSidebar = () => {
    const [accessoEffettuato, setAccessoEffettuato] = useState(false);
    const [error, setError] = useState('');
    const [categoriaUtente, setCategoriaUtente] = useState('');
    const location = useLocation();
    const isMobile = useIsMobile();
    const isActive = (path: string) => location.pathname === path;

    const checkAccesso = async () => {
        try {
            const response = await fetch(`http://localhost:8081/Autentication/check`, {
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
            const response = await fetch(`http://localhost:8081/Autentication/checkCategoria`, {
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
        {title: 'Crea Utente', path: '/energy-portfolio/create-user', icon: User, visible: accessoEffettuato && categoriaUtente === 'Admin'},
        {title: 'Profilo', path: '/profile', icon: User, visible: accessoEffettuato},
    ];

    return (
        <Sidebar collapsible={isMobile ? "offcanvas" : "none"}
                 className={!isMobile ? "fixed left-0 top-0 h-screen z-30" : ""}>
            <SidebarHeader className="bg-white/20">
                <div className="flex items-center justify-between p-2">
                    <Logo/>
                    {isMobile && <SidebarTrigger className="md:block lg:hidden"/>}
                </div>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto">
                {/* Login Button - Mostriamo solo se non è effettuato l'accesso */}
                {!accessoEffettuato && (
                    <SidebarMenu className="mb-4">
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
                    </SidebarMenu>
                )}

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
        </Sidebar>
    );
};
