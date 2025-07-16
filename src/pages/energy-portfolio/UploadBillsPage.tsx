import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Switch } from "@/components/ui/switch";
import { Download, Search, ChevronDown, ChevronUp, Upload, Loader2, Database, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

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
}
const costiSchema = z.object({
    f0: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f1: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f2: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f3: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f1_perdite: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f2_perdite: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f3_perdite: z.coerce.number().min(0, "Il valore deve essere positivo"),
});

// FORM COSTI (INVARIATO)
const CostiForm = () => {
    const PATH_DEV = "http://localhost:8081";
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const form = useForm<CostiState>({
        resolver: zodResolver(costiSchema),
        defaultValues: {
            f0: 0,
            f1: 0,
            f2: 0,
            f3: 0,
            f1_perdite: 0,
            f2_perdite: 0,
            f3_perdite: 0,
        },
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
                data.forEach((item) => {
                    const key = item.nomeCosto;
                    if (key in costiState) costiState[key] = item.costoEuro;
                });
                Object.entries(costiState).forEach(([key, value]) => {
                    form.setValue(key as keyof CostiState, value);
                });
            } else {
                toast({title: "Errore", description: "Impossibile caricare i dati dei costi energetici", variant: "destructive"});
            }
        } catch (error) {
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
        } catch (error) {
            toast({title: "Errore", description: error instanceof Error ? error.message : 'Errore durante il salvataggio dei costi', variant: "destructive"});
        } finally {
            setLoading(false);
        }
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* campi costi */}
                    {["f0", "f1", "f2", "f3", "f1_perdite", "f2_perdite", "f3_perdite"].map(name => (
                        <FormField
                            key={name}
                            control={form.control}
                            name={name as keyof CostiState}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{name.replace('_', ' ').toUpperCase()} (€/kWh)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.0001" placeholder="0.0000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                <Button type="submit" className="mt-6" disabled={loading}>
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvataggio in corso...</>) : ("Salva Costi")}
                </Button>
                {loading && (
                    <div className="text-sm text-muted-foreground mt-2">
                        Comunicazione con il server in corso...
                    </div>
                )}
            </form>
        </Form>
    );
};

// CARICAMENTO MULTIPLO FILE
const FileUploadSection = ({ onFileUploadSuccess, filesUploaded }) => {
    const PATH_DEV = "http://localhost:8081";
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // HANDLER SELEZIONE MULTIPLA
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let filesArr = Array.from(e.target.files || []);
        filesArr = filesArr.filter(f => f.type === "application/pdf");
        if (selectedFiles.length + filesArr.length > 12 - filesUploaded) {
            Swal.fire({
                icon: 'error',
                title: 'Troppi file selezionati',
                text: 'Puoi caricare al massimo 12 file totali.'
            });
            return;
        }
        setSelectedFiles(prev => [...prev, ...filesArr].slice(0, 12 - filesUploaded));
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
                const responseText = await response.text();
                if (!response.ok) {
                    Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Impossibile caricare il file perché è già presente a sistema'
                    });
                    allOk = false;
                    break;
                }
            } catch (error) {
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
        <div className="w-full">
            <div className={`border-2 border-dashed rounded-lg p-6 text-center`}>
                <div className="mb-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground"/>
                </div>
                <h3 className="text-lg font-medium mb-2">Carica le tue bollette energetiche</h3>
                <p className="text-sm text-muted-foreground mb-4">Trascina o seleziona fino a 12 file PDF</p>
                <input
                    type="file"
                    id="file-upload"
                    accept=".pdf"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                    disabled={isLoading || filesUploaded >= 12}
                />
                <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isLoading || filesUploaded >= 12}
                >
                    Seleziona file
                </Button>
                {/* LISTA FILE */}
                {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {selectedFiles.map((file, i) => (
                            <div key={i} className="flex justify-between items-center bg-muted rounded px-3 py-1 text-sm">
                                <span>{file.name}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleRemove(i)} disabled={isLoading}>
                                    ✕
                                </Button>
                            </div>
                        ))}
                        <Button
                            className="mt-2 w-full"
                            onClick={handleUploadAll}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Caricamento {currentIndex + 1}/{selectedFiles.length}...</>)
                                : "Carica tutti"}
                        </Button>
                    </div>
                )}
                {/* BLOCCHI INFORMATIVI */}
                <div className="text-xs text-muted-foreground mt-2">
                    {filesUploaded >= 12
                        ? "Hai raggiunto il limite di 12 bollette."
                        : selectedFiles.length === 0 && "Non hai ancora selezionato nessun file."}
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const UploadBillsPage = () => {
    const PATH_DEV = "http://localhost:8081";
    const [data, setData] = useState<BillFile[]>([]);
    const [pod, setPod] = useState<Pod[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPod, setSelectedPod] = useState<string>('all');
    const [sortColumn, setSortColumn] = useState<string>('fileName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'bills' | 'pods' | 'costs'>('bills');

    useEffect(() => { getFiles(); getPod(); }, []);

    const getFiles = async () => {
    setLoading(true);
    try {
        // NIENTE PIÙ SESSION COOKIE!
        const response = await fetch(`${PATH_DEV}/files/dati`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const result = await response.json();
            setData(result);
            // Debug: stampa sempre quanti file ricevi!
            console.log("FILES DAL BACKEND:", result);
        } else {
            setData([]);
        }
    } catch (error) {
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
                setPod(data.map(pod => ({
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
        } catch (error) { }
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
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
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
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>;
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
            const aValue = a[sortColumn as keyof BillFile] || '';
            const bValue = b[sortColumn as keyof BillFile] || '';
            if (sortDirection === 'asc') return aValue > bValue ? 1 : -1;
            else return aValue < bValue ? 1 : -1;
        });

    return (
        <div className="flex h-full">
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Inserimento Bollette</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Carica e gestisci le tue bollette energetiche
                </p>
                {/* UPLOAD MULTIPLO */}
                {viewMode === 'bills' && (
                    <div className="mb-8">
                        <FileUploadSection onFileUploadSuccess={handleFileUploadSuccess} filesUploaded={filteredAndSortedData.length}/>
                    </div>
                )}
                {/* PROGRESS BAR */}
                {viewMode === 'bills' && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-primary">
                            Bollette caricate: {filteredAndSortedData.length} / 12
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {Math.round((filteredAndSortedData.length / 12) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                        <div
                            className="bg-primary h-3 rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min((filteredAndSortedData.length / 12) * 100, 100)}%`
                            }}
                        />
                    </div>
                </div>
                )}

                {/* VIEW SWITCH */}
                <div className="flex items-center mb-6 space-x-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="view-mode-pods"
                            checked={viewMode === 'pods'}
                            onCheckedChange={(checked) => {
                                if (checked) setViewMode('pods');
                                else if (viewMode === 'pods') setViewMode('bills');
                            }}
                        />
                        <Label htmlFor="view-mode-pods">
                            {viewMode === 'pods' ? 'Visualizza Bollette' : 'Visualizza POD'}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="view-mode-costs"
                            checked={viewMode === 'costs'}
                            onCheckedChange={(checked) => {
                                if (checked) setViewMode('costs');
                                else if (viewMode === 'costs') setViewMode('bills');
                            }}
                        />
                        <Label htmlFor="view-mode-costs">
                            {viewMode === 'costs' ? 'Visualizza Bollette' : 'Gestione Costi'}
                        </Label>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        {viewMode === 'bills' ? (
                            <Upload className="mr-2 h-4 w-4"/>
                        ) : viewMode === 'pods' ? (
                            <Database className="mr-2 h-4 w-4"/>
                        ) : (
                            <FileText className="mr-2 h-4 w-4"/>
                        )}
                        <span>
                            Modalità: <strong>
                            {viewMode === 'bills' 
                                ? 'Bollette' 
                                : viewMode === 'pods' 
                                    ? 'Dati POD' 
                                    : 'Gestione Costi'}
                            </strong>
                        </span>
                    </div>
                </div>

                {/* FILTER */}
                {viewMode !== 'costs' && (
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder={viewMode === 'bills' ? "Cerca bollette..." : "Cerca POD..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        {viewMode === 'bills' && (
                            <Select
                                value={selectedPod}
                                onValueChange={setSelectedPod}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtra per POD"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tutti i POD</SelectItem>
                                    {[...new Set(data.map(b => b.idPod))].map(podId => (
                                        <SelectItem key={podId} value={podId}>{podId}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                )}

                {/* COSTI */}
                {viewMode === 'costs' && (
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Gestione Costi Energetici</h2>
                        <CostiForm />
                    </div>
                )}

                {/* TABELLA BOLLETTE */}
                {viewMode === 'bills' && (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="w-[250px] cursor-pointer"
                                        onClick={() => handleSort('fileName')}
                                    >
                                        <div className="flex items-center">
                                            Nome File {sortIcon('fileName')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort('uploadDate')}
                                    >
                                        <div className="flex items-center">
                                            Data {sortIcon('uploadDate')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort('idPod')}
                                    >
                                        <div className="flex items-center">
                                            POD {sortIcon('idPod')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Azioni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Caricamento bollette in corso...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAndSortedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Nessuna bolletta trovata
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAndSortedData.map((bill) => (
                                        <TableRow key={bill.id}>
                                            <TableCell>
                                                <div className="font-medium">{bill.fileName}</div>
                                                {bill.size &&
                                                    <div className="text-xs text-muted-foreground">{bill.size}</div>}
                                            </TableCell>
                                            <TableCell>{bill.uploadDate || 'N/A'}</TableCell>
                                            <TableCell>{bill.idPod}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => downloadFile(bill.id, bill.fileName)}
                                                >
                                                    <Download className="h-4 w-4"/>
                                                    <span className="sr-only">Download</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* TABELLA PODS */}
                {viewMode === 'pods' && (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">ID POD</TableHead>
                                    <TableHead>Fornitore</TableHead>
                                    <TableHead>Potenza Disponibile</TableHead>
                                    <TableHead>Potenza (kW)</TableHead>
                                    <TableHead>Tensione</TableHead>
                                    <TableHead>Tensione di Alimentazione</TableHead>
                                    <TableHead>Indirizzo</TableHead>
                                    <TableHead>Nazione</TableHead>
                                    <TableHead>Cap</TableHead>
                                    <TableHead className="text-right">Azioni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            Caricamento dati POD in corso...
                                        </TableCell>
                                    </TableRow>
                                ) : pod.filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            Nessun POD trovato
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pod.filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase())).map((podItem) => (
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
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Dettagli POD',
                                                            html: `
                                                                <div class="text-left">
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadBillsPage;
