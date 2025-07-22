import React, { useState, useEffect, useCallback } from "react";
import { SecondaryNavbar, type NavItem } from "@/components/energy-portfolio/SecondaryNavbar";
import { NotesSection } from "@/components/energy-portfolio/NotesSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { Download } from "lucide-react";

interface MeseDati {
  mese: string;
  prezzoEnergiaPerc: number;
  consumiPerc: number;
  oneriPerc: number;
  prezzoEnergiaBase: number;
  consumiBase: number;
  oneriBase: number;
  spesaTotale: number;
  editable: boolean;
}

export interface PodInfo {
  id: string;
  sede?: string;
}

const PATH   = "http://localhost:8081";
const YEARS  = Array.from({ length: 8 }, (_, i) => 2023 + i);
const MONTHS = [
  "Gennaio","Febbraio","Marzo","Aprile",
  "Maggio","Giugno","Luglio","Agosto",
  "Settembre","Ottobre","Novembre","Dicembre",
];
const NAV_TABS: NavItem[] = [
  { id: "pbi",    label: "Analisi Budget" },
  { id: "budget", label: "Previsioni Budget" },
];
type TabId = NavItem["id"];

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/* -------------------------------------------------------------------------- */
/*                                   CARD                                     */
/* -------------------------------------------------------------------------- */
const BudgetCard: React.FC<{
  data: MeseDati;
  idx: number;
  updateRow: <K extends keyof MeseDati>(i: number, field: K, value: MeseDati[K]) => void;
  podCode: string;
  anno: number;
  onSaveSuccess: () => Promise<void>;
}> = ({ data, idx, updateRow, podCode, anno, onSaveSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);

  // Prezzo energia come prezzo_energia_base diviso consumi_base, poi modificato dalla variazione %
  const prezzoEnergia = data.consumiBase > 0
    ? (data.prezzoEnergiaBase / data.consumiBase) * (1 + data.prezzoEnergiaPerc / 100)
    : 0;

  const consumi = data.consumiBase * (1 + data.consumiPerc / 100);
  const oneri = data.oneriBase * (1 + data.oneriPerc / 100);
  const spesaTotale = prezzoEnergia * consumi + oneri;

  /* ------------------------------ Save single ----------------------------- */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (podCode === "ALL") {
        const body = {
          utenteId: 1,
          podId: podCode,
          anno,
          mese: idx + 1,
          prezzoEnergiaBase: data.prezzoEnergiaBase,
          consumiBase: data.consumiBase,
          oneriBase: data.oneriBase,
          prezzoEnergiaPerc: data.prezzoEnergiaPerc,
          consumiPerc: data.consumiPerc,
          oneriPerc: data.oneriPerc,
        };
        const res = await fetch(`${PATH}/budget/all`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
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
      }
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
        {/* -------------------------- Lato sinistro -------------------------- */}
        <div className="flex-1 p-4">
          <CardHeader className="p-0 pb-2 border-b border-gray-100 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-blue-600" />
              <CardTitle className="text-gray-800 text-base font-semibold">{data.mese}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0 pt-4 flex flex-col gap-6">
            {[
              {
                label: "Prezzo Energia",
                baseValue: `${prezzoEnergia.toFixed(4)} €/kWh`,
                percValue: data.prezzoEnergiaPerc,
              },
              {
                label: "Consumi",
                baseValue: `${consumi.toFixed(2)} kWh`,
                percValue: data.consumiPerc,
              },
              {
                label: "Oneri",
                baseValue: euroFormatter.format(oneri),
                percValue: data.oneriPerc,
              },
            ].map(({ label, baseValue, percValue }) => (
              <div key={label} className="flex items-center justify-between gap-6">
                <div className="flex flex-col">
                  <Label className="block text-xs mt-1 text-gray-500">{label}</Label>
                  <div className="font-bold text-lg">{baseValue}</div>
                </div>
                <div className="flex flex-col items-end min-w-[80px]">
                  <span className="text-xs text-gray-500">
                    ({percValue >= 0 ? "+" : ""}{percValue.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}

            <div>
              <Label className="block text-xs mb-1 text-gray-500">Spesa Totale</Label>
              <div className="font-bold text-lg text-blue-700">{euroFormatter.format(spesaTotale)}</div>
            </div>
          </CardContent>
        </div>

        {/* -------------------------- Lato destro --------------------------- */}
        <div className="flex-2 flex flex-col justify-center p-5 gap-12 border-l border-gray-100 bg-gray-50 pt-12">
          {["prezzoEnergiaPerc", "consumiPerc", "oneriPerc"].map(field => {
            const value = data[field as keyof MeseDati] as number;
            const pos   = (value + 100) / 2;
            const bg    = `linear-gradient(to right,#2563eb 0%,#2563eb ${pos}%,#e5e7eb ${pos}%,#e5e7eb 100%)`;

            return (
              <div key={field} className="flex flex-col gap-2">
                <Label className="block text-sm font-medium mb-1">
                  {field === "prezzoEnergiaPerc"
                    ? "Prezzo Energia (%)"
                    : field === "consumiPerc"
                    ? "Consumi (%)"
                    : "Oneri (%)"}
                </Label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={value}
                  onChange={e => updateRow(idx, field as any, parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg cursor-pointer"
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
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow mt-auto"
          >
            {isSaving ? <span className="animate-pulse">Salvataggio…</span> : "Salva"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*                                MAIN PAGE                                   */
/* -------------------------------------------------------------------------- */
const BudgetPage: React.FC = () => {
  const [activeTab, setActiveTab]   = useState<TabId>("pbi");
  const [podOptions, setPodOptions] = useState<PodInfo[]>([]);
  const [pod, setPod]               = useState<PodInfo | null>(null);
  const [anno, setAnno]             = useState(2025);

  const [rows, setRows] = useState<MeseDati[]>(() =>
    MONTHS.map(m => ({
      mese: m,
      prezzoEnergiaPerc: 0,
      consumiPerc: 0,
      oneriPerc: 0,
      prezzoEnergiaBase: 0.1,
      consumiBase: 1000,
      oneriBase: 500,
      spesaTotale: 0,
      editable: true,
    }))
  );
  const [hasData, setHasData] = useState(true);

  /* -------------------------- LOAD FORECASTS --------------------------- */
  const loadForecasts = useCallback(async () => {
    try {
      /* ---------------------------- POD = ALL --------------------------- */
      if (pod?.id === "ALL") {
        const podSingoli = podOptions.filter(p => p.id !== "ALL");

        /* Carica bilanci per ogni POD */
        let allDataPerPod = await Promise.all(
          podSingoli.map(async podItem => {
            const res = await fetch(`${PATH}/budget/${podItem.id}/${anno}`, { credentials: "include" });
            if (!res.ok) return null;
            return await res.json();
          })
        );

        /* Fallback: anno precedente */
        const allDataEmpty = allDataPerPod.every(d => !d || d.length === 0);
        if (allDataEmpty && anno > YEARS[0]) {
          allDataPerPod = await Promise.all(
            podSingoli.map(async podItem => {
              const res = await fetch(`${PATH}/budget/${podItem.id}/${anno - 1}`, { credentials: "include" });
              if (!res.ok) return [];
              return await res.json();
            })
          );
        }

        /* Nessun dato nemmeno nel fallback */
        const isEmptyAfterFallback = allDataPerPod.every(d => !d || d.length === 0);
        if (isEmptyAfterFallback) {
          setHasData(false);
          setRows(MONTHS.map(m => ({
            mese: m,
            prezzoEnergiaPerc: 0,
            consumiPerc: 0,
            oneriPerc: 0,
            prezzoEnergiaBase: 0.1,
            consumiBase: 0,
            oneriBase: 0,
            spesaTotale: 0,
            editable: false,
          })));
          return;
        }

        /* Aggregazione con somma di consumi e oneri e prezzo energia singolo */
        const aggregatedData: MeseDati[] = MONTHS.map((meseNome, idx) => {
          const meseIndex = idx + 1;

          let consumiSum = 0;
          let oneriSum = 0;
          let prezzoEnergiaBaseSingolo: number | null = null;
          let prezzoEnergiaPercSingolo: number | null = null;

          allDataPerPod.forEach(podData => {
            if (!podData) return;
            const rec = podData.find((d: any) => d.mese === meseIndex);
            if (rec) {
              if (prezzoEnergiaBaseSingolo === null && typeof rec.prezzoEnergiaBase === "number") {
                prezzoEnergiaBaseSingolo = rec.prezzoEnergiaBase;
                prezzoEnergiaPercSingolo = rec.prezzoEnergiaPerc;
              }
              if (typeof rec.consumiBase === "number") consumiSum += rec.consumiBase;
              if (typeof rec.oneriBase === "number") oneriSum += rec.oneriBase;
            }
          });

          const prezzoEnergiaBase = prezzoEnergiaBaseSingolo ?? 0.1;
          const prezzoEnergiaPerc = prezzoEnergiaPercSingolo ?? 0;

          const prezzoEnergia = consumiSum > 0
            ? (prezzoEnergiaBase / consumiSum) * (1 + prezzoEnergiaPerc / 100)
            : 0;

          const spesaTotale = prezzoEnergia * consumiSum + oneriSum;

          return {
            mese: meseNome,
            prezzoEnergiaPerc: prezzoEnergiaPerc,
            consumiPerc: 0,
            oneriPerc: 0,
            prezzoEnergiaBase: prezzoEnergiaBase,
            consumiBase: consumiSum,
            oneriBase: oneriSum,
            spesaTotale,
            editable: true,
          };
        });

        setRows(aggregatedData);
        setHasData(true);

      /* -------------------------- POD singolo --------------------------- */
      } else if (pod) {
        let res  = await fetch(`${PATH}/budget/${pod.id}/${anno}`, { credentials: "include" });
        let data = res.ok ? await res.json() : [];

        /* Fallback anno precedente se vuoto */
        if ((!data || data.length === 0) && anno > YEARS[0]) {
          res = await fetch(`${PATH}/budget/${pod.id}/${anno - 1}`, { credentials: "include" });
          if (res.ok) data = await res.json();
        }

        /* Nessun dato */
        if (!data || data.length === 0) {
          setHasData(false);
          setRows(MONTHS.map(m => ({
            mese: m,
            prezzoEnergiaPerc: 0,
            consumiPerc: 0,
            oneriPerc: 0,
            prezzoEnergiaBase: 0.1,
            consumiBase: 0,
            oneriBase: 0,
            spesaTotale: 0,
            editable: false,
          })));
          return;
        }

        /* Popola righe */
        setHasData(true);
        setRows(MONTHS.map((m, idx) => {
          const rec = data.find((d: any) => d.mese === idx + 1);

          // Calcolo prezzo energia come prezzo_energia_base / consumi_base * (1 + variazione)
          const prezzoEnergiaBase = rec?.prezzoEnergiaBase ?? 0.1;
          const consumiBase = rec?.consumiBase ?? 0;

          const prezzoEnergia = consumiBase > 0
            ? (prezzoEnergiaBase / consumiBase) * (1 + (rec?.prezzoEnergiaPerc ?? 0) / 100)
            : 0;

          const consumi = (rec?.consumiBase ?? 0) * (1 + (rec?.consumiPerc ?? 0) / 100);
          const oneri = (rec?.oneriBase ?? 0) * (1 + (rec?.oneriPerc ?? 0) / 100);
          const spesaTotale = prezzoEnergia * consumi + oneri;

          return {
            mese: m,
            prezzoEnergiaPerc: rec?.prezzoEnergiaPerc ?? 0,
            consumiPerc:       rec?.consumiPerc       ?? 0,
            oneriPerc:         rec?.oneriPerc         ?? 0,
            prezzoEnergiaBase: prezzoEnergiaBase,
            consumiBase,
            oneriBase:         rec?.oneriBase         ?? 0,
            spesaTotale,
            editable: true,
          };
        }));

      /* ----------------------- Nessun POD selezionato -------------------- */
      } else {
        setHasData(false);
        setRows(MONTHS.map(m => ({
          mese: m,
          prezzoEnergiaPerc: 0,
          consumiPerc: 0,
          oneriPerc: 0,
          prezzoEnergiaBase: 0.1,
          consumiBase: 0,
          oneriBase: 0,
          spesaTotale: 0,
          editable: false,
        })));
      }
    } catch {
      setHasData(false);
      setRows(rs => rs.map(r => ({ ...r, editable: false })));
    }
  }, [pod, anno, podOptions]);

  /* ------------------------- INIT pod options -------------------------- */
  useEffect(() => {
    fetch(`${PATH}/pod`, { credentials: "include" })
      .then(r => {
        if (!r.ok) throw new Error(r.status.toString());
        return r.json();
      })
      .then((pods: PodInfo[]) => {
        const filtered = pods.filter(p => p.id.toUpperCase() !== "ALL");
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
  const updateRow = useCallback(<K extends keyof MeseDati>(i: number, field: K, value: MeseDati[K]) => {
    setRows(rs => {
      const nr = [...rs];
      nr[i] = { ...nr[i], [field]: value };
      return nr;
    });
  }, []);

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

  /* -------------------------------- RENDER ----------------------------- */
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Energia</h1>
        <p className="text-lg text-gray-700">
          Pianifica, monitora e ottimizza il budget energetico della tua azienda
        </p>
      </div>

      <SecondaryNavbar items={NAV_TABS} activeItemId={activeTab} onItemClick={setActiveTab} />

      {/* ----------------------------- TAB PBI ----------------------------- */}
      {activeTab === "pbi" ? (
        <Card className="mt-6">
          <CardHeader />
          <CardContent className="flex items-center justify-center" style={{ height: 800 }}>
            <p className="text-sm text-gray-600">Sezione in sviluppo…</p>
          </CardContent>
        </Card>
      ) : (
        /* --------------------------- TAB BUDGET -------------------------- */
        <>
          <div className="bg-white rounded-md shadow p-6 mb-6 border border-gray-200">
            <div className="flex items-center gap-6">
              {/* ----------------------- Seleziona POD ---------------------- */}
              <div className="flex-1 max-w-[420px] mb-7">
                <Label className="block text-sm font-medium mb-1">Seleziona POD</Label>
                <Select
                  value={pod?.id ?? ""}
                  onValueChange={v => setPod(podOptions.find(p => p.id === v) ?? null)}
                  disabled={!podOptions.length}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue>{pod?.sede ?? pod?.id ?? "Seleziona POD"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {podOptions.map(o => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.sede ? `${o.sede} (${o.id})` : o.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* -------------------------- Anno --------------------------- */}
              <div className="flex flex-col flex-1 max-w-[420px] mb-2">
                <Label className="block text-sm font-medium mb-1">Anno</Label>
                <Select value={String(anno)} onValueChange={v => setAnno(Number(v))}>
                  <SelectTrigger className={hasData ? "bg-white" : "bg-white border-red-300"}>
                    <SelectValue>{anno}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p
                  className="text-red-500 text-xs mt-1"
                  style={{ visibility: hasData ? "hidden" : "visible", minHeight: "1rem" }}
                >
                  Nessuna bolletta trovata
                </p>
              </div>

              {/* ------------------- Bottone Export ------------------------- */}
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

          {/* ------------------------ Griglia card ------------------------ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((r, i) => (
              <BudgetCard
                key={`${r.mese}-${pod?.id}`}
                data={r}
                idx={i}
                updateRow={updateRow}
                podCode={pod?.id ?? ""}
                anno={anno}
                onSaveSuccess={loadForecasts}
              />
            ))}
          </div>
        </>
      )}

      {/* ---------------------------- Note ------------------------------ */}
      <div className="mt-8">
        <NotesSection title="Note sul Controllo">
          <p className="text-sm text-gray-600">
            Usa gli slider blu per impostare le variazioni percentuali rispetto ai dati base mensili.<br />
            La spesa totale viene ricalcolata in tempo reale e non è modificabile.
          </p>
        </NotesSection>
      </div>
    </div>
  );
};

export default BudgetPage;
