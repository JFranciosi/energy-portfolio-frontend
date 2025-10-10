// src/components/energy-portfolio/ExportBollette.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Download,
  Loader2,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Check,
  X,
  Calendar as CalendarIcon,
  Eye,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

/* ---------------- TYPES ----------------- */
type GroupBy = 'fattura' | 'mese' | 'pod';
type Orientation = 'wide' | 'long';
type DecimalSep = 'comma' | 'dot';

/** Colonne esportabili (SOLO quelle richieste) */
export type ExportFieldKey =
  | 'id_pod'
  | 'Indirizzo'
  | 'CAP'
  | 'Localita'
  | 'Numero_Fattura'
  | 'Data_Fattura'
  | 'Fornitore'
  | 'Distributore'
  | 'Competenza'
  | 'Cod'
  | 'Descrizione'
  | 'Unita_Misura'
  | 'Quantita'
  | 'Corrispettivo_Unitario'
  | 'Totale_Voce'
  | 'IVA'
  | 'Parziali'
  | 'Totale2'
  | 'Note';

export interface BillFile {
  id: string;
  fileName: string;
  idPod: string;
  uploadDate?: string;
  size?: string;
}
export interface Pod {
  id: string;
  fornitore?: string;
}

type Preset = {
  name: string;
  payload: {
    selectedFields: ExportFieldKey[];
    aliases: Record<ExportFieldKey, string>;
    groupBy: GroupBy;
    orientation: Orientation;
    decimalSep: DecimalSep;
  };
  createdAt: string;
};

/* ------------------ CAMPI (solo richiesti) ------------------ */
const FIELDS: { key: ExportFieldKey; label: string; defaultAlias: string }[] = [
  { key: 'id_pod', label: 'POD', defaultAlias: 'POD' },
  { key: 'Indirizzo', label: 'INDIRIZZO', defaultAlias: 'INDIRIZZO' },
  { key: 'CAP', label: 'CAP', defaultAlias: 'CAP' },
  { key: 'Localita', label: "LOCALITA'", defaultAlias: "LOCALITA'" },
  { key: 'Numero_Fattura', label: 'NUMERO FATTURA', defaultAlias: 'NUMERO FATTURA' },
  { key: 'Data_Fattura', label: 'DATA', defaultAlias: 'DATA' },
  { key: 'Fornitore', label: 'FORNITORE', defaultAlias: 'FORNITORE' },
  { key: 'Distributore', label: 'DISTRIBUTORE', defaultAlias: 'DISTRIBUTORE' },
  { key: 'Competenza', label: 'COMPETENZA', defaultAlias: 'COMPETENZA' },
  { key: 'Cod', label: 'COD', defaultAlias: 'COD' },
  { key: 'Descrizione', label: 'DESCRIZIONE', defaultAlias: 'DESCRIZIONE' },
  { key: 'Unita_Misura', label: "UNITA' DI MISURA", defaultAlias: "UNITA' DI MISURA" },
  { key: 'Quantita', label: "QUANTITA'", defaultAlias: "QUANTITA'" },
  { key: 'Corrispettivo_Unitario', label: 'CORRISPETTIVO UNITARIO', defaultAlias: 'CORRISPETTIVO UNITARIO' },
  { key: 'Totale_Voce', label: 'TOTALE', defaultAlias: 'TOTALE' },
  { key: 'IVA', label: 'IVA', defaultAlias: 'IVA' },
  { key: 'Parziali', label: 'PARZIALI', defaultAlias: 'PARZIALI' },
  { key: 'Totale2', label: 'TOTALE2', defaultAlias: 'TOTALE2' },
  { key: 'Note', label: 'NOTE', defaultAlias: 'NOTE' },
];

/**
 * Mappa delle chiavi FE -> chiavi API attese dal backend (ExportService.KEY_TO_SQL)
 * Così puoi tenere le chiavi “belle” nel FE senza rompere la validazione lato server.
 */
const API_KEY_MAP: Record<ExportFieldKey, string> = {
  id_pod: 'id_pod',
  Indirizzo: 'INDIRIZZO',
  CAP: 'CAP',
  Localita: 'LOCALITA', // senza apostrofo nel backend
  Numero_Fattura: 'NUMERO_FATTURA',
  Data_Fattura: 'DATA_FATTURA',
  Fornitore: 'FORNITORE',
  Distributore: 'DISTRIBUTORE',
  Competenza: 'COMPETENZA',
  Cod: 'COD',
  Descrizione: 'DESCRIZIONE',
  Unita_Misura: 'UNITA_MISURA',
  Quantita: 'QUANTITA',
  Corrispettivo_Unitario: 'CORRISPETTIVO_UNITARIO',
  Totale_Voce: 'TOTALE_VOCE',
  IVA: 'IVA_PERCENT', // nel backend è IVA_Percent
  Parziali: 'PARZIALI',
  Totale2: 'TOTALE2',
  Note: 'NOTE',
};

/* ------------------ PRESET ------------------ */
const PRESETS_DEFAULT: Record<string, ExportFieldKey[]> = {
  Minimo: ['id_pod', 'Numero_Fattura', 'Data_Fattura', 'Totale_Voce'],
  Completo: FIELDS.map(f => f.key),
};

/* --------- ENDPOINT --------- */
//const PATH_DEV = 'http://localhost:8081';
const PATH_DEV = 'https://energyportfolio.it';
const API_PREVIEW = `${PATH_DEV}/api/export/preview`;
const API_EXPORT = `${PATH_DEV}/api/export/excel`;

/* --------------- UTILS ---------------- */
const fmtDate = (d?: Date | null) => (d ? d.toLocaleDateString('it-IT') : '');
const keyToLabel = (k: ExportFieldKey) => FIELDS.find(f => f.key === k)?.label ?? (k as string);
const defaultAliasMap = FIELDS.reduce<Record<ExportFieldKey, string>>((acc, f) => {
  acc[f.key] = f.defaultAlias;
  return acc;
}, {} as Record<ExportFieldKey, string>);

/* ------------------ COMPONENTI INTERNI ------------------ */
type MultiSelectOption = { value: string; label: string; description?: string };

function MultiSelect({
  label,
  placeholder,
  options,
  values,
  onChange,
  error,
  errorText,
  emptyText = 'Nessun risultato',
}: {
  label: string;
  placeholder: string;
  options: MultiSelectOption[];
  values: string[];
  onChange: (v: string[]) => void;
  error?: boolean;
  errorText?: string;
  emptyText?: string;
}) {
  const selected = useMemo(
    () => options.filter(o => values.includes(o.value)),
    [options, values]
  );

  const toggle = (val: string) => {
    if (values.includes(val)) onChange(values.filter(v => v !== val));
    else onChange([...values, val]);
  };

  return (
    <div className="space-y-2">
      <Label className="font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'w-full justify-between',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
          >
            <div className="flex flex-wrap gap-2 items-center">
              {selected.length === 0 && (
                <span className={cn('text-muted-foreground')}>{placeholder}</span>
              )}
              {selected.map(s => (
                <Badge key={s.value} variant="secondary" className="whitespace-nowrap">
                  {s.label}
                </Badge>
              ))}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0">
          <Command>
            <CommandInput placeholder={`Cerca ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map(o => {
                  const active = values.includes(o.value);
                  return (
                    <CommandItem
                      key={o.value}
                      onSelect={() => toggle(o.value)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{o.label}</span>
                        {o.description && (
                          <span className="text-xs text-muted-foreground">
                            {o.description}
                          </span>
                        )}
                      </div>
                      {active && <Check className="h-4 w-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex gap-2">
        {values.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange([])}>
            <X className="h-4 w-4 mr-1" />
            Svuota
          </Button>
        )}
      </div>
      {error && errorText && (
        <p className="text-sm text-destructive">{errorText}</p>
      )}
    </div>
  );
}

/** Range date con scorciatoie */
function DateRangePicker({
  start,
  end,
  onChange,
}: {
  start: Date | null;
  end: Date | null;
  onChange: (range: { start: Date | null; end: Date | null }) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnLabel =
    start && end
      ? `${fmtDate(start)} → ${fmtDate(end)}`
      : 'Seleziona intervallo';

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  const firstDayYear = new Date(today.getFullYear(), 0, 1);

  const setRange = (s: Date | null, e: Date | null) => onChange({ start: s, end: e });

  return (
    <div className="space-y-2">
      <Label className="font-medium">Periodo (opzionale)</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {btnLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto">
          <div className="p-3">
            <div className="flex flex-wrap gap-2 mb-3">
              <Button variant="secondary" size="sm" onClick={() => setRange(firstDayOfMonth, lastDayOfMonth)}>
                Questo mese
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setRange(firstDayPrevMonth, lastDayPrevMonth)}>
                Mese scorso
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setRange(firstDayYear, today)}>
                Anno corrente
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRange(null, null)}>
                Tutto
              </Button>
            </div>

            <Calendar
              mode="range"
              selected={{ from: start ?? undefined, to: end ?? undefined }}
              onSelect={(range: any) => {
                const s = range?.from ?? null;
                const e = range?.to ?? null;
                setRange(s, e);
              }}
              numberOfMonths={2}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRange(null, null)}>
                Reset
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Applica
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ------------------ PRINCIPALE ------------------ */
type PreviewRow = Record<string, string | number | null>;

const STORAGE_KEY = 'export-bollette-presets';

const ExportBollette: React.FC<{ data: BillFile[]; pod: Pod[] }> = ({ data, pod }) => {
  /* --------- Selettori --------- */
  const podOptions: MultiSelectOption[] = useMemo(
    () =>
      pod.map(p => ({
        value: p.id,
        label: p.id,
        description: p.fornitore ? `Fornitore: ${p.fornitore}` : undefined,
      })),
    [pod]
  );

  const billOptions: MultiSelectOption[] = useMemo(
    () =>
      data.map(b => ({
        value: b.id,
        label: b.fileName,
        description: b.uploadDate
          ? `POD: ${b.idPod} · ${new Date(b.uploadDate).toLocaleDateString('it-IT')}`
          : `POD: ${b.idPod}`,
      })),
    [data]
  );

  /* --------- Stato --------- */
  const [selectedPods, setSelectedPods] = useState<string[]>([]);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

  const [selectedFields, setSelectedFields] = useState<ExportFieldKey[]>(
    PRESETS_DEFAULT.Minimo
  );
  const [aliases, setAliases] =
    useState<Record<ExportFieldKey, string>>(defaultAliasMap);

  const [groupBy, setGroupBy] = useState<GroupBy>('fattura');
  const [orientation, setOrientation] = useState<Orientation>('wide');
  const [decimalSep, setDecimalSep] = useState<DecimalSep>('comma');

  const [previewLoading, setPreviewLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [previewCols, setPreviewCols] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // validazione: basta almeno POD o Bolletta
  const [podError, setPodError] = useState(false);
  const [billError, setBillError] = useState(false);

  // nascondi non selezionati
  const [hideUnselected, setHideUnselected] = useState(false);

  /* --------- Preset --------- */
  const [presets, setPresets] = useState<Preset[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPresets(JSON.parse(stored));
      setAliases(prev => ({ ...defaultAliasMap, ...prev }));
    } catch {
      // ignore
    }
  }, []);

  const persistPresets = (next: Preset[]) => {
    setPresets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const savePreset = () => {
    const payload: Preset['payload'] = {
      selectedFields,
      aliases,
      groupBy,
      orientation,
      decimalSep,
    };
    const name = newPresetName.trim();
    if (!name) return;
    const preset: Preset = {
      name,
      payload,
      createdAt: new Date().toISOString(),
    };
    const filtered = presets.filter(p => p.name !== preset.name);
    const next = [preset, ...filtered];
    persistPresets(next);
    setSaveDialogOpen(false);
    setNewPresetName('');
  };

  const loadPreset = (p: Preset) => {
    const pl = p.payload;
    if (pl && Array.isArray(pl.selectedFields)) setSelectedFields(pl.selectedFields);
    if (pl && pl.aliases) setAliases(pl.aliases);
    if (pl && pl.groupBy) setGroupBy(pl.groupBy);
    if (pl && pl.orientation) setOrientation(pl.orientation);
    if (pl && pl.decimalSep) setDecimalSep(pl.decimalSep);
  };

  const deletePreset = (name: string) => {
    const next = presets.filter(p => p.name !== name);
    persistPresets(next);
  };

  /* --------- Gestione Campi --------- */
  const toggleField = (key: ExportFieldKey) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const moveField = (key: ExportFieldKey, dir: 'up' | 'down') => {
    setSelectedFields(prev => {
      const idx = prev.indexOf(key);
      if (idx === -1) return prev;
      const next = [...prev];
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  const setAlias = (key: ExportFieldKey, value: string) => {
    setAliases(prev => ({ ...prev, [key]: value }));
  };

  const selectAll = () => setSelectedFields(FIELDS.map(f => f.key));
  const clearAll = () => setSelectedFields([]);

  const fieldsToRender = useMemo(
    () => (hideUnselected ? FIELDS.filter(f => selectedFields.includes(f.key)) : FIELDS),
    [hideUnselected, selectedFields]
  );

  /* --------- Validazione --------- */
  const validate = () => {
    const hasPod = selectedPods.length > 0;
    const hasBill = selectedBills.length > 0;
    const ok = hasPod || hasBill;
    setPodError(!ok && !hasBill);
    setBillError(!ok && !hasPod);
    return ok;
  };

  /* --------- Preview --------- */
  const onPreview = async () => {
    setPreviewError(null);
    if (!validate()) return;

    setPreviewLoading(true);
    try {
      const payload = {
        podIds: selectedPods,
        billIds: selectedBills,
        periodStart: periodStart ? periodStart.toISOString().slice(0, 10) : null,
        periodEnd: periodEnd ? periodEnd.toISOString().slice(0, 10) : null,
        fields: selectedFields.map(k => ({
          key: API_KEY_MAP[k], // <<<<<<<<<< allineamento chiave API
          alias: aliases[k] || keyToLabel(k),
        })),
        groupBy,
        orientation,
        decimalSep,
        limit: 200,
      };

      const res = await fetch(API_PREVIEW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Preview error: ${res.status}`);
      }

      const json = await res.json();

      let cols: string[] = [];
      let rows: PreviewRow[] = [];

      // Supporta {headers, rows} (nuovo BE)
      if (Array.isArray(json?.rows) && Array.isArray(json?.headers)) {
        cols = json.headers;
        rows = json.rows as PreviewRow[];
      }
      // Supporta {columns, rows} (vecchio shape)
      else if (Array.isArray(json?.rows) && Array.isArray(json?.columns)) {
        cols = json.columns;
        rows = (json.rows as any[]).map((r: any) => {
          if (Array.isArray(r)) {
            const obj: PreviewRow = {};
            cols.forEach((c, i) => (obj[c] = r[i] ?? null));
            return obj;
          }
          return r as PreviewRow;
        });
      }
      // Lista pura
      else if (Array.isArray(json)) {
        rows = json as PreviewRow[];
        cols = selectedFields.map(k => aliases[k] || keyToLabel(k));
      }
      // {data: []}
      else if (Array.isArray(json?.data)) {
        rows = json.data as PreviewRow[];
        cols = selectedFields.map(k => aliases[k] || keyToLabel(k));
      } else {
        throw new Error('Formato risposta preview non riconosciuto');
      }

      // Normalizza usando i tuoi alias
      const normalized = rows.map(r => {
        const out: PreviewRow = {};
        selectedFields.forEach(k => {
          const alias = aliases[k] || keyToLabel(k);
          const candidate = r[alias] ?? r[API_KEY_MAP[k]] ?? r[k] ?? r[keyToLabel(k)];
          out[alias] = (candidate ?? null) as any;
        });
        return out;
      });

      setPreviewCols(selectedFields.map(k => aliases[k] || keyToLabel(k)));
      setPreviewRows(normalized);
    } catch (err: any) {
      setPreviewCols([]);
      setPreviewRows([]);
      setPreviewError(err?.message || 'Errore durante la preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  /* --------- Export --------- */
  const onExport = async () => {
    if (!validate()) return;
    setExportLoading(true);
    try {
      const payload = {
        podIds: selectedPods,
        billIds: selectedBills,
        periodStart: periodStart ? periodStart.toISOString().slice(0, 10) : null,
        periodEnd: periodEnd ? periodEnd.toISOString().slice(0, 10) : null,
        fields: selectedFields.map(k => ({
          key: API_KEY_MAP[k], // <<<<<<<<<< allineamento chiave API
          alias: aliases[k] || keyToLabel(k),
        })),
        groupBy,
        orientation,
        decimalSep,
      };

      const res = await fetch(API_EXPORT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Export error: ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date();
      const ts = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.download = `export_bollette_${ts}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setPreviewError(err?.message || 'Errore durante export');
    } finally {
      setExportLoading(false);
    }
  };

  /* --------- UI --------- */
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Esporta Bollette in Excel</CardTitle>
        </div>

        {/* Preset manager */}
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(val) => {
              if (val.startsWith('def::')) {
                const defName = val.slice('def::'.length);
                const def = PRESETS_DEFAULT[defName];
                if (def) {
                  setSelectedFields(def);
                  setAliases(defaultAliasMap);
                  setGroupBy('fattura');
                  setOrientation('wide');
                  setDecimalSep('comma');
                }
              } else if (val.startsWith('user::')) {
                const name = val.slice('user::'.length);
                const p = presets.find(pr => pr.name === name);
                if (p) loadPreset(p);
              }
            }}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Carica preset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="def::Minimo">Minimo (Default)</SelectItem>
              <SelectItem value="def::Completo">Completo (Default)</SelectItem>
              {presets.map(p => (
                <SelectItem key={p.name} value={`user::${p.name}`}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setSaveDialogOpen(true)}>
            <Save className="h-4 w-4 mr-2" />
            Salva preset
          </Button>

          <Button variant="ghost" onClick={() => setManageDialogOpen(true)} title="Gestisci preset">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* FILTRI */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <MultiSelect
            label="POD *"
            placeholder="Seleziona uno o più POD"
            options={podOptions}
            values={selectedPods}
            onChange={(v) => {
              setSelectedPods(v);
              if (v.length > 0) setPodError(false);
            }}
            error={podError}
            errorText="Seleziona almeno un POD o una Bolletta."
          />

          <MultiSelect
            label="Bollette *"
            placeholder="Seleziona una o più bollette"
            options={billOptions}
            values={selectedBills}
            onChange={(v) => {
              setSelectedBills(v);
              if (v.length > 0) setBillError(false);
            }}
            error={billError}
            errorText="Seleziona almeno una Bolletta o un POD."
          />

          <DateRangePicker
            start={periodStart}
            end={periodEnd}
            onChange={({ start, end }) => {
              setPeriodStart(start);
              setPeriodEnd(end);
            }}
          />

          <div className="space-y-2">
            <Label className="font-medium">Raggruppa per</Label>
            <Select value={groupBy} onValueChange={(v: GroupBy) => setGroupBy(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fattura">Fattura</SelectItem>
                <SelectItem value="mese">Mese</SelectItem>
                <SelectItem value="pod">POD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Orientamento</Label>
            <Select value={orientation} onValueChange={(v: Orientation) => setOrientation(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wide">Wide (colonne)</SelectItem>
                <SelectItem value="long">Long (righe)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Separatore decimale</Label>
            <Select value={decimalSep} onValueChange={(v: DecimalSep) => setDecimalSep(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comma">Virgola (es. 1,23)</SelectItem>
                <SelectItem value="dot">Punto (es. 1.23)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CAMPI */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Campi</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={hideUnselected}
                    onChange={(e) => setHideUnselected(e.target.checked)}
                  />
                  Nascondi non selezionati
                </label>
                <Button variant="outline" size="sm" onClick={selectAll}>Seleziona tutti</Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>Svuota</Button>
              </div>
            </div>

            {hideUnselected && selectedFields.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2">
                Nessun campo selezionato.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 max-h-[420px] overflow-auto pr-1">
                {fieldsToRender.map(f => {
                  const checked = selectedFields.includes(f.key);
                  return (
                    <label
                      key={f.key}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-md border px-3 py-2 cursor-pointer',
                        checked && 'bg-accent'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          onChange={() => toggleField(f.key)}
                        />
                        <span className="text-sm">{f.label}</span>
                      </div>
                      {checked ? <Check className="h-4 w-4" /> : null}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ordine & Alias */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Ordine & Alias</h3>
            {selectedFields.length === 0 && (
              <p className="text-sm text-muted-foreground">Nessun campo selezionato.</p>
            )}
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {selectedFields.map(k => (
                <div key={k} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveField(k, 'up')}
                      title="Sposta su"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveField(k, 'down')}
                      title="Sposta giù"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="w-48 text-sm font-medium truncate">{keyToLabel(k)}</div>
                  <Input
                    className="flex-1"
                    value={aliases[k] ?? ''}
                    onChange={(e) => setAlias(k, e.target.value)}
                    placeholder="Alias colonna"
                  />
                  <Button variant="ghost" size="icon" onClick={() => toggleField(k)} title="Rimuovi campo">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AZIONI */}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onPreview} disabled={previewLoading}>
            {previewLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
            Anteprima
          </Button>
          <Button onClick={onExport} disabled={exportLoading}>
            {exportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Esporta Excel
          </Button>
          {(!selectedPods.length && !selectedBills.length) && (
            <p className="text-sm text-destructive">Seleziona almeno un POD o una Bolletta.</p>
          )}
          {previewError && <p className="text-sm text-destructive">{previewError}</p>}
        </div>

        {/* PREVIEW TABLE */}
        <div className="rounded-lg border overflow-auto">
          {previewLoading ? (
            <div className="p-6 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Caricamento anteprima...
            </div>
          ) : previewRows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Nessuna anteprima disponibile. Seleziona i parametri e clicca "Anteprima".
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50">
                <tr>
                  {previewCols.map(c => (
                    <th key={c} className="text-left font-semibold p-2 border-b">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30">
                    {previewCols.map(c => (
                      <td key={c} className="p-2 whitespace-nowrap">
                        {row[c] as any}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>

      {/* DIALOG: SALVA PRESET */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salva preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome preset</Label>
            <Input
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Es. Analisi base"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>Annulla</Button>
            <Button onClick={savePreset} disabled={!newPresetName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: GESTISCI PRESET (elimina) */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestisci preset</DialogTitle>
            <DialogDescription>Rimuovi i preset salvati localmente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-auto">
            {presets.length === 0 && (
              <p className="text-sm text-muted-foreground">Nessun preset salvato.</p>
            )}
            {presets.map(p => (
              <div key={p.name} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="flex flex-col">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Creato il {new Date(p.createdAt).toLocaleString('it-IT')}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deletePreset(p.name)} title="Elimina">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setManageDialogOpen(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ExportBollette;
