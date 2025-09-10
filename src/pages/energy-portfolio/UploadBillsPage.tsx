import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecondaryNavbar } from '@/components/energy-portfolio/SecondaryNavbar';
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
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

/* ============================ HELPERS DATE ============================ */
const parseISODate = (s?: string): Date | null => {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
};

// "01/09/2025 11:48"
const formatUploadDate = (s?: string): string => {
    const d = parseISODate(s);
    if (!d) return 'N/A';
    const fmt = new Intl.DateTimeFormat('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
    // rimuovo l'eventuale virgola che alcuni browser aggiungono tra data e ora
    return fmt.format(d).replace(',', '');
};

// "2 giorni fa", "fra 3 ore", "adesso"
const formatRelative = (s?: string): string => {
    const d = parseISODate(s);
    if (!d) return '';
    const diffMs = d.getTime() - Date.now();
    const abs = Math.abs(diffMs);
    const rtf = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' });
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (abs < 45_000) return 'adesso';
    if (abs < hour) return rtf.format(Math.round(diffMs / minute), 'minute');
    if (abs < day) return rtf.format(Math.round(diffMs / hour), 'hour');
    return rtf.format(Math.round(diffMs / day), 'day');
};

const getTimeNumber = (s?: string): number => {
    const d = parseISODate(s);
    return d ? d.getTime() : -Infinity;
};

/* ===================================================================== */

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
    f1_perdite: number;
    f2_perdite: number;
    f3_perdite: number;
    f1_spread?: number;
    f2_spread?: number;
    f3_spread?: number;
}

interface PeriodoCosti {
    id: string;
    meseInizio: number;
    costiData: CostiState;
}

interface CostiDinamici {
    percentualeVariabile?: number;
    periodi: PeriodoCosti[];
}

// Definizione tipi per evitare ESLint no-explicit-any
type TipoPrezzi = 'fisso' | 'indicizzato' | 'misto' | 'dinamico';
type TipoTariffa = 'monoraria' | 'bioraria' | 'trioraria';

const costiSchema = z.object({
    f0: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f1: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f2: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f3: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f1_perdite: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f2_perdite: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f3_perdite: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f1_spread: z.coerce.number().min(0, "Il valore deve essere positivo").optional(),
    f2_spread: z.coerce.number().min(0, "Il valore deve essere positivo").optional(),
    f3_spread: z.coerce.number().min(0, "Il valore deve essere positivo").optional(),
});

const costiDinamiciSchema = z.object({
    percentualeVariabile: z.coerce.number().min(0).max(100).optional(),
});

// FORM COSTI MODIFICATO
const CostiForm = () => {
    const PATH_DEV = "http://localhost:8081";
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Lista anni disponibili (dal 2023 al 2034)
    const anniDisponibili = [2023, 2024, ...Array.from({length: 10}, (_, i) => 2025 + i)];

    // Nuovi stati per la gestione avanzata
    const [tipoPrezzi, setTipoPrezzi] = useState<TipoPrezzi>('fisso');
    const [tipoTariffa, setTipoTariffa] = useState<TipoTariffa>('monoraria');
    const [annoSelezionato, setAnnoSelezionato] = useState<number>(2025);
    const [costiDinamici, setCostiDinamici] = useState<CostiDinamici>({
        periodi: [{ id: '1', meseInizio: 1, costiData: { f0: 0, f1: 0, f2: 0, f3: 0, f1_perdite: 0, f2_perdite: 0, f3_perdite: 0 } }]
    });

    const form = useForm({
        resolver: zodResolver(costiSchema),
        defaultValues: {
            f0: 0, f1: 0, f2: 0, f3: 0, f1_perdite: 0, f2_perdite: 0, f3_perdite: 0,
            f1_spread: 0, f2_spread: 0, f3_spread: 0,
        },
    });

    const formDinamici = useForm({
        resolver: zodResolver(costiDinamiciSchema),
        defaultValues: { percentualeVariabile: 60 },
    });

    useEffect(() => { fetchCostiCliente(); }, []);

    const fetchCostiCliente = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${PATH_DEV}/cliente/costi-energia`, {
                method: 'GET', credentials: 'include', headers: {'Content-Type': 'application/json'},
            });
            if (response.ok) {
                const data = await response.json();
                const costiState = {f0: 0,f1: 0,f2: 0,f3: 0,f1_perdite: 0,f2_perdite: 0,f3_perdite: 0};
                data.forEach((item: {nomeCosto: string; costoEuro: number}) => {
                    const key = item.nomeCosto as keyof CostiState;
                    if (key in costiState) (costiState as CostiState)[key] = item.costoEuro;
                });
                Object.entries(costiState).forEach(([key, value]) => {
                    form.setValue(key as keyof CostiState, value as number);
                });
            } else {
                toast({title: "Errore", description: "Impossibile caricare i dati dei costi energetici", variant: "destructive"});
            }
        } catch {
            toast({title: "Errore", description: "Si è verificato un errore durante il caricamento dei dati", variant: "destructive"});
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (formData: CostiState) => {
        setLoading(true);
        try {
            const costiArray = Object.entries(formData).map(([key, value]) => ({
                nomeCosto: key, costoEuro: value,
            }));
            const response = await fetch(`${PATH_DEV}/cliente/costi-energia/add`, {
                method: 'POST', credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(costiArray),
            });
            if (response.ok) {
                toast({title: "Successo", description: "I costi energetici sono stati salvati con successo"});
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Errore durante il salvataggio dei costi');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Errore durante il salvataggio dei costi';
            toast({title: "Errore", description: errorMessage, variant: "destructive"});
        } finally {
            setLoading(false);
        }
    };

    // Nuove funzioni per la gestione dinamica
    const aggiungiPeriodo = () => {
        const nuovoPeriodo: PeriodoCosti = {
            id: Date.now().toString(),
            meseInizio: costiDinamici.periodi.length + 1,
            costiData: { f0: 0, f1: 0, f2: 0, f3: 0, f1_perdite: 0, f2_perdite: 0, f3_perdite: 0 }
        };
        setCostiDinamici(prev => ({
            ...prev,
            periodi: [...prev.periodi, nuovoPeriodo]
        }));
    };

    const rimuoviPeriodo = (id: string) => {
        setCostiDinamici(prev => ({
            ...prev,
            periodi: prev.periodi.filter(p => p.id !== id)
        }));
    };

    const aggiornaPeriodo = (id: string, campo: keyof CostiState, valore: number) => {
        setCostiDinamici(prev => ({
            ...prev,
            periodi: prev.periodi.map(p =>
                p.id === id
                    ? { ...p, costiData: { ...p.costiData, [campo]: valore } }
                    : p
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
    const getCampiDaMostrare = () => {
        if (tipoPrezzi === 'fisso') {
            switch (tipoTariffa) {
                case 'monoraria': return ['f0'];
                case 'bioraria': return ['f1', 'f2'];
                case 'trioraria': return ['f1', 'f2', 'f3'];
                default: return ['f0'];
            }
        } else if (tipoPrezzi === 'indicizzato') {
            return ['f1_spread', 'f2_spread', 'f3_spread'];
        } else if (tipoPrezzi === 'misto' || tipoPrezzi === 'dinamico') {
            return ['f0', 'f1', 'f2', 'f3'];
        }
        return [];
    };

    const renderCampiCosti = (costiData: CostiState, prefisso = '', isReadOnly = false, onUpdate?: (campo: keyof CostiState, valore: number) => void) => {
        const campi = getCampiDaMostrare();

        return campi.map(campo => {
            let nomeCompleto = campo;
            const valore = (costiData as CostiState)[campo as keyof CostiState] || 0;

            if (tipoPrezzi === 'indicizzato' && campo.includes('spread')) {
                nomeCompleto = campo.replace('_spread', ' Spread');
            }

            return (
                <div key={`${prefisso}${campo}`} className="space-y-2">
                    <Label htmlFor={`${prefisso}${campo}`}>
                        {nomeCompleto.replace('_', ' ').toUpperCase()} (€/kWh)
                    </Label>
                    <Input
                        id={`${prefisso}${campo}`}
                        type="number"
                        step="0.001"
                        min="0"
                        value={valore}
                        readOnly={isReadOnly}
                        onChange={(e) => {
                            const nuovoValore = parseFloat(e.target.value) || 0;
                            if (onUpdate) {
                                onUpdate(campo as keyof CostiState, nuovoValore);
                            } else {
                                form.setValue(campo as keyof CostiState, nuovoValore);
                            }
                        }}
                        className={isReadOnly ? "bg-gray-100" : ""}
                    />
                </div>
            );
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestione Costi Energetici</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {/* Menu principale tipo prezzi, anno e tipo tariffa allineati */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo di Prezzo</Label>
                            <Select value={tipoPrezzi} onValueChange={(value) => setTipoPrezzi(value as TipoPrezzi)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleziona tipo prezzo" />
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
                            <Select value={annoSelezionato.toString()} onValueChange={(value) => setAnnoSelezionato(parseInt(value))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleziona anno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {anniDisponibili.map(anno => (
                                        <SelectItem key={anno} value={anno.toString()}>
                                            {anno}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Menu secondario per tipo tariffa (solo per prezzo fisso) */}
                        {tipoPrezzi === 'fisso' && (
                            <div className="space-y-2">
                                <Label>Tipo Tariffa</Label>
                                <Select value={tipoTariffa} onValueChange={(value) => setTipoTariffa(value as TipoTariffa)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona tipo tariffa" />
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
                    {(tipoPrezzi === 'misto' || tipoPrezzi === 'dinamico') && (
                        <div className="space-y-2">
                            <Label htmlFor="percentuale">
                                Percentuale Variabile
                            </Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="percentuale"
                                    type="number"
                                    min="0"
                                    max="100"
                                    {...formDinamici.register("percentualeVariabile")}
                                    className="w-24"
                                />
                                <span>%</span>
                                <span className="text-sm text-gray-600">
                                variabile (resto fisso: {100 - (formDinamici.watch("percentualeVariabile") || 0)}%)
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
                                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvataggio in corso...</>) : ("Salva Costi")}
                            </Button>
                        </form>
                    </Form>
                ) : (
                    /* Gestione prezzi dinamici con periodi multipli */
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Periodi di Prezzo</h3>
                            <Button onClick={aggiungiPeriodo} variant="outline" size="sm" className="flex items-center gap-2">
                                <Plus size={16} />
                                Aggiungi Periodo
                            </Button>
                        </div>

                        {costiDinamici.periodi.map((periodo, index) => (
                            <Card key={periodo.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base">Periodo {index + 1} - Anno {annoSelezionato}</CardTitle>
                                        {costiDinamici.periodi.length > 1 && (
                                            <Button
                                                onClick={() => rimuoviPeriodo(periodo.id)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-800 flex items-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                Rimuovi
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Mese di Inizio</Label>
                                            <Select
                                                value={periodo.meseInizio.toString()}
                                                onValueChange={(value) => aggiornaMeseInizio(periodo.id, parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
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
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderCampiCosti(
                                            periodo.costiData,
                                            `periodo_${periodo.id}_`,
                                            false,
                                            (campo, valore) => aggiornaPeriodo(periodo.id, campo, valore)
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            onClick={() => {
                                // Qui implementare il salvataggio per i costi dinamici
                                toast({title: "Successo", description: "Costi dinamici salvati con successo"});
                            }}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvataggio in corso...</>) : ("Salva Costi Dinamici")}
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="text-center text-sm text-gray-500">
                        Comunicazione con il server in corso...
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// CARICAMENTO MULTIPLO FILE
const FileUploadSection = ({ onFileUploadSuccess, filesUploaded }: { onFileUploadSuccess: () => void; filesUploaded: number; }) => {
    const PATH_DEV = "http://localhost:8081";
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // HANDLER SELEZIONE MULTIPLA
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let filesArr = Array.from(e.target.files || []);
        filesArr = filesArr.filter(f => f.type === "application/pdf");
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
                    credentials: 'include'
                });

                if (!response.ok) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore',
                        text: 'Impossibile caricare il file perché è già presente a sistema'
                    });
                    allOk = false;
                    break;
                }
            } catch {
                Swal.fire({ icon: 'error', title: 'Errore', text: 'Errore di rete su ' + selectedFiles[i].name });
                allOk = false;
                break;
            }
        }

        setSelectedFiles([]);
        setIsLoading(false);
        setCurrentIndex(0);

        if (selectedFiles.length > 0 && allOk)
            Swal.fire({ icon: 'success', title: 'Upload completato', text: 'Tutti i file sono stati caricati.' });

        // AGGIORNAMENTO UNICO DOPO TUTTI GLI UPLOAD: sia files che pod!
        onFileUploadSuccess();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Carica le tue bollette energetiche</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Trascina o seleziona uno o più file PDF</p>

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
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}

                            <Button
                                onClick={handleUploadAll}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading
                                    ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Caricamento {currentIndex + 1}/{selectedFiles.length}...</>)
                                    : "Carica tutti"}
                            </Button>
                        </div>
                    )}

                    <p className="text-sm text-gray-600">
                        {filesUploaded >= 12
                            ? "Hai raggiunto il limite di 12 bollette."
                            : selectedFiles.length === 0 && "Non hai ancora selezionato nessun file."}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

// --- MAIN PAGE ---
const UploadBillsPage = () => {
    const PATH_DEV = "http://localhost:8081";
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
    ];

    useEffect(() => { getFiles(); getPod(); }, []);

    const getFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${PATH_DEV}/files/dati`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
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
                headers: {'Content-Type': 'application/json'}
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
                    text: 'Errore durante il recupero dei POD'
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
                text: `Il file "${fileName}" è stato scaricato con successo.`,
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch {
            Swal.fire({ icon: 'error', title: 'Errore', text: 'Impossibile scaricare il file' });
        }
    };

    // Ordinamento
    const handleSort = (column: string) => {
        if (sortColumn === column) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        else { setSortColumn(column); setSortDirection('asc'); }
    };

    const sortIcon = (column: string) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
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
            // Ordinamento intelligente: la colonna "uploadDate" usa il timestamp
            if (sortColumn === 'uploadDate') {
                const ta = getTimeNumber(a.uploadDate);
                const tb = getTimeNumber(b.uploadDate);
                return sortDirection === 'asc' ? ta - tb : tb - ta;
            }

            // Per le altre colonne usiamo confronto case-insensitive su stringhe
            const aValue = String((a as BillFile)[sortColumn as keyof BillFile] ?? '').toLowerCase();
            const bValue = String((b as BillFile)[sortColumn as keyof BillFile] ?? '').toLowerCase();
            if (sortDirection === 'asc') return aValue > bValue ? 1 : -1;
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
                                                <SelectItem key={podId} value={podId}>
                                                    {podId}
                                                </SelectItem>
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
                                                    Nome File {sortIcon('fileName')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('uploadDate')}
                                            >
                                                <div className="flex items-center">
                                                    Data {sortIcon('uploadDate')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('idPod')}
                                            >
                                                <div className="flex items-center">
                                                    POD {sortIcon('idPod')}
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
                                            filteredAndSortedData.map((bill) => (
                                                <TableRow key={bill.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{bill.fileName}</div>
                                                            {bill.size && <div className="text-sm text-gray-500">{bill.size}</div>}
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
                                        ) : pod.filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                                    Nessun POD trovato
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pod
                                                .filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map((podItem) => (
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
                                                                        customClass: {container: 'swal-wide'}
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

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header identico a FuturesPage */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestione Bollette</h1>
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
