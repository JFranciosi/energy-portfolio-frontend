import React, { useState, useEffect, useCallback, useRef } from "react";
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
  prezzoEnergiaBase: number; // € spesa energia "base"
  consumiBase: number;       // kWh "base"
  oneriBase: number;         // € "base"
  spesaTotale: number;       // € calcolata
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
  onLocalPersist: (monthIndex1Based: number, payload: LocalCacheMonth) => void;
}> = ({ data, idx, updateRow, podCode, anno, onSaveSuccess, onLocalPersist }) => {
  const [isSaving, setIsSaving] = useState(false);

  // €/kWh corrente = (spesa base / kWh base) * (1 + %prezzo)
  const prezzoEnergia = data.consumiBase > 0
    ? (data.prezzoEnergiaBase / data.consumiBase) * (1 + data.prezzoEnergiaPerc / 100)
    : 0;

  const consumi = data.consumiBase * (1 + data.consumiPerc / 100);
  const oneri = data.oneriBase * (1 + data.oneriPerc / 100);
  const spesaTotale = prezzoEnergia * consumi + oneri;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (podCode === "ALL") {
        const payload = {
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

        let res = await fetch(`${PATH}/budget/all?anno=${anno}&mese=${idx + 1}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!res.ok && (res.status === 404 || res.status === 405)) {
          res = await fetch(`${PATH}/budget/all`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          if (res.status === 409 || /Duplicate entry/i.test(text)) {
            const res2 = await fetch(`${PATH}/budget/all?anno=${anno}&mese=${idx + 1}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(payload),
            });
            if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        }

        // Persisto tutto in cache locale
        onLocalPersist(idx + 1, {
          prezzoEnergiaPerc: data.prezzoEnergiaPerc,
          consumiPerc: data.consumiPerc,
          oneriPerc: data.oneriPerc,
          prezzoEnergiaBase: data.prezzoEnergiaBase,
          consumiBase: data.consumiBase,
          oneriBase: data.oneriBase,
          ts: Date.now(),
        });
      } else {
        // POD singolo: salvo solo le %
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
              { label: "Consumi",        baseValue: `${consumi.toFixed(2)} kWh`,         percValue: data.consumiPerc },
              { label: "Oneri",          baseValue: euroFormatter.format(oneri),         percValue: data.oneriPerc },
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

        {/* Destra */}
        <div className="flex-2 flex flex-col justify-center p-5 gap-12 border-l border-gray-100 bg-gray-50 pt-12">
          {["prezzoEnergiaPerc", "consumiPerc", "oneriPerc"].map(field => {
            const value = data[field as keyof MeseDati] as number;
            const pos   = (value + 100) / 2;
            const bg    = `linear-gradient(to right,#2563eb 0%,#2563eb ${pos}%,#e5e7eb ${pos}%,#e5e7eb 100%)`;

            return (
              <div key={field} className="flex flex-col gap-2">
                <Label className="block text-sm font-medium mb-1">
                  {field === "prezzoEnergiaPerc" ? "Prezzo Energia (%)" :
                   field === "consumiPerc"       ? "Consumi (%)" :
                                                    "Oneri (%)"}
                </Label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={value}
                  onChange={e => updateRow(idx, field as any, Number(e.target.value))}
                  className="w-full h-3 rounded-lg cursor-pointer"
                  disabled={!data.editable}
                  style={{ background: bg, WebkitAppearance: "none", MozAppearance: "none", appearance: "none", accentColor: "#2563eb" }}
                />
              </div>
            );
          })}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !data.editable}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow mt-auto disabled:opacity-50"
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
  const [anno, setAnno]             = useState<number>(new Date().getFullYear());

  const [rows, setRows]   = useState<MeseDati[]>([]);
  const [hasData, setHasData] = useState(true);

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

  const applyLocalOverlayToArray = useCallback((arr: any[], podId: string, year: number) => {
    return (arr || []).map((rec: any) => {
      const month = Number(rec?.mese);
      const lc = getLocalCache(podId, year, month);
      if (!lc) return rec;
      return {
        ...rec,
        prezzoEnergiaPerc: lc.prezzoEnergiaPerc ?? rec.prezzoEnergiaPerc,
        consumiPerc:       lc.consumiPerc       ?? rec.consumiPerc,
        oneriPerc:         lc.oneriPerc         ?? rec.oneriPerc,
        prezzoEnergiaBase: lc.prezzoEnergiaBase ?? rec.prezzoEnergiaBase,
        consumiBase:       lc.consumiBase       ?? rec.consumiBase,
        oneriBase:         lc.oneriBase         ?? rec.oneriBase,
      };
    });
  }, [getLocalCache]);

  const emptyRows = () =>
    MONTHS.map(m => ({
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
    const consumiBase       = Number(rec?.consumiBase ?? 0);
    const oneriBase         = Number(rec?.oneriBase ?? 0);
    const prezzoPerc        = Number(rec?.prezzoEnergiaPerc ?? 0);
    const consumiPerc       = Number(rec?.consumiPerc ?? 0);
    const oneriPerc         = Number(rec?.oneriPerc ?? 0);

    const prezzoEnergia = consumiBase > 0 ? (prezzoEnergiaBase / consumiBase) * (1 + prezzoPerc / 100) : 0;
    const consumi       = consumiBase * (1 + consumiPerc / 100);
    const oneri         = oneriBase * (1 + oneriPerc / 100);
    const spesaTotale   = prezzoEnergia * consumi + oneri;

    const hasAnyData = (consumiBase > 0 || oneriBase > 0 || prezzoEnergiaBase > 0);

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

  /* ----------------------- Mesi consentiti per fallback ---------------------- */
  // year < currentYear: tutti i mesi (anno passato)
  // year = currentYear: solo mesi conclusi
  // year = currentYear+1: solo mesi conclusi (nessun futuro)
  // year > currentYear+1: no fallback
  const allowedFallbackMonths = (year: number) => {
    const now = new Date();
    const currentYear  = now.getFullYear();
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

  // Utility: calcola basi "rollate" per l'anno successivo applicando le % dell'anno N
  const rollForwardBases = (rec: any) => {
    const baseCons = Number(rec?.consumiBase ?? 0);
    const baseSpesa = Number(rec?.prezzoEnergiaBase ?? 0);
    const baseOneri = Number(rec?.oneriBase ?? 0);
    const pCons = Number(rec?.consumiPerc ?? 0) / 100;
    const pPrez = Number(rec?.prezzoEnergiaPerc ?? 0) / 100;
    const pOneri = Number(rec?.oneriPerc ?? 0) / 100;

    const nextConsumi = baseCons * (1 + pCons);
    const unitPricePrev = baseCons > 0 ? (baseSpesa / baseCons) * (1 + pPrez) : 0; // €/kWh "modificato"
    const nextSpesa = unitPricePrev * nextConsumi; // € spesa energia "base" per anno N+1
    const nextOneri = baseOneri * (1 + pOneri);

    return {
      nextConsumi,
      nextSpesa,
      nextOneri,
    };
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
      // Non mostrare anni > currentYear+1
      if (year > currentYear + 1) {
        setHasData(false);
        setRows(emptyRows());
        return;
      }

      /* ---------------------------- POD = ALL --------------------------- */
      if (pod.id === "ALL") {
        const podsSingoli = podOptions.filter(p => p.id !== "ALL");
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

        // Dati anno selezionato
        let perPodAnno = await Promise.all(
          podsSingoli.map(async p => {
            const r = await fetch(`${PATH}/budget/${p.id}/${year}`, { credentials: "include" });
            return r.ok ? await r.json() : [];
          })
        );
        perPodAnno = perPodAnno.map((arr, i) => applyLocalOverlayToArray(arr, podsSingoli[i].id, year));

        // Dati anno precedente (per fallback)
        let perPodPrev: any[] = [];
        if (monthsAllowed.size > 0) {
          perPodPrev = await Promise.all(
            podsSingoli.map(async p => {
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

            let rec = arrA.find((d: any) =>
              d.mese === mese && Number(d.anno) === year
            ) || null;

            if (rec) {
              usedAnyAnno = true;
            } else if (monthsAllowed.has(mese)) {
              const prevRec = arrP.find((d: any) =>
                d.mese === mese && Number(d.anno) === prevYear
              ) || null;
              if (prevRec) {
                rec = prevRec;
                usedAnyPrev = true;
              }
            }

            if (rec) recs.push(rec);
          }

          const lcPrevAll = getLocalCache("ALL", prevYear, mese);

          // Nessun dato per i POD: prova fallback da "ALL" (prevYear) -> basi rollate, % = 0
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

          // Calcoli aggregati
          const consumiBases = recs.map(r => Number(r.consumiBase ?? 0));
          const oneriBases   = recs.map(r => Number(r.oneriBase ?? 0));
          const spesaBases   = recs.map(r => Number(r.prezzoEnergiaBase ?? 0));

          let consumiSum = consumiBases.reduce((a, b) => a + b, 0);
          let oneriSum   = oneriBases.reduce((a, b) => a + b, 0);
          let spesaSum   = spesaBases.reduce((a, b) => a + b, 0);

          let prezzoEnergiaPercAgg = wavg(recs.map(r => Number(r.prezzoEnergiaPerc ?? 0)), consumiBases);
          let consumiPercAgg       = wavg(recs.map(r => Number(r.consumiPerc ?? 0)),       consumiBases);
          let oneriPercAgg         = wavg(recs.map(r => Number(r.oneriPerc ?? 0)),         oneriBases);

          const lcCurrent = getLocalCache("ALL", year, mese);
          const lcPrev    = getLocalCache("ALL", prevYear, mese);

          if (lcCurrent && usedAnyAnno) {
            // Overlay "ALL" anno corrente
            prezzoEnergiaPercAgg = lcCurrent.prezzoEnergiaPerc ?? prezzoEnergiaPercAgg;
            consumiPercAgg       = lcCurrent.consumiPerc       ?? consumiPercAgg;
            oneriPercAgg         = lcCurrent.oneriPerc         ?? oneriPercAgg;
            spesaSum             = lcCurrent.prezzoEnergiaBase ?? spesaSum;
            consumiSum           = lcCurrent.consumiBase       ?? consumiSum;
            oneriSum             = lcCurrent.oneriBase         ?? oneriSum;
            } else if (!usedAnyAnno && usedAnyPrev && monthsAllowed.has(mese)) {
              // Fallback: basi "rollate" dei POD, percentuali azzerate
              let accSpesa = 0;
              let accCons  = 0;
              let accOneri = 0;

              for (const r of recs) {
                const { nextConsumi, nextSpesa: spesaN, nextOneri: oneriN } = rollForwardBases(r);
                accSpesa += spesaN;
                accCons  += nextConsumi;
                accOneri += oneriN;
              }

              prezzoEnergiaPercAgg = 0;
              consumiPercAgg       = 0;
              oneriPercAgg         = 0;
              spesaSum             = accSpesa;
              consumiSum           = accCons;
              oneriSum             = accOneri;
            }

          const prezzoEnergia = consumiSum > 0 ? (spesaSum / consumiSum) * (1 + prezzoEnergiaPercAgg / 100) : 0;
          const spesaTotale   = prezzoEnergia * (consumiSum * (1 + consumiPercAgg / 100)) + (oneriSum * (1 + oneriPercAgg / 100));

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

        const anyData = rowsAggregated.some(r => r.editable);
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
        const recAnno = dataAnno.find((d: any) =>
          d.mese === mese && Number(d.anno) === year
        ) || null;

        const recPrev = dataPrev.find((d: any) =>
          d.mese === mese && Number(d.anno) === prevYear
        ) || null;

        if (recAnno) {
          // Anno corrente: uso basi + percentuali salvate
          return buildRowFromRecord(meseNome, recAnno);
        } else if (recPrev && monthsAllowed.has(mese)) {
          // Fallback da prevYear: basi "rollate" (applico % dell'anno N), % = 0
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
          // Nessun dato
          return buildRowFromRecord(meseNome, null);
        }
      });

      const anyRowHasData = mergedRows.some(r => r.editable);
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
  type UpdateRow = <K extends keyof MeseDati>(i: number, field: K, value: MeseDati[K]) => void;
  const updateRow: UpdateRow = useCallback((i, field, value) => {
    setRows(rs => {
      const nr = [...rs];
      nr[i] = { ...nr[i], [field]: value };
      return nr;
    });
  }, []);

  /* ------------------------ Persistenza locale ------------------------ */
  const handleLocalPersist = useCallback((monthIndex1Based: number, payload: LocalCacheMonth) => {
    if (!pod) return;

    // 1) salva sull’anno corrente (LWW)
    putLocalCache(pod.id, anno, monthIndex1Based, payload);

    // 2) calcola e salva anche le basi "rollate" per l’anno successivo, %=0
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
        ts: (payload.ts ?? Date.now()) + 1, // LWW
      });
    }
  }, [pod, anno, rows, putLocalCache]);

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

  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Energia</h1>
        <p className="text-lg text-gray-700">
          Pianifica, monitora e ottimizza il budget energetico della tua azienda
        </p>
      </div>

      <SecondaryNavbar items={NAV_TABS} activeItemId={activeTab} onItemClick={setActiveTab} />

      {activeTab === "pbi" ? (
        <Card className="mt-6">
          <CardHeader />
          <CardContent className="flex items-center justify-center" style={{ height: 800 }}>
            <p className="text-sm text-gray-600">Sezione in sviluppo…</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="bg-white rounded-md shadow p-6 mb-6 border border-gray-200">
            <div className="flex items-center gap-6">
              {/* Seleziona POD */}
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

              {/* Anno */}
              <div className="flex flex-col flex-1 max-w-[420px] mb-2">
                <Label className="block text-sm font-medium mb-1">Anno</Label>
                <Select value={String(anno)} onValueChange={v => setAnno(Number(v))}>
                  <SelectTrigger className={hasData ? "bg-white" : "bg-white border-red-300"}>
                    <SelectValue>{anno}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.filter(y => y <= currentYear + 1).map(y => (
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
            Usa gli slider blu per impostare le variazioni percentuali rispetto ai dati base mensili.<br />
            La spesa totale viene ricalcolata in tempo reale e non è modificabile.
          </p>
        </NotesSection>
      </div>
    </div>
  );
};

export default BudgetPage;
