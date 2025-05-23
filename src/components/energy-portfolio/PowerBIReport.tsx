import React, { useEffect, useRef, useState } from "react";
import * as pbi from "powerbi-client";
import { Card, CardContent } from "@/components/ui/card";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the energy portfolio reports configuration
export const energyportfolio = {
  baseURL: "https://app.powerbi.com/reportEmbed",
  tenantId: "69da13af-78cb-4dd9-b20c-087550f2b912",
  reports: {
    home: {
      reportId: "731f022b-0cd0-4a27-8c0b-1291fa56aabf",
    },
    controllo: {
      reportId: "dbd53ac9-a515-4e62-8d0f-093f85de5b8b",
    },
    past: {
      reportId: "f9f7a1d8-32e8-4b04-9cb8-9f83c0e25858",
    },
    // New futures reports
    futures: {
      reportId: "b97739f8-e8cc-42e6-895b-74757f3613a8",
    },
    futuresAnalysis: {
      reportId: "77bc07c1-bdb0-4c1f-aaf6-1eedcc2be1b6",
    },
    pastEnergyData: {
      reportId: "24a05787-ca23-4a91-9ae6-ac5d25b237d9",
    },
  },
};

interface PowerBIReportProps {
  reportId: string;
  className?: string;
}

// Define proper types for the PowerBI service and events
type PowerBIService = pbi.service.Service;
type PowerBIReport = pbi.Report;
type PowerBIEventHandler = (event?: pbi.service.ICustomEvent<any>) => void;

const PowerBIReport: React.FC<PowerBIReportProps> = ({ reportId, className }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const powerbiService = useRef<PowerBIService | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Define the path for API calls
  const PATH = "http://localhost:8081"; // Same as used in DashboardPage

  // Toggle fullscreen function
  const toggleFullscreen = () => {
    if (!reportRef.current) return;

    if (!isFullscreen) {
      if (reportRef.current.requestFullscreen) {
        reportRef.current.requestFullscreen()
            .then(() => setIsFullscreen(true))
            .catch((err) => console.error("Could not enter fullscreen mode:", err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
            .then(() => setIsFullscreen(false))
            .catch((err) => console.error("Could not exit fullscreen mode:", err));
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true; // Add a flag to track component mount state
    let reportInstance: PowerBIReport | null = null;

    const loadReport = async () => {
      if (!reportId) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        console.log("Loading report with ID:", reportId);

        // Reset any previous errors
        if (isMounted) {
          setError(null);
          setLoading(true);
        }

        // Get the token and embed URL from the API
        const response = await fetch(`${PATH}/api/pbitoken/embed?reportId=${reportId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (!isMounted) return; // Check if component is still mounted

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(`Failed to fetch embed info: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Embed info received");

        if (!data.token || !data.embedUrl) {
          throw new Error("Missing token or embedUrl in API response");
        }

        // Reset the service if it already exists
        if (powerbiService.current && reportRef.current) {
          powerbiService.current.reset(reportRef.current);
        }

        if (!reportRef.current || !isMounted) return; // Check if ref and component are available

        // Initialize Power BI service
        if (!powerbiService.current) {
          powerbiService.current = new pbi.service.Service(
              pbi.factories.hpmFactory,
              pbi.factories.wpmpFactory,
              pbi.factories.routerFactory
          );
        }

        // Configure embedding with settings optimized to fill available space
        const embedConfig: pbi.IEmbedConfiguration = {
          type: 'report',
          id: reportId,
          embedUrl: data.embedUrl,
          accessToken: data.token,
          tokenType: pbi.models.TokenType.Embed,
          settings: {
            panes: {
              filters: { visible: false },
              pageNavigation: { visible: false }
            },
            background: pbi.models.BackgroundType.Transparent,
            layoutType: pbi.models.LayoutType.Custom,
            customLayout: {
              displayOption: pbi.models.DisplayOption.FitToWidth
            }
          }
        };

        console.log("Embedding with config");

        // Perform embedding
        reportInstance = powerbiService.current.embed(reportRef.current, embedConfig) as PowerBIReport;

        // Handle events
        const loadedHandler: PowerBIEventHandler = () => {
          console.log("Report loaded successfully");
          if (isMounted) {
            setLoading(false);
          }

          // Set display mode to automatically adapt
          if (reportInstance) {
            reportInstance.updateSettings({
              layoutType: pbi.models.LayoutType.Custom,
              customLayout: {
                displayOption: pbi.models.DisplayOption.FitToWidth
              }
            }).catch((err: Error) => console.error("Error updating report settings:", err));
          }
        };

        const errorHandler: PowerBIEventHandler = (event) => {
          const eventDetail = event?.detail ? String(event.detail) : "Unknown error";
          console.error("Power BI Report error:", eventDetail);
          if (isMounted) {
            setError("Si è verificato un errore durante il caricamento del report. Riprova più tardi.");
            setLoading(false);
          }
        };

        reportInstance.on('loaded', loadedHandler);
        reportInstance.on('error', errorHandler);

      } catch (error) {
        console.error("Error loading report:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (isMounted) {
          setError(`Si è verificato un errore durante il caricamento del report: ${errorMessage}`);
          setLoading(false);
        }
      }
    };

    loadReport();

    // Cleanup when the component is unmounted
    return () => {
      isMounted = false;
      if (reportInstance) {
        reportInstance.off('loaded');
        reportInstance.off('error');
      }
      if (powerbiService.current && reportRef.current) {
        try {
          powerbiService.current.reset(reportRef.current);
        } catch (e) {
          console.error("Error during PowerBI cleanup:", e);
        }
      }
    };
  }, [reportId, PATH]);

  // If reportId is empty, don't render the report container
  if (!reportId) {
    return null;
  }

  return (
      <div className={className}>
        <div className="flex justify-end mb-2">
          <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="z-10"
              title={isFullscreen ? "Esci da schermo intero" : "Schermo intero"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>

        {loading && (
            <div className="flex flex-col items-center justify-center h-full w-full p-8">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
              <p>Caricamento report...</p>
            </div>
        )}
        {error && (
            <div className="flex flex-col items-center justify-center h-full w-full p-8">
              <p className="text-destructive">{error}</p>
            </div>
        )}
        <div
            ref={reportRef}
            className="w-full h-full min-h-[400px]"
            style={{
              display: loading ? 'none' : 'block',
              position: isFullscreen ? 'fixed' : 'relative',
              top: isFullscreen ? '0' : 'auto',
              left: isFullscreen ? '0' : 'auto',
              right: isFullscreen ? '0' : 'auto',
              bottom: isFullscreen ? '0' : 'auto',
              zIndex: isFullscreen ? 9999 : 'auto',
            }}
        ></div>
      </div>
  );
};

export default PowerBIReport;