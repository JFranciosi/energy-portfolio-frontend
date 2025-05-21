import React, {useState, useEffect} from 'react';
import {FileUploader} from '@/components/energy-portfolio/FileUploader';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
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
import {Switch} from "@/components/ui/switch";
import {Download, Search, ChevronDown, ChevronUp, Upload, Loader2, Database, FileText} from 'lucide-react';
import {Label} from '@/components/ui/label';
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

// Definire l'interfaccia per i file delle bollette provenienti dall'API
interface BillFile {
    id: string;
    fileName: string;
    idPod: string;
    uploadDate?: string;
    size?: string;
}

// Definire l'interfaccia per i POD
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

// Interfaccia per i dati dei costi
interface CostiState {
    f0: number;
    f1: number;
    f2: number;
    f3: number;
    f1_perdite: number;
    f2_perdite: number;
    f3_perdite: number;
}

// Schema di validazione per i campi dei costi
const costiSchema = z.object({
    f0: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f1: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f2: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f3: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f1_perdite: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f2_perdite: z.coerce.number().min(0, "Il valore deve essere positivo"),
    f3_perdite: z.coerce.number().min(0, "Il valore deve essere positivo"),
});

// Componente per il form dei costi
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

    // Carica i dati dei costi all'avvio del componente
    useEffect(() => {
        fetchCostiCliente();
    }, []);

    const fetchCostiCliente = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${PATH_DEV}/cliente/costi-energia`, {
                method: 'GET',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Costi fetch:", data);

                // Definisci lo stato iniziale con tutti i costi a 0
                const costiState = {
                    f0: 0,
                    f1: 0,
                    f2: 0,
                    f3: 0,
                    f1_perdite: 0,
                    f2_perdite: 0,
                    f3_perdite: 0,
                };

                // Se la risposta è un array di oggetti, mappa ciascun oggetto al valore corrispondente
                data.forEach((item) => {
                    const key = item.nomeCosto;
                    if (key in costiState) {
                        costiState[key] = item.costoEuro;
                    }
                });

                // Imposta i valori del form con i dati ricevuti
                Object.entries(costiState).forEach(([key, value]) => {
                    form.setValue(key as keyof CostiState, value);
                });
            } else {
                console.error("Errore nella fetch dei costi cliente");
                toast({
                    title: "Errore",
                    description: "Impossibile caricare i dati dei costi energetici",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Errore nella fetch:", error);
            toast({
                title: "Errore",
                description: "Si è verificato un errore durante il caricamento dei dati",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (formData: CostiState) => {
        setLoading(true);
        try {
            // Converti i dati del form in un array di oggetti come richiesto dall'API
            const costiArray = Object.entries(formData).map(([key, value]) => ({
                nomeCosto: key,
                costoEuro: value,
            }));

            console.log("Invio costiArray:", costiArray);

            // Invia i dati al server
            const response = await fetch(`${PATH_DEV}/cliente/costi-energia/add`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(costiArray),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Dati inviati correttamente:", data);
                toast({
                    title: "Successo",
                    description: "I costi energetici sono stati salvati con successo",
                });
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Errore durante il salvataggio dei costi');
            }
        } catch (error) {
            console.error('Errore:', error);
            toast({
                title: "Errore",
                description: error instanceof Error ? error.message : 'Errore durante il salvataggio dei costi',
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="f0"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>F0 (€/kWh)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.0001" placeholder="0.0000" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Fascia unica
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="f1"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>F1 (€/kWh)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.0001" placeholder="0.0000" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Fascia 1 (8:00-19:00 lun-ven)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="f2"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>F2 (€/kWh)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.0001" placeholder="0.0000" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Fascia 2 (7:00-8:00 e 19:00-23:00 lun-ven, 7:00-23:00 sab)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="f3"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>F3 (€/kWh)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.0001" placeholder="0.0000" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Fascia 3 (23:00-7:00 lun-sab, tutto dom e festivi)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="f1_perdite"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>F1 Perdite (€/kWh)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.0001" placeholder="0.0000" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Fascia 1 con perdite
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="f2_perdite"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>F2 Perdite (€/kWh)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.0001" placeholder="0.0000" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Fascia 2 con perdite
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="f3_perdite"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>F3 Perdite (€/kWh)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.0001" placeholder="0.0000" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Fascia 3 con perdite
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="mt-6" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvataggio in corso...
                        </>
                    ) : (
                        "Salva Costi"
                    )}
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

// Componente personalizzato per l'upload dei file
const FileUploadSection = ({onFileUploadSuccess}) => {
    const PATH_DEV = "http://localhost:8081";
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;

        if (selectedFile) {
            // Verifica che sia un file PDF
            if (!selectedFile.type.includes('pdf')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Formato file non supportato',
                    text: 'Carica solo file in formato PDF'
                });
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFile = e.dataTransfer.files?.[0] || null;

        if (droppedFile) {
            // Verifica che sia un file PDF
            if (!droppedFile.type.includes('pdf')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Formato file non supportato',
                    text: 'Carica solo file in formato PDF'
                });
                return;
            }

            setFile(droppedFile);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Se non è stato selezionato alcun file, mostra un alert
        if (!file) {
            await Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Seleziona un file da caricare'
            });
            return;
        }

        // Imposta lo state di loading
        setIsLoading(true);

        const formData = new FormData();
        formData.append('fileName', file.name);
        formData.append('fileData', file);

        try {
            // Effettua la richiesta al server
            const response = await fetch(`${PATH_DEV}/files/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const responseText = await response.text();

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Successo',
                    text: responseText || 'File caricato e processato con successo.'
                });

                // Reset del file
                setFile(null);

                // Notifica il componente padre che il caricamento è avvenuto con successo
                onFileUploadSuccess();
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: responseText || 'Errore durante il caricamento del file.'
                });
            }
        } catch (error) {
            console.error("Errore nella richiesta:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Si è verificato un errore imprevisto. Riprova più tardi.'
            });
        } finally {
            // Al termine della richiesta, reinizializza lo state di loading
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? "border-primary bg-primary/5" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="mb-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground"/>
                </div>

                <h3 className="text-lg font-medium mb-2">
                    Carica la tua bolletta energetica
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                    Trascina qui il tuo file PDF o clicca per selezionarlo
                </p>

                <p className="text-xs text-muted-foreground mb-4">
                    Formati supportati: PDF
                </p>

                <input
                    type="file"
                    id="file-upload"
                    accept=".pdf"
                    onChange={handleChange}
                    className="hidden"
                />

                <div className="space-y-3">
                    <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isLoading}
                    >
                        Seleziona file
                    </Button>

                    {file && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium">File selezionato:</p>
                            <p className="text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                    )}

                    {file && (
                        <Button
                            className="mt-4 w-full"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Caricamento in corso...
                                </>
                            ) : (
                                "Carica file"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

const UploadBillsPage = () => {
    const PATH_DEV = "http://localhost:8081";

    // Stati
    const [data, setData] = useState<BillFile[]>([]);
    const [pod, setPod] = useState<Pod[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPod, setSelectedPod] = useState<string>('all');
    const [sortColumn, setSortColumn] = useState<string>('fileName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'bills' | 'pods' | 'costs'>('bills'); // Aggiunto stato per la visualizzazione costs

    // Fetch dei dati all'avvio del componente
    useEffect(() => {
        getFiles();
        getPod();
    }, []);

    // Funzione per ottenere i file delle bollette
    const getFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${PATH_DEV}/pod/bollette`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setData(data);
            } else {
                console.error('Errore durante il recupero delle bollette');
            }
        } catch (error) {
            console.error('Errore durante la chiamata fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    // Funzione per ottenere i POD
    const getPod = async () => {
        try {
            const response = await fetch(`${PATH_DEV}/pod`, {
                credentials: 'include',
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            });

            if (response.ok) {
                const data = await response.json();
                // Arricchisci i dati POD con dati di esempio se necessario
                const enrichedPods = data.map(pod => ({
                    ...pod,
                    potenzaImpegnata: pod.potenzaImpegnata,
                    tensione: pod.tipoTensione,
                    fornitore: pod.fornitore,
                    potenzaDisponibile: pod.potenzaDisponibile,
                }));
                setPod(enrichedPods);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Errore durante il recupero dei POD'
                });
            }
        } catch (error) {
            console.error('Errore durante il recupero dei POD:', error);
        }
    };

    // Funzione per scaricare un file
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
            console.error('Error downloading file', error);
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Impossibile scaricare il file'
            });
        }
    };

    // Gestione ordinamento
    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Icona di ordinamento
    const sortIcon = (column: string) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>;
    };

    // Funzione chiamata dopo un caricamento file con successo
    const handleFileUploadSuccess = () => {
        // Aggiorna la lista dei file
        getFiles();
    };

    // Filtraggio e ordinamento dei dati
    const filteredAndSortedData = data
        .filter(file => {
            // Prima controlla se il POD selezionato corrisponde
            const podMatches = selectedPod === 'all' || file.idPod === selectedPod;

            // Poi controlla se il termine di ricerca è presente nel nome file o nell'ID POD
            const searchMatches =
                file.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                file.idPod?.toLowerCase().includes(searchTerm.toLowerCase());

            // Restituisce true solo se entrambe le condizioni sono soddisfatte
            return podMatches && searchMatches;
        })
        .sort((a, b) => {
            // Ordinamento
            const aValue = a[sortColumn as keyof BillFile] || '';
            const bValue = b[sortColumn as keyof BillFile] || '';

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    return (
        <div className="flex h-full">
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Inserimento Bollette</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Carica e gestisci le tue bollette energetiche
                </p>

                {/* Upload Section - Solo quando si visualizzano le bollette */}
                {viewMode === 'bills' && (
                    <div className="mb-8">
                        <FileUploadSection onFileUploadSuccess={handleFileUploadSuccess}/>
                    </div>
                )}

                {/* View Toggle Switch */}
                <div className="flex items-center mb-6 space-x-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="view-mode-pods"
                            checked={viewMode === 'pods'}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setViewMode('pods');
                                } else if (viewMode === 'pods') {
                                    setViewMode('bills');
                                }
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
                                if (checked) {
                                    setViewMode('costs');
                                } else if (viewMode === 'costs') {
                                    setViewMode('bills');
                                }
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

                {/* Filter Controls - Adattati in base alla vista */}
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
                                    {pod.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.id}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                )}

                {/* Costs Form - Visibile solo quando viewMode è 'costs' */}
                {viewMode === 'costs' && (
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Gestione Costi Energetici</h2>
                        <CostiForm />
                    </div>
                )}

                {/* Bills Table - Visibile solo quando viewMode è 'bills' */}
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

                {/* PODs Table - Nuova tabella visibile solo quando viewMode è 'pods' */}
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadBillsPage;
