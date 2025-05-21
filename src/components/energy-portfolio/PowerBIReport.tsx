
import React, { useEffect, useRef, useState } from "react";
import * as pbi from "powerbi-client";
import { Card, CardContent } from "@/components/ui/card";

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
  },
};

interface PowerBIReportProps {
  reportId: string;
  className?: string;
}

const PowerBIReport: React.FC<PowerBIReportProps> = ({ reportId, className }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const powerbiService = useRef<any>(null);
  
  // Define the path for API calls
  const PATH = "http://localhost:8081"; // Same as used in DashboardPage

  useEffect(() => {
    const loadReport = async () => {
      try {
        console.log("Loading report with ID:", reportId);

        // Get the token and embed URL from the API
        const response = await fetch(`${PATH}/api/pbitoken/embed?reportId=${reportId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

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

        if (reportRef.current) {
          // Initialize Power BI service
          powerbiService.current = new pbi.service.Service(
            pbi.factories.hpmFactory,
            pbi.factories.wpmpFactory,
            pbi.factories.routerFactory
          );

          // Configure embedding with settings optimized to fill available space
          const embedConfig = {
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
          const report = powerbiService.current.embed(reportRef.current, embedConfig);

          // Handle events
          report.on('loaded', function () {
            console.log("Report loaded successfully");
            setLoading(false);

            // Set display mode to automatically adapt
            report.updateSettings({
              layoutType: pbi.models.LayoutType.Custom,
              customLayout: {
                displayOption: pbi.models.DisplayOption.FitToWidth
              }
            }).catch((err: any) => console.error("Error updating report settings:", err));
          });

          report.on('error', function (event: any) {
            console.error("Power BI Report error:", event.detail);
            setError("Si è verificato un errore durante il caricamento del report. Riprova più tardi.");
            setLoading(false);
          });

          // Cleanup when the component is unmounted
          return () => {
            report.off('loaded');
            report.off('error');
            if (powerbiService.current && reportRef.current) {
              powerbiService.current.reset(reportRef.current);
            }
          };
        }
      } catch (error: any) {
        console.error("Error loading report:", error);
        setError(`Si è verificato un errore durante il caricamento del report: ${error.message}`);
        setLoading(false);
      }
    };

    if (reportId) {
      loadReport();
    }
  }, [reportId, PATH]);

  return (
    <div className={className}>
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
      ></div>
    </div>
  );
};

export default PowerBIReport;
