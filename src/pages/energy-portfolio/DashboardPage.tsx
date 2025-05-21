
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecondaryNavbar } from '@/components/energy-portfolio/SecondaryNavbar';
import { DataFilters } from '@/components/energy-portfolio/DataFilters';
import { NotesSection } from '@/components/energy-portfolio/NotesSection';
import { useToast } from '@/components/ui/use-toast';
import PowerBIReport, { energyportfolio } from '@/components/energy-portfolio/PowerBIReport';

// Define the path for API calls
const PATH = "http://localhost:8081"; // Adjust based on your actual API path

const DashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('consumption');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data when component mounts
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          handleProxyArticoli(),
          handleProxyPod(),
          handleProxyBollette()
        ]);
        toast({
          title: "Dati caricati con successo",
          description: "Tutti i dati sono stati aggiornati",
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Errore nel caricamento dei dati",
          description: "Si è verificato un errore durante il recupero dei dati",
          variant: "destructive",
        });
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleProxyArticoli = async () => {
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

      if (data) {
        console.log("Dati articoli ricevuti:", data);
      } else {
        console.log("Nessun dato articoli ricevuto: ", data);
      }
      
      return data;
    } catch (error) {
      console.error("Errore durante la chiamata al proxy articoli:", error);
      throw error;
    }
  }

  const handleProxyPod = async () => {
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

      if (data) {
        console.log("Dati pod ricevuti:", data);
      } else {
        console.log("Nessun dato pod ricevuto: ", data);
      }
      
      return data;
    } catch (error) {
      console.error("Errore durante la chiamata al proxy pod:", error);
      throw error;
    }
  }

  const handleProxyBollette = async () => {
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

      if (data) {
        console.log("Dati bollette ricevuti:", data);
      } else {
        console.log("Nessun dato bollette ricevuto: ", data);
      }
      
      return data;
    } catch (error) {
      console.error("Errore durante la chiamata al proxy bollette:", error);
      throw error;
    }
  }

  // Map tabs to reportIds from the energyportfolio config
  const getReportIdForTab = (tabId: string) => {
    switch (tabId) {
      case 'consumption':
        return energyportfolio.reports.home.reportId;
      case 'costs':
        return energyportfolio.reports.controllo.reportId;
      case 'comparison':
        return energyportfolio.reports.past.reportId;
      // For other tabs, default to home report
      default:
        return energyportfolio.reports.home.reportId;
    }
  };

  const dashboardTabs = [
    { id: 'consumption', label: 'Consumi' },
    { id: 'costs', label: 'Costi' },
    { id: 'comparison', label: 'Confronto Anni' },
    { id: 'breakdown', label: 'Suddivisione' },
    { id: 'powerbi', label: 'Power BI' },
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
            <>
              {/* Power BI Report display */}
              <PowerBIReport 
                reportId={getReportIdForTab(activeTab)} 
                className="w-full h-[500px]" 
              />
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Dynamic Notes Section based on active tab */}
      {activeTab === 'consumption' && (
        <NotesSection title="Note sui consumi" defaultOpen>
          <p>
            Questa sezione mostra il report Power BI sui consumi energetici.
            I dati vengono caricati automaticamente all'apertura della pagina.
          </p>
        </NotesSection>
      )}
      
      {activeTab === 'costs' && (
        <NotesSection title="Note sui costi" defaultOpen>
          <p>
            Questa sezione mostra il report Power BI sui costi energetici.
            È possibile filtrare i dati usando i controlli sopra il grafico.
          </p>
        </NotesSection>
      )}
      
      {activeTab === 'comparison' && (
        <NotesSection title="Note sul confronto tra anni" defaultOpen>
          <p>
            Questa sezione mostra il report Power BI per il confronto tra diversi anni,
            permettendo di analizzare i trend di consumo e costi nel tempo.
          </p>
        </NotesSection>
      )}
      
      {activeTab === 'breakdown' && (
        <NotesSection title="Note sulla suddivisione" defaultOpen>
          <p>
            Questa sezione mostra il report Power BI per la suddivisione dei consumi e dei costi
            per categoria, fonte o altri parametri rilevanti.
          </p>
        </NotesSection>
      )}
      
      {activeTab === 'powerbi' && (
        <NotesSection title="Note su Power BI" defaultOpen>
          <p>
            Questa sezione mostra il report Power BI completo con tutti i dettagli.
            Per visualizzare correttamente i report è necessario essere autenticati.
          </p>
        </NotesSection>
      )}
    </div>
  );
};

export default DashboardPage;
