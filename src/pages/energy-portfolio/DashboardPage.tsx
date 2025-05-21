
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { SecondaryNavbar } from '@/components/energy-portfolio/SecondaryNavbar';
import { DataFilters } from '@/components/energy-portfolio/DataFilters';
import { NotesSection } from '@/components/energy-portfolio/NotesSection';
import { useToast } from '@/components/ui/use-toast';
import PowerBIReport, { energyportfolio } from '@/components/energy-portfolio/PowerBIReport';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Define the path for API calls
const PATH = "http://localhost:8081"; // Adjust based on your actual API path

// Timeout in milliseconds (10 seconds)
const API_TIMEOUT = 10000;

// Promise with timeout utility function
const promiseWithTimeout = (promise, timeoutMs, errorMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};

const DashboardPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Funzione per gestire l'errore nelle chiamate API
  const handleApiError = useCallback((error, context) => {
    console.error(`Error in ${context}:`, error);
    toast({
      title: `Errore in ${context}`,
      description: "Si è verificato un errore durante il recupero dei dati. I dati verranno mostrati comunque.",
      variant: "destructive",
    });
    setHasError(true);
    return null;
  }, [toast]);

  // Chiamate API ottimizzate con timeout
  const handleProxyArticoli = useCallback(async () => {
    try {
      const fetchPromise = fetch(`${PATH}/proxy/articoli`, {
        method: "GET",
        credentials: "include",
      });

      const response = await promiseWithTimeout(
          fetchPromise,
          API_TIMEOUT,
          "La richiesta al proxy articoli è scaduta (timeout)"
      );

      if (response.ok) {
        console.log("Proxy articoli chiamato con successo");
        return true;
      } else {
        console.log("Errore durante la chiamata al proxy articoli: " + response.status);
        return false;
      }
    } catch (error) {
      console.warn("Timeout o errore nel proxy articoli:", error.message);
      // Non mostriamo l'errore all'utente, procediamo comunque
      return false;
    }
  }, []);

  const handleProxyPod = useCallback(async () => {
    try {
      const fetchPromise = fetch(`${PATH}/proxy/pod`, {
        method: "GET",
        credentials: "include",
      });

      const response = await promiseWithTimeout(
          fetchPromise,
          API_TIMEOUT,
          "La richiesta al proxy pod è scaduta (timeout)"
      );

      if (response.ok) {
        console.log("Proxy pod chiamato con successo");
        return true;
      } else {
        console.log("Errore durante la chiamata al proxy pod: " + response.status);
        return false;
      }
    } catch (error) {
      console.warn("Timeout o errore nel proxy pod:", error.message);
      // Non mostriamo l'errore all'utente, procediamo comunque
      return false;
    }
  }, []);

  const handleProxyBollette = useCallback(async () => {
    try {
      const fetchPromise = fetch(`${PATH}/proxy/bollette`, {
        method: "GET",
        credentials: "include",
      });

      const response = await promiseWithTimeout(
          fetchPromise,
          API_TIMEOUT,
          "La richiesta al proxy bollette è scaduta (timeout)"
      );

      if (response.ok) {
        console.log("Proxy bollette chiamato con successo");
        return true;
      } else {
        console.log("Errore durante la chiamata al proxy bollette: " + response.status);
        return false;
      }
    } catch (error) {
      console.warn("Timeout o errore nel proxy bollette:", error.message);
      // Non mostriamo l'errore all'utente, procediamo comunque
      return false;
    }
  }, []);

  // Funzione di caricamento dati
  const fetchDataSequentially = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    let successCount = 0;

    try {
      // Usiamo una strategia di tentativi limitati per ogni API
      console.log("Fetching articles data...");
      const articlesSuccess = await handleProxyArticoli();
      if (articlesSuccess) successCount++;

      console.log("Fetching POD data...");
      const podSuccess = await handleProxyPod();
      if (podSuccess) successCount++;

      console.log("Fetching bill data...");
      const billetteSuccess = await handleProxyBollette();
      if (billetteSuccess) successCount++;

      // Procediamo anche se alcune API hanno fallito
      setDataLoaded(true);

      if (successCount === 3) {
        toast({
          title: "Dati caricati con successo",
          description: "Tutti i dati sono stati aggiornati",
          variant: "default",
        });
      } else if (successCount > 0) {
        toast({
          title: "Caricamento parziale",
          description: `${successCount} su 3 set di dati caricati correttamente`,
          variant: "default",
        });
      } else {
        setHasError(true);
        toast({
          title: "Errore nel caricamento dei dati",
          description: "Nessun dato caricato correttamente, ma è possibile continuare ad utilizzare la dashboard",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in fetchDataSequentially:", error);
      setHasError(true);
      toast({
        title: "Errore durante l'aggiornamento",
        description: "Si è verificato un errore, ma puoi comunque visualizzare la dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [handleProxyArticoli, handleProxyPod, handleProxyBollette, toast]);

  // Effetto per caricare i dati iniziali
  useEffect(() => {
    fetchDataSequentially();

    // Nessuna dipendenza qui per evitare loop infiniti
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // Gestisci il tentativo di ricaricamento manuale
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Map tabs to reportIds from the energyportfolio config
  const getReportIdForTab = (tabId) => {
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Energetica</h1>
            <p className="text-lg text-muted-foreground">
              Visualizza e analizza i tuoi consumi energetici
            </p>
          </div>
          <Button
              variant="outline"
              onClick={handleRetry}
              disabled={isLoading}
              className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Aggiornamento...' : 'Aggiorna dati'}
          </Button>
        </div>

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
              {hasError && (
                  <p className="text-amber-600 mt-2">
                    Alcuni dati potrebbero non essere aggiornati a causa di un errore durante il caricamento.
                    Puoi utilizzare il pulsante "Aggiorna dati" per riprovare.
                  </p>
              )}
            </NotesSection>
        )}

        {activeTab === 'controllo' && (
            <NotesSection title="Note sul Controllo" defaultOpen>
              <p>
                Questa sezione mostra il report Power BI dedicato al controllo dei consumi.
                È possibile filtrare i dati usando i controlli sopra il grafico.
              </p>
              {hasError && (
                  <p className="text-amber-600 mt-2">
                    Alcuni dati potrebbero non essere aggiornati a causa di un errore durante il caricamento.
                    Puoi utilizzare il pulsante "Aggiorna dati" per riprovare.
                  </p>
              )}
            </NotesSection>
        )}
      </div>
  );
};

export default DashboardPage;
