import React, { useState, useEffect, useCallback, useRef } from "react";
import { SecondaryNavbar, type NavItem } from "@/components/energy-portfolio/SecondaryNavbar";
import { NotesSection } from "@/components/energy-portfolio/NotesSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { Download, Maximize, Minimize, RefreshCw } from "lucide-react";
import * as pbi from "powerbi-client";
import { useToast } from "@/components/ui/use-toast";

/* =============================================================================
 *                         CONFIG REPORT POWER BI (FE)
 * ========================================================================== */

const energyportfolio = {
  baseURL: "https://app.powerbi.com/reportEmbed",
  tenantId: "69da13af-78cb-4dd9-b20c-087550f2b912",
  reports: {
    budget: {
      label: "Budget – Analisi/Previsioni",
      reportId: "7fa5925d-390c-4e9a-82ce-6847ea2b6114",
    },
  },
};

/* =============================================================================
 *                         POWER BI REPORT COMPONENT
 * ========================================================================== */

type PowerBIService = pbi.service.Service;
type PowerBIReport = pbi.Report;
type PowerBIEventHandler = (event?: pbi.service.ICustomEvent<any>) => void;

export interface PowerBIReportHandle {
  refresh: () => Promise<void>;
  reload: () => Promise<void>;
}

interface PowerBIReportProps {
  reportId: string;
  className?: string;
  pathBase?: string;
  pod?: string;
  anno?: number;
}

const PowerBIReportEmbed = React.forwardRef<PowerBIReportHandle, PowerBIReportProps>(
  ({ reportId, className, pathBase = "https://energyportfolio.it", pod, anno }, ref) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const powerbiService = useRef<PowerBIService | null>(null);
    const reportObjRef = useRef<PowerBIReport | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
      if (!reportRef.current) return;
      if (!isFullscreen) {
        reportRef.current
          .requestFullscreen?.()
          .then(() => setIsFullscreen(true))
          .catch((err) => console.error("Could not enter fullscreen:", err));
      } else {
        document
          .exitFullscreen?.()
          .then(() => setIsFullscreen(false))
          .catch((err) => console.error("Could not exit fullscreen:", err));
      }
    };

    useEffect(() => {
      const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener("fullscreenchange", handleFsChange);
      return () => document.removeEventListener("fullscreenchange", handleFsChange);
    }, []);

    useEffect(() => {
      let isMounted = true;
      let reportInstance: PowerBIReport | null = null;
      let cleanupHandlers: (() => void) | undefined;

      const load = async () => {
        if (!reportId) {
          if (isMounted) setLoading(false);
          return;
        }
        try {
          if (isMounted) {
            setError(null);
            setLoading(true);
          }

          const res = await fetch(
            `${pathBase}/api/pbitoken/embed?reportId=${encodeURIComponent(reportId)}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );

          if (!isMounted) return;

          if (!res.ok) {
            const text = await res.text();
            console.error("PBI API error:", text);
            throw new Error(`Backend PBI: ${res.status} ${res.statusText}`);
          }

          const data = await res.json();
          if (!data?.token || !data?.embedUrl) {
            throw new Error("Risposta API incompleta: manca token o embedUrl");
          }

          if (powerbiService.current && reportRef.current) {
            powerbiService.current.reset(reportRef.current);
          }

          if (!reportRef.current || !isMounted) return;

          if (!powerbiService.current) {
            powerbiService.current = new pbi.service.Service(
              pbi.factories.hpmFactory,
              pbi.factories.wpmpFactory,
              pbi.factories.routerFactory
            );
          }

          const config: pbi.IEmbedConfiguration = {
            type: "report",
            id: reportId,
            embedUrl: data.embedUrl,
            accessToken: data.token,
            tokenType: pbi.models.TokenType.Embed,
            settings: {
              panes: {
                filters: { visible: false },
                pageNavigation: { visible: true },
              },
              background: pbi.models.BackgroundType.Transparent,
              layoutType: pbi.models.LayoutType.Custom,
              customLayout: {
                displayOption: pbi.models.DisplayOption.FitToWidth,
              },
            },
          };

          reportInstance = powerbiService.current.embed(reportRef.current, config) as PowerBIReport;
          reportObjRef.current = reportInstance;

          const loadedHandler: PowerBIEventHandler = () => {
            if (isMounted) setLoading(false);
            reportInstance
              ?.updateSettings({
                layoutType: pbi.models.LayoutType.Custom,
                customLayout: { displayOption: pbi.models.DisplayOption.FitToWidth },
              })
              .catch((e: Error) => console.error("Update settings error:", e));
          };

          const errorHandler: PowerBIEventHandler = (evt) => {
            const detail = evt?.detail ? String(evt.detail) : "Unknown";
            console.error("Power BI error:", detail);
            if (isMounted) {
              setLoading(false);
            }
          };

          reportInstance.on("loaded", loadedHandler);
          reportInstance.on("error", errorHandler);

          cleanupHandlers = () => {
            reportInstance?.off("loaded", loadedHandler);
            reportInstance?.off("error", errorHandler);
          };
        } catch (e: any) {
          console.error("Embed error:", e);
          if (isMounted) {
            setError(e?.message ?? "Errore sconosciuto");
            setLoading(false);
          }
        }
      };

      load();

      return () => {
        isMounted = false;
        cleanupHandlers?.();
        if (powerbiService.current && reportRef.current) {
          try {
            powerbiService.current.reset(reportRef.current);
          } catch (e) {
            console.error("Cleanup PBI error:", e);
          }
        }
        reportObjRef.current = null;
      };
    }, [reportId, pathBase]);

    // 🔹 Applica i filtri quando cambiano pod o anno
    useEffect(() => {
      if (!reportObjRef.current || !pod || !anno) return;

      const filterPod: pbi.models.IBasicFilter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: { table: "Budget", column: "id_pod" },
        operator: "In",
        values: [pod],
        filterType: pbi.models.FilterType.Advanced
      };

      const filterAnno: pbi.models.IBasicFilter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: { table: "Budget", column: "Anno" },
        operator: "In",
        values: [anno],
        filterType: pbi.models.FilterType.Advanced
      };

      reportObjRef.current.setFilters([filterPod, filterAnno]).catch((err) => {
        console.error("Errore applicando i filtri:", err);
      });
    }, [pod, anno]);

    React.useImperativeHandle(ref, () => ({
      refresh: async () => {
        if (reportObjRef.current) {
          await reportObjRef.current.refresh();
        }
      },
      reload: async () => {
        if (reportObjRef.current) {
          await reportObjRef.current.reload();
        }
      },
    }));

    if (!reportId) return null;

    return (
      <div className={className}>
        <div className="flex justify-end items-center mb-2">
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
          <div className="flex flex-col items-center justify-center h-[70vh] w-full p-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p>Caricamento report…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-[70vh] w-full p-8">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <div
          ref={reportRef}
          className="w-full h-[70vh] min-h-[400px] rounded-md overflow-hidden"
          style={{
            display: loading ? "none" : "block",
            position: isFullscreen ? "fixed" as const : "relative" as const,
            top: isFullscreen ? "0" : "auto",
            left: isFullscreen ? "0" : "auto",
            right: isFullscreen ? "0" : "auto",
            bottom: isFullscreen ? "0" : "auto",
            zIndex: isFullscreen ? 9999 : "auto",
            background: "transparent",
          }}
        />
      </div>
    );
  }
);
PowerBIReportEmbed.displayName = "PowerBIReportEmbed";

/* =============================================================================
 *                           BUDGET PAGE (MAIN)
 * ========================================================================== */

interface MeseDati {
  mese: string;
  prezzoEnergiaPerc: number;
  consumiPerc: number;
  oneriPerc: number;
  prezzoEnergiaBase: number; // € spesa energia "base"
  consumiBase: number; // kWh "base"
  oneriBase: number; // € "base"
  spesaTotale: number; // € calcolata
  editable: boolean;
}

export interface PodInfo {
  id: string;
  sede?: string;
}

type LocalCacheMonth = {
  prezzoEnergiaPerc?: number;
  consumiPerc?: number;
  oneriPerc?: number;
  prezzoEnergiaBase?: number;
  consumiBase?: number;
  oneriBase?: number;
  ts: number;
};

type LocalCache = {
  [podId: string]: {
    [year: number]: {
      [month: number]: LocalCacheMonth;
    };
  };
};

//const PATH = "http://localhost:8081";
const PATH = 'https://energyportfolio.it';

const YEARS = Array.from({ length: 8 }, (_, i) => 2023 + i);
const MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];
const NAV_TABS: NavItem[] = [
  { id: "pbi", label: "Analisi Budget" },
  { id: "budget", label: "Previsioni Budget" },
];
type TabId = NavItem["id"];

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/* ------------------------------ Budget Card ------------------------------ */

const BudgetCard: React.FC<{
  data: MeseDati;
  idx: number;
  updateRow: <K extends keyof MeseDati>(i: number, field: K, value: MeseDati[K]) => void;
  podCode: string;
  anno: number;
  onSaveSuccess: () => Promise<void>;
  onLocalPersist: (monthIndex1Based: number, payload: LocalCacheMonth) => void;
}> = ({ data, idx, updateRow, podCode, anno, onSaveSuccess, onLocalPersist }) => {
  const [isSaving, setIsSaving] = useState(false);
  const isAllAggregate = podCode === "ALL";

  const prezzoEnergia = data.consumiBase > 0 ? (data.prezzoEnergiaBase / data.consumiBase) * (1 + data.prezzoEnergiaPerc / 100) : 0;

  const consumi = data.consumiBase * (1 + data.consumiPerc / 100);
  const oneri = data.oneriBase * (1 + data.oneriPerc / 100);
  const spesaTotale = prezzoEnergia * consumi + oneri;

  const handleSave = async () => {
    if (isAllAggregate) return;
    setIsSaving(true);
    try {
      const payload = {
        prezzoEnergiaPerc: data.prezzoEnergiaPerc,
        consumiPerc: data.consumiPerc,
        oneriPerc: data.oneriPerc,
      };
      const url = `${PATH}/budget/previsioni?pod=${encodeURIComponent(podCode)}&anno=${anno}&mese=${idx + 1}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      onLocalPersist(idx + 1, {
        prezzoEnergiaPerc: data.prezzoEnergiaPerc,
        consumiPerc: data.consumiPerc,
        oneriPerc: data.oneriPerc,
        ts: Date.now(),
      });

      Swal.fire({ icon: "success", title: "Salvato", timer: 1200, showConfirmButton: false });
      await onSaveSuccess();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Errore", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-0">
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Sinistra */}
        <div className="flex-1 p-4">
          <CardHeader className="p-0 pb-2 border-b border-gray-100 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-blue-600" />
              <CardTitle className="text-gray-800 text-base font-semibold">{data.mese}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0 pt-4 flex flex-col gap-6">
            {[
              { label: "Prezzo Energia", baseValue: `${prezzoEnergia.toFixed(4)} €/kWh`, percValue: data.prezzoEnergiaPerc },
              { label: "Consumi", baseValue: `${consumi.toFixed(2)} kWh`, percValue: data.consumiPerc },
              { label: "Oneri", baseValue: euroFormatter.format(oneri), percValue: data.oneriPerc },
            ].map(({ label, baseValue, percValue }) => (
              <div key={label} className="flex items-center justify-between gap-6">
                <div className="flex flex-col">
                  <Label className="block text-xs mt-1 text-gray-500">{label}</Label>
                  <div className="font-bold text-lg">{baseValue}</div>
                </div>
                <div className="flex flex-col items-end min-w-[80px]">
                  <span className="text-xs text-gray-500">({percValue >= 0 ? "+" : ""}{percValue.toFixed(1)}%)</span>
                </div>
              </div>
            ))}

            <div>
              <Label className="block text-xs mb-1 text-gray-500">Spesa Totale</Label>
              <div className="font-bold text-lg text-blue-700">{euroFormatter.format(spesaTotale)}</div>
            </div>
          </CardContent>
        </div>

        {/* Destra */}
        <div className="flex-2 flex flex-col justify-center p-5 gap-12 border-l border-gray-100 bg-gray-50 pt-12">
          {(["prezzoEnergiaPerc", "consumiPerc", "oneriPerc"] as const).map((field) => {
            const value = data[field] as number;
            const pos = (value + 100) / 2;
            const bg = `linear-gradient(to right,#2563eb 0%,#2563eb ${pos}%,#e5e7eb ${pos}%,#e5e7eb 100%)`;

            return (
              <div key={field} className="flex flex-col gap-2">
                <Label className="block text-sm font-medium mb-1">
                  {field === "prezzoEnergiaPerc" ? "Prezzo Energia (%)" : field === "consumiPerc" ? "Consumi (%)" : "Oneri (%)"}
                </Label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={value}
                  onChange={(e) => updateRow(idx, field, Number(e.target.value) as any)}
                  className="w-full h-3 rounded-lg cursor-pointer"
                  disabled={!data.editable}
                  style={{
                    background: bg,
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                    accentColor: "#2563eb",
                  }}
                />
              </div>
            );
          })}

          <Button
            size="sm"
            onClick={isAllAggregate ? undefined : handleSave}
            disabled={isAllAggregate || isSaving || !data.editable}
            className={`mt-auto shadow disabled:opacity-50 ${
              isAllAggregate ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            title={
              isAllAggregate
                ? "Su Tutte le sedi il salvataggio è disabilitato. Modifica i singoli POD: l’aggregato si aggiorna da solo."
                : undefined
            }
          >
            {isAllAggregate ? "Salva" : isSaving ? <span className="animate-pulse">Salvataggio…</span> : "Salva"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

/* ------------------------------ MAIN PAGE ------------------------------ */

const BudgetPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("pbi");
  const [podOptions, setPodOptions] = useState<PodInfo[]>([]);
  const [pod, setPod] = useState<PodInfo | null>(null);
  const [anno, setAnno] = useState<number>(new Date().getFullYear());

  const [rows, setRows] = useState<MeseDati[]>([]);
  const [hasData, setHasData] = useState(true);

  // Stato refresh dataset Power BI
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle al report per richiamare refresh dopo i proxy
  const reportHandleRef = useRef<PowerBIReportHandle | null>(null);

  // Cache locale
  const localCacheRef = useRef<LocalCache>({});

  const putLocalCache = useCallback((podId: string, year: number, month: number, patch: LocalCacheMonth) => {
    if (!localCacheRef.current[podId]) localCacheRef.current[podId] = {};
    if (!localCacheRef.current[podId][year]) localCacheRef.current[podId][year] = {};
    const prev = localCacheRef.current[podId][year][month] || { ts: 0 };
    if (!prev.ts || (patch.ts ?? Date.now()) >= prev.ts) {
      localCacheRef.current[podId][year][month] = { ...prev, ...patch, ts: patch.ts ?? Date.now() };
    }
  }, []);

  const getLocalCache = useCallback((podId: string, year: number, month: number): LocalCacheMonth | undefined => {
    return localCacheRef.current[podId]?.[year]?.[month];
  }, []);

  const applyLocalOverlayToArray = useCallback(
    (arr: any[], podId: string, year: number) => {
      return (arr || []).map((rec: any) => {
        const month = Number(rec?.mese);
        const lc = getLocalCache(podId, year, month);
        if (!lc) return rec;
        return {
          ...rec,
          prezzoEnergiaPerc: lc.prezzoEnergiaPerc ?? rec.prezzoEnergiaPerc,
          consumiPerc: lc.consumiPerc ?? rec.consumiPerc,
          oneriPerc: lc.oneriPerc ?? rec.oneriPerc,
          prezzoEnergiaBase: lc.prezzoEnergiaBase ?? rec.prezzoEnergiaBase,
          consumiBase: lc.consumiBase ?? rec.consumiBase,
          oneriBase: lc.oneriBase ?? rec.oneriBase,
        };
      });
    },
    [getLocalCache]
  );

  const emptyRows = () =>
    MONTHS.map((m) => ({
      mese: m,
      prezzoEnergiaPerc: 0,
      consumiPerc: 0,
      oneriPerc: 0,
      prezzoEnergiaBase: 0,
      consumiBase: 0,
      oneriBase: 0,
      spesaTotale: 0,
      editable: false,
    }));

  const buildRowFromRecord = (meseNome: string, rec: any | null): MeseDati => {
    if (!rec) {
      return {
        mese: meseNome,
        prezzoEnergiaPerc: 0,
        consumiPerc: 0,
        oneriPerc: 0,
        prezzoEnergiaBase: 0,
        consumiBase: 0,
        oneriBase: 0,
        spesaTotale: 0,
        editable: false,
      };
    }

    const prezzoEnergiaBase = Number(rec?.prezzoEnergiaBase ?? 0);
    const consumiBase = Number(rec?.consumiBase ?? 0);
    const oneriBase = Number(rec?.oneriBase ?? 0);
    const prezzoPerc = Number(rec?.prezzoEnergiaPerc ?? 0);
    const consumiPerc = Number(rec?.consumiPerc ?? 0);
    const oneriPerc = Number(rec?.oneriPerc ?? 0);

    const prezzoEnergia = consumiBase > 0 ? (prezzoEnergiaBase / consumiBase) * (1 + prezzoPerc / 100) : 0;
    const consumi = consumiBase * (1 + consumiPerc / 100);
    const oneri = oneriBase * (1 + oneriPerc / 100);
    const spesaTotale = prezzoEnergia * consumi + oneri;

    const hasAnyData = consumiBase > 0 || oneriBase > 0 || prezzoEnergiaBase > 0;

    return {
      mese: meseNome,
      prezzoEnergiaPerc: prezzoPerc,
      consumiPerc: consumiPerc,
      oneriPerc: oneriPerc,
      prezzoEnergiaBase,
      consumiBase,
      oneriBase,
      spesaTotale,
      editable: hasAnyData,
    };
  };

  /* ----------------------- mesi consentiti per fallback ---------------------- */
  const allowedFallbackMonths = (year: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1..12

    if (year < currentYear) {
      return new Set(Array.from({ length: 12 }, (_, i) => i + 1));
    }
    if (year === currentYear) {
      return new Set(Array.from({ length: Math.max(currentMonth - 1, 0) }, (_, i) => i + 1));
    }
    if (year === currentYear + 1) {
      return new Set(Array.from({ length: Math.max(currentMonth - 1, 0) }, (_, i) => i + 1));
    }
    return new Set<number>();
  };

  const rollForwardBases = (rec: any) => {
    const baseCons = Number(rec?.consumiBase ?? 0);
    const baseSpesa = Number(rec?.prezzoEnergiaBase ?? 0);
    const baseOneri = Number(rec?.oneriBase ?? 0);
    const pCons = Number(rec?.consumiPerc ?? 0) / 100;
    const pPrez = Number(rec?.prezzoEnergiaPerc ?? 0) / 100;
    const pOneri = Number(rec?.oneriPerc ?? 0) / 100;

    const nextConsumi = baseCons * (1 + pCons);
    const unitPricePrev = baseCons > 0 ? (baseSpesa / baseCons) * (1 + pPrez) : 0;
    const nextSpesa = unitPricePrev * nextConsumi;
    const nextOneri = baseOneri * (1 + pOneri);

    return { nextConsumi, nextSpesa, nextOneri };
  };

  const loadForecasts = useCallback(async () => {
    try {
      if (!pod) {
        setHasData(false);
        setRows(emptyRows());
        return;
      }

      const year = anno;
      const prevYear = year - 1;
      const monthsAllowed = allowedFallbackMonths(year);

      const currentYear = new Date().getFullYear();
      if (year > currentYear + 1) {
        setHasData(false);
        setRows(emptyRows());
        return;
      }

      /* ---------------------------- POD = ALL --------------------------- */
      if (pod.id === "ALL") {
        const podsSingoli = podOptions.filter((p) => p.id !== "ALL");
        if (podsSingoli.length === 0) {
          setHasData(false);
          setRows(emptyRows());
          return;
        }

        const wavg = (values: number[], weights: number[]) => {
          const sumW = weights.reduce((a, b) => a + b, 0);
          if (sumW <= 0) return 0;
          return values.reduce((acc, v, i) => acc + v * (weights[i] || 0), 0) / sumW;
        };

        let perPodAnno = await Promise.all(
          podsSingoli.map(async (p) => {
            const r = await fetch(`${PATH}/budget/${p.id}/${year}`, { credentials: "include" });
            return r.ok ? await r.json() : [];
          })
        );
        perPodAnno = perPodAnno.map((arr, i) => applyLocalOverlayToArray(arr, podsSingoli[i].id, year));

        let perPodPrev: any[] = [];
        if (monthsAllowed.size > 0) {
          perPodPrev = await Promise.all(
            podsSingoli.map(async (p) => {
              const r = await fetch(`${PATH}/budget/${p.id}/${prevYear}`, { credentials: "include" });
              return r.ok ? await r.json() : [];
            })
          );
        }
        perPodPrev = perPodPrev.map((arr, i) => applyLocalOverlayToArray(arr, podsSingoli[i].id, prevYear));

        const rowsAggregated: MeseDati[] = MONTHS.map((meseNome, idx) => {
          const mese = idx + 1;
          let usedAnyAnno = false;
          let usedAnyPrev = false;
          const recs: any[] = [];
          for (let i = 0; i < podsSingoli.length; i++) {
            const arrA = perPodAnno[i] || [];
            const arrP = perPodPrev[i] || [];

            let rec =
              arrA.find((d: any) => d.mese === mese && Number(d.anno) === year) || null;

            if (rec) {
              usedAnyAnno = true;
            } else if (monthsAllowed.has(mese)) {
              const prevRec =
                arrP.find((d: any) => d.mese === mese && Number(d.anno) === prevYear) || null;
              if (prevRec) {
                rec = prevRec;
                usedAnyPrev = true;
              }
            }

            if (rec) recs.push(rec);
          }

          const lcPrevAll = getLocalCache("ALL", prevYear, mese);

          if (recs.length === 0) {
            if (monthsAllowed.has(mese) && lcPrevAll) {
              const { nextConsumi, nextSpesa, nextOneri } = rollForwardBases(lcPrevAll);
              return {
                mese: meseNome,
                prezzoEnergiaPerc: 0,
                consumiPerc: 0,
                oneriPerc: 0,
                prezzoEnergiaBase: nextSpesa,
                consumiBase: nextConsumi,
                oneriBase: nextOneri,
                spesaTotale: 0,
                editable: true,
              };
            }
            return buildRowFromRecord(meseNome, null);
          }

          const consumiBases = recs.map((r) => Number(r.consumiBase ?? 0));
          const oneriBases = recs.map((r) => Number(r.oneriBase ?? 0));
          const spesaBases = recs.map((r) => Number(r.prezzoEnergiaBase ?? 0));

          let consumiSum = consumiBases.reduce((a, b) => a + b, 0);
          let oneriSum = oneriBases.reduce((a, b) => a + b, 0);
          let spesaSum = spesaBases.reduce((a, b) => a + b, 0);

          let prezzoEnergiaPercAgg = wavg(recs.map((r) => Number(r.prezzoEnergiaPerc ?? 0)), consumiBases);
          let consumiPercAgg = wavg(recs.map((r) => Number(r.consumiPerc ?? 0)), consumiBases);
          let oneriPercAgg = wavg(recs.map((r) => Number(r.oneriPerc ?? 0)), oneriBases);

          const lcCurrent = getLocalCache("ALL", year, mese);

          if (lcCurrent && usedAnyAnno) {
            prezzoEnergiaPercAgg = lcCurrent.prezzoEnergiaPerc ?? prezzoEnergiaPercAgg;
            consumiPercAgg = lcCurrent.consumiPerc ?? consumiPercAgg;
            oneriPercAgg = lcCurrent.oneriPerc ?? oneriPercAgg;
            spesaSum = lcCurrent.prezzoEnergiaBase ?? spesaSum;
            consumiSum = lcCurrent.consumiBase ?? consumiSum;
            oneriSum = lcCurrent.oneriBase ?? oneriSum;
          } else if (!usedAnyAnno && usedAnyPrev && monthsAllowed.has(mese)) {
            let accSpesa = 0;
            let accCons = 0;
            let accOneri = 0;

            for (const r of recs) {
              const { nextConsumi, nextSpesa: spesaN, nextOneri: oneriN } = rollForwardBases(r);
              accSpesa += spesaN;
              accCons += nextConsumi;
              accOneri += oneriN;
            }

            prezzoEnergiaPercAgg = 0;
            consumiPercAgg = 0;
            oneriPercAgg = 0;
            spesaSum = accSpesa;
            consumiSum = accCons;
            oneriSum = accOneri;
          }

          const prezzoEnergia = consumiSum > 0 ? (spesaSum / consumiSum) * (1 + prezzoEnergiaPercAgg / 100) : 0;
          const spesaTotale =
            prezzoEnergia * (consumiSum * (1 + consumiPercAgg / 100)) + oneriSum * (1 + oneriPercAgg / 100);

          return {
            mese: meseNome,
            prezzoEnergiaPerc: prezzoEnergiaPercAgg,
            consumiPerc: consumiPercAgg,
            oneriPerc: oneriPercAgg,
            prezzoEnergiaBase: spesaSum,
            consumiBase: consumiSum,
            oneriBase: oneriSum,
            spesaTotale,
            editable: true,
          };
        });

        const anyData = rowsAggregated.some((r) => r.editable);
        setHasData(anyData);
        setRows(anyData ? rowsAggregated : emptyRows());
        return;
      }

      /* ---------------------------- POD SINGOLO ---------------------------- */
      let resAnno = await fetch(`${PATH}/budget/${pod.id}/${year}`, { credentials: "include" });
      let dataAnno: any[] = resAnno.ok ? await resAnno.json() : [];
      dataAnno = applyLocalOverlayToArray(dataAnno, pod.id, year);

      let dataPrev: any[] = [];
      if (monthsAllowed.size > 0) {
        const r = await fetch(`${PATH}/budget/${pod.id}/${prevYear}`, { credentials: "include" });
        if (r.ok) dataPrev = await r.json();
      }
      dataPrev = applyLocalOverlayToArray(dataPrev, pod.id, prevYear);

      const mergedRows: MeseDati[] = MONTHS.map((meseNome, idx) => {
        const mese = idx + 1;
        const recAnno = dataAnno.find((d: any) => d.mese === mese && Number(d.anno) === year) || null;

        const recPrev = dataPrev.find((d: any) => d.mese === mese && Number(d.anno) === prevYear) || null;

        if (recAnno) {
          return buildRowFromRecord(meseNome, recAnno);
        } else if (recPrev && monthsAllowed.has(mese)) {
          const { nextConsumi, nextSpesa, nextOneri } = rollForwardBases(recPrev);
          return {
            mese: meseNome,
            prezzoEnergiaPerc: 0,
            consumiPerc: 0,
            oneriPerc: 0,
            prezzoEnergiaBase: nextSpesa,
            consumiBase: nextConsumi,
            oneriBase: nextOneri,
            spesaTotale: 0,
            editable: true,
          };
        } else {
          return buildRowFromRecord(meseNome, null);
        }
      });

      const anyRowHasData = mergedRows.some((r) => r.editable);
      setHasData(anyRowHasData);
      setRows(anyRowHasData ? mergedRows : emptyRows());
    } catch {
      setHasData(false);
      setRows(emptyRows());
    }
  }, [pod, anno, podOptions, applyLocalOverlayToArray, getLocalCache]);

  /* ------------------------- INIT POD options ------------------------- */
  useEffect(() => {
    fetch(`${PATH}/pod`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(r.status.toString());
        return r.json();
      })
      .then((pods: PodInfo[]) => {
        const filtered = pods.filter((p) => p.id.toUpperCase() !== "ALL");
        setPodOptions([{ id: "ALL", sede: "Tutte le sedi" }, ...filtered]);
        setPod({ id: "ALL", sede: "Tutte le sedi" });
      })
      .catch(() => setPodOptions([]));
  }, []);

  /* ------------------- ricarica quando cambiano deps ------------------- */
  useEffect(() => {
    loadForecasts();
  }, [loadForecasts]);

  /* --------------------------- Update row ----------------------------- */
  type UpdateRow = <K extends keyof MeseDati>(i: number, field: K, value: MeseDati[K]) => void;
  const updateRow: UpdateRow = useCallback((i, field, value) => {
    setRows((rs) => {
      const nr = [...rs];
      nr[i] = { ...nr[i], [field]: value };
      return nr;
    });
  }, []);

  /* ------------------------ Persistenza locale ------------------------ */
  const handleLocalPersist = useCallback(
    (monthIndex1Based: number, payload: LocalCacheMonth) => {
      if (!pod) return;

      putLocalCache(pod.id, anno, monthIndex1Based, payload);

      const r = rows[monthIndex1Based - 1];
      if (r) {
        const baseCons = Number(r.consumiBase ?? 0);
        const baseSpesa = Number(r.prezzoEnergiaBase ?? 0);
        const baseOneri = Number(r.oneriBase ?? 0);
        const pCons = Number(r.consumiPerc ?? 0) / 100;
        const pPrez = Number(r.prezzoEnergiaPerc ?? 0) / 100;
        const pOneri = Number(r.oneriPerc ?? 0) / 100;

        const nextConsumi = baseCons * (1 + pCons);
        const unitPricePrev = baseCons > 0 ? (baseSpesa / baseCons) * (1 + pPrez) : 0;
        const nextSpesa = unitPricePrev * nextConsumi;
        const nextOneri = baseOneri * (1 + pOneri);

        putLocalCache(pod.id, anno + 1, monthIndex1Based, {
          prezzoEnergiaBase: nextSpesa,
          consumiBase: nextConsumi,
          oneriBase: nextOneri,
          prezzoEnergiaPerc: 0,
          consumiPerc: 0,
          oneriPerc: 0,
          ts: (payload.ts ?? Date.now()) + 1,
        });
      }
    },
    [pod, anno, rows, putLocalCache]
  );

  /* ------------------------- EXPORT EXCEL ----------------------------- */
  const handleExportExcel = async () => {
    if (!pod) return;
    try {
      const url = `${PATH}/budget/export?pod=${encodeURIComponent(pod.id)}&anno=${anno}`;
      const res = await fetch(url, { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error(`Errore export: ${res.status}`);

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `budget_${pod.id}_${anno}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Errore export", text: error.message });
    }
  };

  /* ------------------------- REFRESH DATASET PBI ---------------------- */
  const handleRefreshAll = async () => {
  setIsRefreshing(true);
      try {
          // Costruisci l'URL con i query parameters
          const url = `${PATH}/proxy/budget/consolidato/push?year=${anno}&pod=${encodeURIComponent(pod?.id ?? '')}`;

          const pushRes = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({})
          });

    if (!pushRes.ok) {
      const t = await pushRes.text();
      throw new Error(`POST /proxy/budget/consolidato/push: ${pushRes.status} ${t || pushRes.statusText}`);
    }

    // Refresh del report
    await reportHandleRef.current?.refresh();

    toast({
      title: "Consolidato",
      description: "Dati consolidati inviati a Power BI e report aggiornato.",
    });
  } catch (e: any) {
    console.error("Errore push consolidato:", e);
    toast({
      variant: "destructive",
      title: "Errore aggiornamento",
      description: e?.message ?? "Impossibile inviare il consolidato.",
    });
  } finally {
    setIsRefreshing(false);
  }
};


  const currentYear = new Date().getFullYear();

    /* ------------------------- CLEAR DATASET PBI ------------------------- */
  const handleClearAll = async () => {
    setIsRefreshing(true);
    try {
      // 1) chiama /proxy/bollette
      const bolletteRes = await fetch(`${PATH}/proxy/bollette`, {
        method: "GET",
        credentials: "include",
      });
      if (!bolletteRes.ok) {
        const t = await bolletteRes.text();
        throw new Error(`Errore svuotamento bollette: ${bolletteRes.status} ${t || bolletteRes.statusText}`);
      }

      // chiama /proxy/budget
      const budgetRes = await fetch(`${PATH}/proxy/budget`, {
        method: "GET",
        credentials: "include",
      });
      if (!budgetRes.ok) {
        const t = await budgetRes.text();
        throw new Error(`Errore svuotamento budget: ${budgetRes.status} ${t || budgetRes.statusText}`);
      }

      await reportHandleRef.current?.refresh();

      toast({
        title: "Dataset svuotato",
        description: "Bollette e Budget resettati correttamente in Power BI.",
      });
    } catch (e: any) {
      console.error("Errore clear dataset:", e);
      toast({
        variant: "destructive",
        title: "Errore svuotamento",
        description: e?.message ?? "Impossibile svuotare i dataset.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };


  /* ------------------------------ RENDER ------------------------------ */

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Budget Energia</h1>
          <p className="text-lg text-gray-700">Pianifica, monitora e ottimizza il budget energetico della tua azienda</p>
        </div>
<div className="flex items-center gap-2">
  <Button
    variant="outline"
    onClick={handleRefreshAll}
    disabled={isRefreshing}
    className="flex items-center gap-2"
  >
    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    {isRefreshing ? "Aggiornamento..." : "Aggiorna dati"}
  </Button>

  <Button
    variant="destructive"
    onClick={handleClearAll}
    disabled={isRefreshing}
    className="flex items-center gap-2"
  >
    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    {isRefreshing ? "Svuotamento..." : "Svuota dati"}
  </Button>
</div>

      </div>

      <SecondaryNavbar items={NAV_TABS} activeItemId={activeTab} onItemClick={setActiveTab} />

      {activeTab === "pbi" ? (
        <>
          <div className="bg-white rounded-md shadow p-6 mb-6 border border-gray-200">
            <div className="flex gap-6">
              {/* Seleziona POD */}
              <div className="flex-1">
                <Label className="block text-sm font-medium mb-2">Seleziona POD</Label>
                <Select
                  value={pod?.id ?? ""}
                  onValueChange={(v) => setPod(podOptions.find((p) => p.id === v) ?? null)}
                  disabled={!podOptions.length}
                >
                  <SelectTrigger className="w-full h-10 bg-white">
                    <SelectValue>{pod?.sede ?? pod?.id ?? "Seleziona POD"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {podOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.sede ? `${o.sede} (${o.id})` : o.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Anno */}
              <div className="flex-1">
                <Label className="block text-sm font-medium mb-2">Anno</Label>
                <Select value={String(anno)} onValueChange={(v) => setAnno(Number(v))}>
                  <SelectTrigger className="w-full h-10 bg-white">
                    <SelectValue>{anno}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.filter((y) => y <= currentYear + 1).map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          <Card className="mt-6">
            <CardContent className="pt-4">
              <PowerBIReportEmbed
                reportId={energyportfolio.reports.budget.reportId}
                pathBase={PATH}
                ref={reportHandleRef}
                pod={pod?.id ?? undefined}
                anno={anno}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="bg-white rounded-md shadow p-6 mb-6 border border-gray-200">
            <div className="flex items-center gap-6">
              {/* Seleziona POD */}
              <div className="flex-1 max-w-[420px] mb-7">
                <Label className="block text-sm font-medium mb-1">Seleziona POD</Label>
                <Select value={pod?.id ?? ""} onValueChange={(v) => setPod(podOptions.find((p) => p.id === v) ?? null)} disabled={!podOptions.length}>
                  <SelectTrigger className="bg-white">
                    <SelectValue>{pod?.sede ?? pod?.id ?? "Seleziona POD"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {podOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.sede ? `${o.sede} (${o.id})` : o.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Anno */}
              <div className="flex flex-col flex-1 max-w-[420px] mb-2">
                <Label className="block text-sm font-medium mb-1">Anno</Label>
                <Select value={String(anno)} onValueChange={(v) => setAnno(Number(v))}>
                  <SelectTrigger className={hasData ? "bg-white" : "bg-white border-red-300"}>
                    <SelectValue>{anno}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.filter((y) => y <= currentYear + 1).map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-red-500 text-xs mt-1" style={{ visibility: hasData ? "hidden" : "visible", minHeight: "1rem" }}>
                  Nessuna bolletta trovata
                </p>
              </div>

              {/* Export */}
              <div className="flex-1 flex justify-end max-w-m">
                <Button
                  size="sm"
                  onClick={handleExportExcel}
                  disabled={!hasData || !pod}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Scarica Excel
                </Button>
              </div>
            </div>
          </div>

          {/* Griglia mesi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((r, i) => (
              <BudgetCard
                key={`${r.mese}-${pod?.id}-${anno}`}
                data={r}
                idx={i}
                updateRow={updateRow}
                podCode={pod?.id ?? ""}
                anno={anno}
                onSaveSuccess={loadForecasts}
                onLocalPersist={(m, payload) => handleLocalPersist(m, payload)}
              />
            ))}
          </div>
        </>
      )}

      {/* Note */}
      <div className="mt-8">
        <NotesSection title="Note sul Controllo">
          <p className="text-sm text-gray-600">
            Usa gli slider blu per impostare le variazioni percentuali rispetto ai dati base mensili.
            <br />
            La spesa totale viene ricalcolata in tempo reale e non è modificabile.
          </p>
        </NotesSection>
      </div>
    </div>
  );
};

export default BudgetPage;
