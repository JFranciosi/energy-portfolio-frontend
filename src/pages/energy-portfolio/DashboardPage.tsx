
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { SecondaryNavbar } from '@/components/energy-portfolio/SecondaryNavbar';
import { DataFilters } from '@/components/energy-portfolio/DataFilters';
import { NotesSection } from '@/components/energy-portfolio/NotesSection';
import { useToast } from '@/components/ui/use-toast';
import PowerBIReport, { energyportfolio } from '@/components/energy-portfolio/PowerBIReport';

// Define the path for API calls
const PATH = "http://localhost:8081"; // Adjust based on your actual API path

const DashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Funzione per gestire l'errore nelle chiamate API
  const handleApiError = useCallback((error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);
    toast({
      title: `Errore in ${context}`,
      description: "Si è verificato un errore durante il recupero dei dati",
      variant: "destructive",
    });
  }, [toast]);

  // Chiamate API ottimizzate
  const handleProxyArticoli = useCallback(async () => {
    try {
      const response = await fetch(`${PATH}/proxy/articoli`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Proxy articoli chiamato con successo");
      } else {
        console.log("Errore durante la chiamata al proxy articoli: " + response.status);
      }

      const data = await response.json();
      console.log("Dati articoli ricevuti:", data ? "disponibili" : "nessun dato");      
      return data;
    } catch (error) {
      handleApiError(error, "proxy articoli");
      return null;
    }
  }, [handleApiError]);

  const handleProxyPod = useCallback(async () => {
    try {
      const response = await fetch(`${PATH}/proxy/pod`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Proxy pod chiamato con successo");
      } else {
        console.log("Errore durante la chiamata al proxy pod: " + response.status);
      }

      const data = await response.json();
      console.log("Dati pod ricevuti:", data ? "disponibili" : "nessun dato");      
      return data;
    } catch (error) {
      handleApiError(error, "proxy pod");
      return null;
    }
  }, [handleApiError]);

  const handleProxyBollette = useCallback(async () => {
    try {
      const response = await fetch(`${PATH}/proxy/bollette`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Proxy bollette chiamato con successo");
      } else {
        console.log("Errore durante la chiamata al proxy bollette: " + response.status);
      }

      const data = await response.json();
      console.log("Dati bollette ricevuti:", data ? "disponibili" : "nessun dato");      
      return data;
    } catch (error) {
      handleApiError(error, "proxy bollette");
      return null;
    }
  }, [handleApiError]);

  useEffect(() => {
    // Fetch data when component mounts
    let isMounted = true;
    
    // Modified to run API calls sequentially instead of in parallel
    const fetchDataSequentially = async () => {
      setIsLoading(true);
      try {
        // Run API calls one after another
        console.log("Fetching articles data...");
        await handleProxyArticoli();
        
        if (!isMounted) return;
        console.log("Fetching POD data...");
        await handleProxyPod();
        
        if (!isMounted) return;
        console.log("Fetching bill data...");
        await handleProxyBollette();
        
        if (isMounted) {
          setDataLoaded(true);
          setIsLoading(false);
          toast({
            title: "Dati caricati con successo",
            description: "Tutti i dati sono stati aggiornati",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (isMounted) {
          setIsLoading(false);
          toast({
            title: "Errore nel caricamento dei dati",
            description: "Si è verificato un errore durante il recupero dei dati",
            variant: "destructive",
          });
        }
      }
    };

    fetchDataSequentially();
    
    return () => {
      isMounted = false;
    };
  }, [toast, handleProxyArticoli, handleProxyPod, handleProxyBollette]);

  // Map tabs to reportIds from the energyportfolio config
  const getReportIdForTab = (tabId: string) => {
    switch (tabId) {
      case 'home':
        return energyportfolio.reports.home.reportId;
      case 'controllo':
        return energyportfolio.reports.controllo.reportId;
      // For other tabs, default to home report
      default:
        return energyportfolio.reports.home.reportId;
    }
  };

  // Updated tabs to only show two sections (removed "vuota")
  const dashboardTabs = [
    { id: 'home', label: 'Home' },
    { id: 'controllo', label: 'Controllo' },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Energetica</h1>
      <p className="text-lg text-muted-foreground mb-4">
        Visualizza e analizza i tuoi consumi energetici
      </p>
      
      {/* Secondary Navbar for tab switching */}
      <SecondaryNavbar 
        items={dashboardTabs}
        activeItemId={activeTab}
        onItemClick={setActiveTab}
      />
      
      {/* Filters */}
      <DataFilters 
        className="mb-6" 
        onExport={() => console.log('Exporting data...')}
      />
      
      {/* Chart Area with Power BI Reports */}
      <Card className="mb-6 p-6">
        <CardContent className={`${isLoading ? 'opacity-50' : ''} min-h-[500px] flex items-center justify-center`}>
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p>Caricamento dati...</p>
            </div>
          ) : (
            <PowerBIReport 
              reportId={getReportIdForTab(activeTab)} 
              className="w-full h-[500px]" 
            />
          )}
        </CardContent>
      </Card>
      
      {/* Dynamic Notes Section based on active tab */}
      {activeTab === 'home' && (
        <NotesSection title="Note sulla Home" defaultOpen>
          <p>
            Questa sezione mostra il report Power BI principale con una panoramica dei dati.
            I dati vengono caricati automaticamente all'apertura della pagina.
          </p>
        </NotesSection>
      )}
      
      {activeTab === 'controllo' && (
        <NotesSection title="Note sul Controllo" defaultOpen>
          <p>
            Questa sezione mostra il report Power BI dedicato al controllo dei consumi.
            È possibile filtrare i dati usando i controlli sopra il grafico.
          </p>
        </NotesSection>
      )}
    </div>
  );
};

export default DashboardPage;
