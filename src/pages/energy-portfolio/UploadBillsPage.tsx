import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecondaryNavbar } from '@/components/energy-portfolio/SecondaryNavbar';
import ExportBollette from './ExportBollette';
import { NotesSection } from '@/components/energy-portfolio/NotesSection';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, Search, ChevronDown, ChevronUp, Upload, Loader2, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

// HELPERS DATE
const parseISODate = (s?: string): Date | null => {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
};

const formatUploadDate = (s?: string): string => {
    const d = parseISODate(s);
    if (!d) return 'N/A';
    const fmt = new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    return fmt.format(d).replace(/,/, '');
};

const formatRelative = (s?: string): string => {
    const d = parseISODate(s);
    if (!d) return '';

    const diffMs = d.getTime() - Date.now();
    const abs = Math.abs(diffMs);
    const rtf = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' });

    const minute = 60000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (abs < 45000) return 'adesso';
    if (abs < hour) return rtf.format(Math.round(diffMs / minute), 'minute');
    if (abs < day) return rtf.format(Math.round(diffMs / hour), 'hour');
    return rtf.format(Math.round(diffMs / day), 'day');
};

const getTimeNumber = (s?: string): number => {
    const d = parseISODate(s);
    return d ? d.getTime() : -Infinity;
};

// INTERFACCE E COSTANTI
interface BillFile {
    id: string;
    fileName: string;
    idPod: string;
    uploadDate?: string;
    size?: string;
}

interface Pod {
    id: string;
    potenzaImpegnata: string;
    potenzaDisponibile: string;
    tensione: string;
    tipoTensione: string;
    fornitore: string;
    sede?: string;
    nazione?: string;
    cap?: string;
    tensioneAlimentazione?: string;
}

interface CostiState {
    f0: number;
    f1: number;
    f2: number;
    f3: number;
    f1spread?: number;
    f2spread?: number;
    f3spread?: number;
}

interface PeriodoCosti {
    id: string;
    meseInizio: number;
    costiData: CostiState;
    percentualeVariabile?: number;
}

interface CostiDinamici {
    percentualeVariabile?: number;
    periodi: PeriodoCosti[];
}

// Definizione tipi per evitare ESLint no-explicit-any
type TipoPrezzi = 'fisso' | 'indicizzato' | 'misto' | 'dinamico';
type TipoTariffa = 'monoraria' | 'bioraria' | 'trioraria';

// Interfacce per le API
interface CostiEnergiaRequest {
    clientId: number;
    year: number;
    tipoPrezzo: TipoPrezzi;
    tipoTariffa?: TipoTariffa;
    percentageVariable?: number;
    costF0?: number;
    costF1?: number;
    costF2?: number;
    costF3?: number;
    spreadF1?: number;
    spreadF2?: number;
    spreadF3?: number;
}

interface CostiEnergiaResponse {
    id: number;
    clientId: number;
    year: number;
    tipoPrezzo: TipoPrezzi;
    tipoTariffa?: TipoTariffa;
    percentageVariable?: number;
    costF0?: number;
    costF1?: number;
    costF2?: number;
    costF3?: number;
    spreadF1?: number;
    spreadF2?: number;
    spreadF3?: number;
    createdAt: string;
    updatedAt: string;
}

interface PeriodoCostiResponse {
    id: number;
    energyCostId: number;
    monthStart: number;
    costF1: number;
    costF2: number;
    costF3: number;
    createdAt: string;
}

const costiSchema = z.object({
    f0: z.coerce.number().min(0, 'Il valore deve essere positivo').optional(),
    f1: z.coerce.number().min(0, 'Il valore deve essere positivo').optional(),
    f2: z.coerce.number().min(0, 'Il valore deve essere positivo').optional(),
    f3: z.coerce.number().min(0, 'Il valore deve essere positivo').optional(),
    f1spread: z.coerce.number().min(0, 'Il valore deve essere positivo').optional(),
    f2spread: z.coerce.number().min(0, 'Il valore deve essere positivo').optional(),
    f3spread: z.coerce.number().min(0, 'Il valore deve essere positivo').optional(),
});

const costiDinamiciSchema = z.object({
    percentualeVariabile: z.coerce.number().min(0).max(100).optional(),
});

// FORM COSTI MODIFICATO
const CostiForm: React.FC = () => {
    const PATH_DEV = 'http://localhost:8081';
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Lista anni disponibili dal 2023 al 2034
    const anniDisponibili = [2023, 2024, ...Array.from({ length: 10 }, (_, i) => 2025 + i)];

    // Nuovi stati per la gestione avanzata
    const [tipoPrezzi, setTipoPrezzi] = useState<TipoPrezzi>('fisso');
    const [tipoTariffa, setTipoTariffa] = useState<TipoTariffa>('monoraria');
    const [annoSelezionato, setAnnoSelezionato] = useState<number>(2025);
    const [costiDinamici, setCostiDinamici] = useState<CostiDinamici>({
        periodi: [{
            id: '1',
            meseInizio: 1,
            costiData: { f0: 0, f1: 0, f2: 0, f3: 0}
        }]
    });
    const [energyCostId, setEnergyCostId] = useState<number | null>(null);

    const form = useForm({
        resolver: zodResolver(costiSchema),
        defaultValues: {} as any, // lascia vuoto: i campi saranno '' finché non li setti
    });

    const formDinamici = useForm({
        resolver: zodResolver(costiDinamiciSchema),
        //defaultValues: { percentualeVariabile: 0 },
    });

    // Carica i dati esistenti quando cambia l'anno
    useEffect(() => {
        if (annoSelezionato) {
            fetchCostiCliente(annoSelezionato);
        }
    }, [annoSelezionato]);

    const fetchCostiCliente = async (year: number) => {
        setLoading(true);
        try {
            const response = await fetch(`${PATH_DEV}/costi-energia/${year}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data: CostiEnergiaResponse = await response.json();

                // Aggiorna gli stati con i dati recuperati
                setTipoPrezzi(data.tipoPrezzo);
                if (data.tipoTariffa) setTipoTariffa(data.tipoTariffa);
                setEnergyCostId(data.id);

                // Aggiorna il form con i valori
                const formValues = {
                    f0: data.costF0 ?? undefined,
                    f1: data.costF1 ?? undefined,
                    f2: data.costF2 ?? undefined,
                    f3: data.costF3 ?? undefined,
                    f1spread: data.spreadF1 ?? undefined,
                    f2spread: data.spreadF2 ?? undefined,
                    f3spread: data.spreadF3 ?? undefined,
                };
                Object.entries(formValues).forEach(([k, v]) => {
                    form.setValue(k as any, v as any, { shouldDirty: false });
                });

                if (data.percentageVariable) {
                    formDinamici.setValue('percentualeVariabile', data.percentageVariable);
                }

                // Se è dinamico, carica anche i periodi
                if (data.tipoPrezzo === 'dinamico' && data.id) {
                    await fetchPeriodiDinamici(data.id);
                }

                toast({
                    title: 'Successo',
                    description: 'Dati caricati con successo',
                });
            } else if (response.status === 404) {
                // Nessun dato trovato per questo anno, resetta i form
                resetForms();
            } else {
                toast({
                    title: 'Errore',
                    description: 'Impossibile caricare i dati dei costi energetici',
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: 'Errore',
                description: 'Si è verificato un errore durante il caricamento dei dati',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const rimuoviPeriodo = async (id: string, periodo: PeriodoCosti) => {
        if (!energyCostId) {
            // Se è un periodo non ancora salvato, rimuovilo solo localmente
            setCostiDinamici(prev => ({
                ...prev,
                periodi: prev.periodi.filter(p => p.id !== id)
            }));
            return;
        }

        try {
            const response = await fetch(
                `${PATH_DEV}/costi-periodi/${energyCostId}/${periodo.meseInizio}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                // Rimuovi il periodo dall'interfaccia solo se l'eliminazione è avvenuta con successo
                setCostiDinamici(prev => ({
                    ...prev,
                    periodi: prev.periodi.filter(p => p.id !== id)
                }));

                toast({
                    title: "Successo",
                    description: "Periodo eliminato con successo",
                });
            } else {
                const errorData = await response.json();
                toast({
                    title: "Errore",
                    description: errorData.error || "Impossibile eliminare il periodo",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Errore",
                description: "Errore di rete durante l'eliminazione",
                variant: "destructive",
            });
        }
    };

    const fetchPeriodiDinamici = async (energyCostId: number) => {
        try {
            const response = await fetch(`${PATH_DEV}/costi-energia/${energyCostId}/periodi-dinamici`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data: PeriodoCostiResponse[] = await response.json();
                const periodiConvertiti = data.map((periodo) => ({
                    id: periodo.id.toString(),
                    meseInizio: periodo.monthStart,
                    costiData: {
                        f0: 0,
                        f1: periodo.costF1,
                        f2: periodo.costF2,
                        f3: periodo.costF3,
                    }
                }));

                setCostiDinamici(prev => ({
                    ...prev,
                    periodi: periodiConvertiti
                }));
            }
        } catch (error) {
            console.error('Errore caricamento periodi dinamici:', error);
        }
    };

    const resetForms = () => {
        form.reset({} as any);
        formDinamici.reset();
        setEnergyCostId(null);
        setCostiDinamici({
            periodi: [{
                id: '1',
                meseInizio: 1,
                costiData: { f0: 0, f1: 0, f2: 0, f3: 0}
            }]
        });
    };

    const onSubmit = async (formData: Partial<CostiState>) => {
        // Verifica minima sui campi visibili
        const required = getCampiDaMostrare();
        for (const k of required) {
            const v = formData[k as keyof CostiState];
            if (typeof v !== 'number' || Number.isNaN(v)) {
                toast({
                    title: 'Campi mancanti',
                    description: 'Compila tutti i campi richiesti prima di salvare.',
                    variant: 'destructive',
                });
                return;
            }
        }

        if (loading) return;
        setLoading(true);

        try {
            const year = Number(annoSelezionato);

            // enum in MAIUSCOLO per il backend
            const tipoPrezzoBE = (tipoPrezzi || '').toUpperCase() as any; // FISSO | INDICIZZATO | MISTO | DINAMICO
            const tipoTariffaBE = tipoPrezzi === 'fisso'
                ? (tipoTariffa || '').toUpperCase() as any                  // MONORARIA | BIORARIA | TRIORARIA
                : undefined;

            let req: Record<string, any> = {
                year: annoSelezionato,
                tipoPrezzo: tipoPrezzi,                 // 'fisso' | 'indicizzato' | 'misto' | 'dinamico'
            };

            if (tipoPrezzi === 'fisso') {
                req.tipoTariffa = tipoTariffa;         // 'monoraria' | 'bioraria' | 'trioraria'
                if (tipoTariffa === 'monoraria') {
                    req.costF0 = formData.f0;
                } else if (tipoTariffa === 'bioraria') {
                    req.costF1 = formData.f1;
                    req.costF2 = formData.f2;
                } else if (tipoTariffa === 'trioraria') {
                    req.costF1 = formData.f1;
                    req.costF2 = formData.f2;
                    req.costF3 = formData.f3;
                }
            } else if (tipoPrezzi === 'indicizzato') {
                req.spreadF1 = formData.f1spread;
                req.spreadF2 = formData.f2spread;
                req.spreadF3 = formData.f3spread;
            } else if (tipoPrezzi === 'misto') {
                req.percentageVariable = formDinamici.getValues().percentualeVariabile;
                req.costF1 = formData.f1;
                req.costF2 = formData.f2;
                req.costF3 = formData.f3;
            }

// rimuovi chiavi vuote
            req = Object.fromEntries(Object.entries(req).filter(([, v]) => v !== undefined && v !== null));

            console.debug('Payload costi energia inviato:', req);

            const response = await fetch(`${PATH_DEV}/costi-energia`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req),
            });

            if (response.ok) {
                const result: CostiEnergiaResponse = await response.json();
                setEnergyCostId(result.id);
                toast({ title: 'Successo', description: 'I costi energetici sono stati salvati con successo' });
            } else {
                const text = await response.text();
                let message = text;
                try {
                    const j = JSON.parse(text);
                    message = j.error || j.message || text;
                } catch {}
                throw new Error(message || 'Errore durante il salvataggio dei costi');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Errore durante il salvataggio dei costi';
            toast({ title: 'Errore', description: errorMessage, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const aggiornaPercentualeVariabile = (id: string, percentuale: number) => {
        setCostiDinamici(prev => ({
            ...prev,
            periodi: prev.periodi.map(p =>
                p.id === id
                    ? { ...p, percentualeVariabile: percentuale }
                    : p
            )
        }));
    };

    const salvaCostiDinamici = async () => {
        setLoading(true);

        try {
            let currentEnergyCostId = energyCostId;

            // Se non esiste ancora una riga principale, creala
            if (!currentEnergyCostId) {
                const costiPrincipaliRequest = {
                    year: annoSelezionato,
                    tipoPrezzo: "dinamico",
                    //percentageVariable: formDinamici.getValues().percentualeVariabile || ""
                };

                console.debug("Creazione costi energia per dinamico:", costiPrincipaliRequest);

                const principaliResponse = await fetch(`${PATH_DEV}/costi-energia`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(costiPrincipaliRequest)
                });

                if (!principaliResponse.ok) {
                    const errorText = await principaliResponse.text();
                    throw new Error(`Errore creazione costi principali: ${errorText}`);
                }

                const result = await principaliResponse.json() as CostiEnergiaResponse;
                currentEnergyCostId = result.id;
                setEnergyCostId(result.id);

                console.debug("Costi principali creati con ID:", currentEnergyCostId);
            }

            // Ora salva tutti i periodi
            for (const periodo of costiDinamici.periodi) {
                const updateRequest = {
                    costF1: periodo.costiData.f1,
                    costF2: periodo.costiData.f2,
                    costF3: periodo.costiData.f3,
                    percentageVariable: periodo.percentualeVariabile || 0
                };

                const response = await fetch(
                    `${PATH_DEV}/costi-periodi/${currentEnergyCostId}/${periodo.meseInizio}`,
                    {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateRequest)
                    }
                );

                if (!response.ok) {
                    throw new Error(`Errore salvando periodo ${periodo.meseInizio}`);
                }
            }

            toast({
                title: "Successo",
                description: "Costi dinamici salvati con successo"
            });

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Errore durante il salvataggio dei costi dinamici";
            toast({
                title: "Errore",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Nuove funzioni per la gestione dinamica
    const aggiungiPeriodo = () => {
        const nuovoPeriodo: PeriodoCosti = {
            id: Date.now().toString(),
            meseInizio: costiDinamici.periodi.length + 1,
            costiData: {
                f0: undefined as any,
                f1: undefined as any,
                f2: undefined as any,
                f3: undefined as any
            },
            percentualeVariabile: undefined // Anche questo dovrebbe essere vuoto per il nuovo periodo
        };
        setCostiDinamici(prev => ({
            ...prev,
            periodi: [...prev.periodi, nuovoPeriodo]
        }));
    };


    const aggiornaPeriodo = (id: string, campo: keyof CostiState, valore: number) => {
        setCostiDinamici(prev => ({
            ...prev,
            periodi: prev.periodi.map(p =>
                p.id === id ? {
                    ...p,
                    costiData: { ...p.costiData, [campo]: valore }
                } : p
            )
        }));
    };

    const aggiornaMeseInizio = (id: string, mese: number) => {
        setCostiDinamici(prev => ({
            ...prev,
            periodi: prev.periodi.map(p =>
                p.id === id ? { ...p, meseInizio: mese } : p
            )
        }));
    };

    // Funzioni per determinare i campi da mostrare
    const getCampiDaMostrare = (): (keyof CostiState)[] => {
        if (tipoPrezzi === 'fisso') {
            switch (tipoTariffa) {
                case 'monoraria': return ['f0'];
                case 'bioraria': return ['f1', 'f2'];
                case 'trioraria': return ['f1', 'f2', 'f3'];
                default: return ['f0'];
            }
        } else if (tipoPrezzi === 'indicizzato') {
            return ['f1spread', 'f2spread', 'f3spread'];
        } else if (tipoPrezzi === 'misto' || tipoPrezzi === 'dinamico') {
            return ['f1', 'f2', 'f3'];
        }
        return [];
    };


    const renderCampiCosti = (costiData: CostiState, prefisso = "", isReadOnly = false, onUpdate?: (campo: keyof CostiState, valore: number) => void) => {
        const campi = getCampiDaMostrare();

        // Se onUpdate è fornito, usa valori locali (caso dinamico)
        if (onUpdate) {
            return campi.map(campo => (
                <div key={campo} className="space-y-2">
                    <Label htmlFor={`${prefisso}${campo}`}>{campo.toUpperCase()} (€/kWh)</Label>
                    <Input
                        id={`${prefisso}${campo}`}
                        type="number"
                        step="any"
                        min={0}
                        value={costiData[campo] ?? ""}
                        onChange={(e) => {
                            const raw = e.target.value.replace(",", ".");
                            if (raw === "") {
                                onUpdate(campo, undefined as any);
                            } else {
                                const numValue = parseFloat(raw);
                                if (!isNaN(numValue)) {
                                    onUpdate(campo, numValue);
                                }
                            }
                        }}
                        readOnly={isReadOnly}
                    />
                </div>
            ));
        }

        // Altrimenti, usa form.control (casi fisso/indicizzato/misto)
        return campi.map(campo => (
            <FormField
                key={campo}
                control={form.control}
                name={campo as any}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{campo.toUpperCase()} (€/kWh)</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                step="any"
                                min={0}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(",", ".");
                                    if (raw === "") {
                                        field.onChange(undefined);
                                    } else {
                                        const numValue = parseFloat(raw);
                                        if (!isNaN(numValue)) {
                                            field.onChange(numValue);
                                        }
                                    }
                                }}
                                readOnly={isReadOnly}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ));
    };


    // @ts-ignore
    let card = <><Card>
        <CardHeader>
            <CardTitle>Gestione Costi Energetici</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                {/* Menu principale: tipo prezzi, anno e tipo tariffa allineati */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Tipo di Prezzo</Label>
                        <Select
                            value={tipoPrezzi}
                            onValueChange={(value) => setTipoPrezzi(value as TipoPrezzi)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleziona tipo prezzo"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fisso">100% Fisso</SelectItem>
                                <SelectItem value="indicizzato">100% Indicizzato</SelectItem>
                                <SelectItem value="misto">Prezzo Misto</SelectItem>
                                <SelectItem value="dinamico">Prezzo Dinamico</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Anno</Label>
                        <Select
                            value={annoSelezionato.toString()}
                            onValueChange={(value) => setAnnoSelezionato(parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleziona anno"/>
                            </SelectTrigger>
                            <SelectContent>
                                {anniDisponibili.map(anno => (
                                    <SelectItem key={anno} value={anno.toString()}>{anno}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Menu secondario per tipo tariffa (solo per prezzo fisso) */}
                    {tipoPrezzi === 'fisso' && (
                        <div className="space-y-2">
                            <Label>Tipo Tariffa</Label>
                            <Select
                                value={tipoTariffa}
                                onValueChange={(value) => setTipoTariffa(value as TipoTariffa)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleziona tipo tariffa"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monoraria">Monoraria</SelectItem>
                                    <SelectItem value="bioraria">Bioraria</SelectItem>
                                    <SelectItem value="trioraria">Trioraria</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Campo percentuale per prezzo misto e dinamico */}
                {(tipoPrezzi === 'misto') && (
                    <div className="space-y-2">
                        <Label htmlFor="percentuale">Percentuale Variabile (%)</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="percentuale"
                                type="number"
                                min="0"
                                max="100"
                                {...formDinamici.register('percentualeVariabile')}
                                className="w-24"
                            />
                            <span>%</span>
                            <span className="text-sm text-gray-600">
                  variabile, resto fisso ({100 - (formDinamici.watch('percentualeVariabile') || 0)}%)
                </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Rendering dei campi in base al tipo di prezzo */}
            {tipoPrezzi !== 'dinamico' ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderCampiCosti(form.getValues())}
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Salvataggio in corso...
                                </>
                            ) : (
                                'Salva Costi'
                            )}
                        </Button>
                    </form>
                </Form>
            ) : (
                /* Gestione prezzi dinamici con periodi multipli */
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Periodi di Prezzo</h3>
                        <Button
                            onClick={aggiungiPeriodo}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Plus size={16}/>
                            Aggiungi Periodo
                        </Button>
                    </div>

                    {costiDinamici.periodi.map((periodo, index) => (
                        <Card key={periodo.id}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base">
                                        Periodo {index + 1} - Anno {annoSelezionato}
                                    </CardTitle>
                                    {costiDinamici.periodi.length > 1 && (
                                        <Button
                                            onClick={() => rimuoviPeriodo(periodo.id, periodo)}
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={16}/>
                                            Rimuovi
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Mese Inizio */}
                                    <div className="space-y-2">
                                        <Label>Mese di Inizio</Label>
                                        <Select
                                            value={periodo.meseInizio.toString()}
                                            onValueChange={(value) =>
                                                aggiornaMeseInizio(periodo.id, parseInt(value))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({length: 12}, (_, i) => i + 1).map(mese => (
                                                    <SelectItem key={mese} value={mese.toString()}>
                                                        Mese {mese}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Percentuale Variabile (%)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            step={0.01}
                                            value={periodo.percentualeVariabile} // ← Valore specifico del periodo
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value) || 0;
                                                aggiornaPercentualeVariabile(periodo.id, value); // ← Aggiorna solo questo periodo
                                            }}
                                            placeholder="Es: 60"
                                        />
                                    </div>
                                </div>

                                {/* Campi Costi */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderCampiCosti(
                                        periodo.costiData,
                                        `periodo-${periodo.id}-`,
                                        false,
                                        (campo, valore) => aggiornaPeriodo(periodo.id, campo, valore)
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        onClick={salvaCostiDinamici}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Salvataggio in corso...
                            </>
                        ) : (
                            'Salva Costi Dinamici'
                        )}
                    </Button>
                </div>
            )}

            {loading && (
                <div className="text-center text-sm text-gray-500">
                    Comunicazione con il server in corso...
                </div>
            )}
        </CardContent>
    </Card></>;
    return card;
};

// CARICAMENTO MULTIPLO FILE
const FileUploadSection: React.FC<{
    onFileUploadSuccess: () => void;
    filesUploaded: number;
}> = ({ onFileUploadSuccess, filesUploaded }) => {
    const PATH_DEV = 'http://localhost:8081';
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // HANDLER SELEZIONE MULTIPLA
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let filesArr = Array.from(e.target.files || []);
        filesArr = filesArr.filter(f => f.type === 'application/pdf');
        setSelectedFiles(prev => [...prev, ...filesArr]);
    };

    const handleRemove = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // UPLOAD TUTTI I FILE SELEZIONATI
    const handleUploadAll = async () => {
        setIsLoading(true);
        setCurrentIndex(0);
        let allOk = true;

        for (let i = 0; i < selectedFiles.length; i++) {
            setCurrentIndex(i);
            const formData = new FormData();
            formData.append('fileName', selectedFiles[i].name);
            formData.append('fileData', selectedFiles[i]);

            try {
                const response = await fetch(`${PATH_DEV}/files/upload`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });

                if (!response.ok) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore',
                        text: 'Impossibile caricare il file perché già presente a sistema',
                    });
                    allOk = false;
                    break;
                }
            } catch {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: `Errore di rete su ${selectedFiles[i].name}`,
                });
                allOk = false;
                break;
            }
        }

        setSelectedFiles([]);
        setIsLoading(false);
        setCurrentIndex(0);

        if (selectedFiles.length > 0 && allOk) {
            Swal.fire({
                icon: 'success',
                title: 'Upload completato',
                text: 'Tutti i file sono stati caricati.',
            });
            // AGGIORNAMENTO UNICO DOPO TUTTI GLI UPLOAD (sia files che pod!)
            onFileUploadSuccess();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Carica le tue bollette energetiche</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                        Trascina o seleziona uno o più file PDF
                    </p>

                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleChange}
                        className="hidden"
                    />

                    <Button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Seleziona file
                    </Button>

                    {/* LISTA FILE */}
                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                            {selectedFiles.map((file, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                    <span className="text-sm truncate flex-1">{file.name}</span>
                                    <Button
                                        onClick={() => handleRemove(i)}
                                        disabled={isLoading}
                                        variant="ghost"
                                        size="sm"
                                    />
                                </div>
                            ))}

                            <Button
                                onClick={handleUploadAll}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Caricamento {currentIndex + 1}/{selectedFiles.length}...
                                    </>
                                ) : (
                                    'Carica tutti'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// --- MAIN PAGE ---
const UploadBillsPage: React.FC = () => {
    const PATH_DEV = 'http://localhost:8081';
    const [data, setData] = useState<BillFile[]>([]);
    const [pod, setPod] = useState<Pod[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPod, setSelectedPod] = useState('all');
    const [sortColumn, setSortColumn] = useState('fileName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bills');

    // Configurazione corretta per SecondaryNavbar
    const navItems = [
    { id: 'bills', label: 'Bollette' },
    { id: 'pods', label: 'Dati POD' },
    { id: 'costs', label: 'Gestione Costi' },
    { id: 'export', label: 'Esporta Excel' }, // nuovo
    ];

    useEffect(() => {
        getFiles();
        getPod();
    }, []);

    const getFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${PATH_DEV}/files/dati`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                setData([]);
            }
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const getPod = async () => {
        try {
            const response = await fetch(`${PATH_DEV}/pod`, {
                credentials: 'include',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                setPod(data.map((pod: Pod) => ({
                    ...pod,
                    potenzaImpegnata: pod.potenzaImpegnata,
                    tensione: pod.tipoTensione,
                    fornitore: pod.fornitore,
                    potenzaDisponibile: pod.potenzaDisponibile,
                })));
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Errore durante il recupero dei POD',
                });
            }
        } catch {
            // Silently ignore errors
        }
    };

    const downloadFile = async (id: string, name: string) => {
        try {
            const response = await axios.get(`${PATH_DEV}/files/${id}/download`, {
                responseType: 'blob',
            });

            const contentDisposition = response.headers['content-disposition'];
            const fileName = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : name;

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: 'Download completato',
                text: `Il file ${fileName} è stato scaricato con successo.`,
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Impossibile scaricare il file',
            });
        }
    };

    // Ordinamento
    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortIcon = (column: string) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ?
            <ChevronUp className="w-4 h-4" /> :
            <ChevronDown className="w-4 h-4" />;
    };

    // AGGIORNA SIA I FILE CHE I POD DOPO OGNI UPLOAD
    const handleFileUploadSuccess = () => {
        getFiles();
        getPod();
    };

    // Filtraggio e ordinamento
    const filteredAndSortedData = data
        .filter(file => {
            const podMatches = selectedPod === 'all' || file.idPod === selectedPod;
            const searchMatches =
                file.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                file.idPod?.toLowerCase().includes(searchTerm.toLowerCase());
            return podMatches && searchMatches;
        })
        .sort((a, b) => {
            // Ordinamento intelligente: la colonna uploadDate usa il timestamp
            if (sortColumn === 'uploadDate') {
                const ta = getTimeNumber(a.uploadDate);
                const tb = getTimeNumber(b.uploadDate);
                return sortDirection === 'asc' ? ta - tb : tb - ta;
            }

            // Per le altre colonne usiamo confronto case-insensitive su stringhe
            const aValue = String((a as BillFile)[sortColumn as keyof BillFile] ?? '').toLowerCase();
            const bValue = String((b as BillFile)[sortColumn as keyof BillFile] ?? '').toLowerCase();

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            return aValue < bValue ? 1 : -1;
        });

    const renderContent = () => {
        switch (activeTab) {
            case 'bills':
                return (
                    <div className="space-y-6">
                        {/* UPLOAD SECTION */}
                        <FileUploadSection
                            onFileUploadSuccess={handleFileUploadSuccess}
                            filesUploaded={data.length}
                        />

                        {/* SEARCH AND FILTER */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex space-x-4 mb-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Cerca per nome file o POD..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <Select value={selectedPod} onValueChange={setSelectedPod}>
                                        <SelectTrigger className="w-64">
                                            <SelectValue placeholder="Filtra per POD" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tutti i POD</SelectItem>
                                            {[...new Set(data.map(b => b.idPod))].map(podId => (
                                                <SelectItem key={podId} value={podId}>{podId}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* TABELLA BOLLETTE */}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('fileName')}
                                            >
                                                <div className="flex items-center">
                                                    Nome File
                                                    {sortIcon('fileName')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('uploadDate')}
                                            >
                                                <div className="flex items-center">
                                                    Data
                                                    {sortIcon('uploadDate')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('idPod')}
                                            >
                                                <div className="flex items-center">
                                                    POD
                                                    {sortIcon('idPod')}
                                                </div>
                                            </TableHead>
                                            <TableHead>Azioni</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                                    Caricamento bollette in corso...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredAndSortedData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                    Nessuna bolletta trovata
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAndSortedData.map(bill => (
                                                <TableRow key={bill.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{bill.fileName}</div>
                                                            {bill.size && (
                                                                <div className="text-sm text-gray-500">{bill.size}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {bill.uploadDate ? (
                                                            <div>
                                                                <div className="font-medium">{formatUploadDate(bill.uploadDate)}</div>
                                                                <div className="text-sm text-gray-500">{formatRelative(bill.uploadDate)}</div>
                                                            </div>
                                                        ) : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>{bill.idPod}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => downloadFile(bill.id, bill.fileName)}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Download
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'pods':
                return (
                    <div className="space-y-6">
                        {/* SEARCH */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Cerca POD..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* TABELLA PODS */}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID POD</TableHead>
                                            <TableHead>Fornitore</TableHead>
                                            <TableHead>Potenza Disponibile</TableHead>
                                            <TableHead>Potenza (kW)</TableHead>
                                            <TableHead>Tensione</TableHead>
                                            <TableHead>Tensione di Alimentazione</TableHead>
                                            <TableHead>Indirizzo</TableHead>
                                            <TableHead>Nazione</TableHead>
                                            <TableHead>Cap</TableHead>
                                            <TableHead>Azioni</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center py-8">
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                                    Caricamento dati POD in corso...
                                                </TableCell>
                                            </TableRow>
                                        ) : pod.filter(p =>
                                            p.id.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                                    Nessun POD trovato
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pod
                                                .filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map(podItem => (
                                                    <TableRow key={podItem.id}>
                                                        <TableCell className="font-medium">{podItem.id}</TableCell>
                                                        <TableCell>{podItem.fornitore || 'N/A'}</TableCell>
                                                        <TableCell>{podItem.potenzaDisponibile || 'N/A'}</TableCell>
                                                        <TableCell>{podItem.potenzaImpegnata || 'N/A'}</TableCell>
                                                        <TableCell>{podItem.tensione || 'BT'}</TableCell>
                                                        <TableCell>{podItem.tensioneAlimentazione || 'BT'}</TableCell>
                                                        <TableCell>{podItem.sede || 'N/A'}</TableCell>
                                                        <TableCell>{podItem.nazione || 'N/A'}</TableCell>
                                                        <TableCell>{podItem.cap || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    Swal.fire({
                                                                        title: 'Dettagli POD',
                                                                        html: `
                                      <div class="text-left space-y-2">
                                        <p><strong>ID POD:</strong> ${podItem.id}</p>
                                        <p><strong>Fornitore:</strong> ${podItem.fornitore || 'N/A'}</p>
                                        <p><strong>Potenza Disponibile:</strong> ${podItem.potenzaDisponibile || 'N/A'}</p>
                                        <p><strong>Potenza Impegnata:</strong> ${podItem.potenzaImpegnata || 'N/A'}</p>
                                        <p><strong>Tensione:</strong> ${podItem.tensione || 'BT'}</p>
                                        <p><strong>Tensione di Alimentazione:</strong> ${podItem.tensioneAlimentazione || 'BT'}</p>
                                        <p><strong>Sede:</strong> ${podItem.sede || 'N/A'}</p>
                                        <p><strong>Nazione:</strong> ${podItem.nazione || 'N/A'}</p>
                                        <p><strong>CAP:</strong> ${podItem.cap || 'N/A'}</p>
                                      </div>
                                    `,
                                                                        confirmButtonText: 'Chiudi',
                                                                        customClass: {
                                                                            container: 'swal-wide'
                                                                        }
                                                                    });
                                                                }}
                                                            >
                                                                Dettagli
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'costs':
                return (
                    <div className="space-y-6">
                        <CostiForm />
                    </div>
                );

            case 'export':
                return (
                    <div className="space-y-6">
                    <ExportBollette data={data} pod={pod} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header identico a FuturesPage */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">Gestione Bollette</h1>
                    <p className="text-gray-600">Carica e gestisci le tue bollette energetiche</p>
                </div>

                {/* SecondaryNavbar con props corrette */}
                <SecondaryNavbar
                    items={navItems}
                    activeItemId={activeTab}
                    onItemClick={setActiveTab}
                />

                {/* Content */}
                <div className="mt-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default UploadBillsPage;
