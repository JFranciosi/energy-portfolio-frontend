import React, {useEffect, useRef, useState} from 'react';
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {AlertCircle, Upload, Download, Trash, Pencil, Plus} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Swal from 'sweetalert2';
import { useIsMobile } from "@/hooks/use-mobile";
import { RefreshCw } from "lucide-react";
import CreatableSelect from 'react-select/creatable';

// Interfacce per definire le strutture dati
interface Costo {
  id: number;
  item: string;
  unitaMisura: string;
  modality: string;
  checkModality: string;
  costo: number;
  categoria: string;
  intervalloPotenza: string;
  classeAgevolazione: string;
  annoRiferimento: string;
}

// Interfaccia per la risposta paginata dal server
interface PaginatedResponse {
  contenuto: Costo[];
  pagina: number;
  dimensione: number;
  totaleElementi: number;
  totalePagine: number;
}

const DettaglioCostoPage = () => {
  const PATH_DEV = "http://localhost:8081";
  const isMobile = useIsMobile();

  // Stato per i dati e la paginazione
  const [data, setData] = useState<Costo[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ids, setIds] = useState<number[]>([]);

  // Stato per la modifica
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRowData, setEditRowData] = useState<Costo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Stato per i filtri
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterAnnoRiferimento, setFilterAnnoRiferimento] = useState("");
  const [filterIntervalloPotenza, setFilterIntervalloPotenza] = useState("");
  const [filterClasseAgevolazione, setFilterClasseAgevolazione] = useState("");

  // Stato per il file upload
  const [file, setFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const [item, setItem] = useState<string[]>([]);
  const [anniRiferimento, setAnniRiferimento] = useState<string[]>([]);
  const [intervalliPotenza, setIntervalliPotenza] = useState<string[]>([]);
  const [categorie, setCategorie] = useState<string[]>([]);
  const [classiAgevolazione, setClassiAgevolazione] = useState<string[]>([]);
  const [unitaMisure, setUnitaMisure] = useState<string[]>([]);

  const selectAllRef = useRef<HTMLInputElement>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);


  // Funzione per caricare i costi filtrati
  const fetchCostiFiltrati = async (page = 0, size = 50) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      // Aggiungi il filtro categoria solo se non è "all" e non è vuoto
      if (filterCategoria && filterCategoria !== "all") params.append("categoria", filterCategoria);
      if (filterAnnoRiferimento && filterAnnoRiferimento !== "all") params.append("annoRiferimento", filterAnnoRiferimento);
      if (filterIntervalloPotenza && filterIntervalloPotenza !== "all") params.append("intervalloPotenza", filterIntervalloPotenza);
      if (filterClasseAgevolazione && filterClasseAgevolazione !== "all") params.append("classeAgevolazione", filterClasseAgevolazione);

      // Aggiungi parametri di paginazione
      params.append("page", page.toString());
      params.append("size", size === 0 ? "-1" : size.toString()); // -1 indica "tutti"

      const response = await fetch(`${PATH_DEV}/costi/filtrati?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData && responseData.contenuto && Array.isArray(responseData.contenuto)) {
          setData(responseData.contenuto);
          setTotalPages(responseData.totalePagine || 1);
          setTotalElements(responseData.totaleElementi || 0);
          setPage(responseData.pagina || 0);
        } else if (Array.isArray(responseData)) {
          setData(responseData);
          setTotalPages(1);
          setTotalElements(responseData.length || 0);
        } else if (responseData && typeof responseData === 'object') {
          const costiArray = Object.values(responseData);
          if (Array.isArray(costiArray)) {
            setData(costiArray as Costo[]);
            setTotalPages(1);
            setTotalElements(costiArray.length || 0);
          } else {
            throw new Error("Formato di risposta non riconosciuto");
          }
        } else {
          throw new Error("Formato di risposta non riconosciuto");
        }
      } else {
        setData([]);
        setError(`Errore del server: ${response.status} ${response.statusText}`);
        toast.error("Errore nel caricamento dei costi");
      }
    } catch (error) {
      setData([]);
      setError("Impossibile connettersi al server. Verifica che il server API sia in esecuzione su http://localhost:8081");
      toast.error("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  // Funzione fetch separata
  const fetchAnniRiferimento = async () => {
    try {
      const response = await fetch(`${PATH_DEV}/costi/anniRiferimento`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      //alert("Anni ricevuti: " + JSON.stringify(data));
      setAnniRiferimento(Array.isArray(data) ? data : []);
    } catch (error) {
      alert("Errore fetch anni riferimento: " + error);
      setAnniRiferimento([]);
    }
  };

  const fetchItem = async () => {
    try {
      const response = await fetch(`${PATH_DEV}/costi/item`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      //alert("intervalli ricevuti: " + JSON.stringify(data));
      setItem(Array.isArray(data) ? data : []);
    } catch (error) {
      alert("Errore fetch intervalli potenza: " + error);
      setItem([]);
    }
  };

  const fetchIntervalliPotenza = async () => {
    try {
      const response = await fetch(`${PATH_DEV}/costi/intervalliPotenza`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      //alert("intervalli ricevuti: " + JSON.stringify(data));
      setIntervalliPotenza(Array.isArray(data) ? data : []);
    } catch (error) {
      alert("Errore fetch intervalli potenza: " + error);
      setIntervalliPotenza([]);
    }
  };

  const fetchCategorie = async () => {
    try {
      const response = await fetch(`${PATH_DEV}/costi/categorie`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      //alert("categorie ricevuti: " + JSON.stringify(data));
      setCategorie(Array.isArray(data) ? data : []);
    } catch (error) {
      alert("Errore fetch categorie: " + error);
      setCategorie([]);
    }
  };

  const fetchClasseAgevolazione = async () => {
    try {
      const response = await fetch(`${PATH_DEV}/costi/classeAgevolazione`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      //alert("categorie ricevuti: " + JSON.stringify(data));
      setClassiAgevolazione(Array.isArray(data) ? data : []);
    } catch (error) {
      alert("Errore fetch categorie: " + error);
      setClassiAgevolazione([]);
    }
  };

  const fetchUnitaMisure = async () => {
    try {
      const response = await fetch(`${PATH_DEV}/costi/unitaMisure`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      //alert("categorie ricevuti: " + JSON.stringify(data));
      setUnitaMisure(Array.isArray(data) ? data : []);
    } catch (error) {
      alert("Errore fetch categorie: " + error);
      setUnitaMisure([]);
    }
  };

// useEffect che chiama la funzione al primo render
  useEffect(() => {
    fetchAnniRiferimento();
    fetchIntervalliPotenza();
    fetchCategorie();
    fetchClasseAgevolazione();
    fetchUnitaMisure();
    fetchItem();
  }, []);


  // Carica i dati iniziali e quando cambiano i filtri o la pagina o la size
  useEffect(() => {
    fetchCostiFiltrati(page, size);
  }, [page, size, filterCategoria, filterAnnoRiferimento, filterIntervalloPotenza, filterClasseAgevolazione]);


  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = ids.length > 0 && ids.length < data.length;
    }
  }, [ids, data]);

  const checkModalityOptions = [
    { value: 0, label: "Unica" },
    { value: 1, label: "Annuale" },
    { value: 2, label: "Trimestrale" },
    { value: 3, label: "Mensile" }
  ];

  const modalityOptions = {
    0: [{ value: 0, label: "Unica" }],
    1: [{ value: 0, label: "Annuale" }],
    2: [
      { value: 0, label: "Q1" },
      { value: 1, label: "Q2" },
      { value: 2, label: "Q3" },
      { value: 3, label: "Q4" }
    ],
    3: [
      { value: 0, label: "Gennaio" },
      { value: 1, label: "Febbraio" },
      { value: 2, label: "Marzo" },
      { value: 3, label: "Aprile" },
      { value: 4, label: "Maggio" },
      { value: 5, label: "Giugno" },
      { value: 6, label: "Luglio" },
      { value: 7, label: "Agosto" },
      { value: 8, label: "Settembre" },
      { value: 9, label: "Ottobre" },
      { value: 10, label: "Novembre" },
      { value: 11, label: "Dicembre" }
    ]
  };

  const getCheckModalityLabel = (checkModality) => {
    switch (Number(checkModality)) {
      case 1: return "Annuale";
      case 2: return "Trimestrale";
      case 3: return "Mensile";
      default: return "Unica";
    }
  };

  const getModalityLabel = (checkModality, modality) => {
    switch (Number(checkModality)) {
      case 1:
        return "Annuale";
      case 2:
        return ["Q1", "Q2", "Q3", "Q4"][modality] || "";
      case 3:
        return [
          "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
          "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
        ][modality] || "";
      default:
        return "Unica";
    }
  };

  const [newRowData, setNewRowData] = useState<Costo>({
    id: 0,
    item: "",
    unitaMisura: "",
    modality: "0",
    checkModality: "0",
    costo: 0,
    categoria: "",
    intervalloPotenza: "",
    classeAgevolazione: "",
    annoRiferimento: ""
  });

  const handleAddRowOpen = () => {
    setNewRowData({
      id: 0,
      item: "",
      unitaMisura: "",
      modality: "0",
      checkModality: "0",
      costo: 0,
      categoria: "",
      intervalloPotenza: "",
      classeAgevolazione: "",
      annoRiferimento: ""
    });
    setIsAddDialogOpen(true);
  };



  // Gestione della selezione delle righe
  const handleToggleCheckbox = (id: number) => {
    setIds(prev =>
        prev.includes(id)
            ? prev.filter(item => item !== id)
            : [...prev, id]
    );
  };

  const handleSelectRow = (index: number, id: number) => {
    const costoToEdit = data.find(costo => costo.id === id);
    if (costoToEdit) {
      setSelectedIndex(index);
      setEditRowData({...costoToEdit});
      setIsEditDialogOpen(true);
    } else {
      toast.error("Errore: costo non trovato");
    }
  };

  const handleSaveChanges = async () => {
    if (!editRowData) return;
    try {
      const response = await fetch(`${PATH_DEV}/costi/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(editRowData)
      });
      if (response.ok) {
        setIsEditDialogOpen(false);
        Swal.fire({
          icon: "success",
          text: "Modifiche salvate con successo",
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          fetchCostiFiltrati(page, size);
        });
      } else {
        Swal.fire({
          icon: "error",
          text: "Errore durante il salvataggio delle modifiche"
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Errore di connessione durante il salvataggio"
      });
    }
  };

  const confirmAndDeleteCosto = async (id: number) => {
    if (window.confirm("Sei sicuro di voler eliminare questo costo?")) {
      try {
        const response = await fetch(`${PATH_DEV}/costi/delete/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {'Content-Type': 'application/json'}
        });
        if (response.ok) {
          toast.success("Costo eliminato con successo");
          fetchCostiFiltrati(page, size);
        } else {
          toast.error("Errore nell'eliminazione del costo");
        }
      } catch (error) {
        toast.error("Errore di connessione");
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleEditChange = (field: keyof Costo, value: string | number) => {
    if (editRowData) {
      setEditRowData({
        ...editRowData,
        [field]: value
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      await Swal.fire({
        icon: "error",
        text: "Seleziona un file da caricare",
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      const response = await fetch(`${PATH_DEV}/costi/upload`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        await Swal.fire({
          icon: "success",
          text: "Upload dei dati avvenuto con successo",
        });
        setIsUploadDialogOpen(false);
        setFile(null);
        fetchCostiFiltrati(page, size);
      } else {
        await Swal.fire({
          icon: "error",
          text: "Errore durante l'upload dei dati",
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        text: "Si è verificato un errore imprevisto durante l'upload",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCosti = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${PATH_DEV}/costi/downloadExcel`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'costi.xlsx');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        await Swal.fire({
          icon: 'success',
          text: 'Download dei dati avvenuto con successo'
        });
      } else {
        await Swal.fire({
          icon: 'error',
          text: 'Errore durante il download dei dati'
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        text: 'Si è verificato un errore imprevisto'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Gestione Costi</CardTitle>
              <div className="flex space-x-2">
                <Button
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Carica Excel
                </Button>
                <Button
                    onClick={handleDownloadCosti}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Scarica Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>

            {/* Filtri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="filterCategoria">Categoria</Label>
                <Select value={filterCategoria} onValueChange={(value) => setFilterCategoria(value)}>
                  <SelectTrigger id="filterCategoria" className="w-full">
                    <SelectValue placeholder="Filtra per Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le Categorie</SelectItem>
                    {Array.isArray(categorie) && categorie.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterAnnoRiferimento">Anno di riferimento</Label>
                <Select
                    value={filterAnnoRiferimento}
                    onValueChange={value => setFilterAnnoRiferimento(value)}>
                  <SelectTrigger id="filterAnnoRiferimento" className="w-full">
                    <SelectValue placeholder="Filtra per Anno di Riferimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli anni</SelectItem>
                    {Array.isArray(anniRiferimento) && anniRiferimento.map(anno => (
                        <SelectItem key={anno} value={anno}>{anno}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterIntervalloPotenza">Intervallo di Potenza</Label>
                <Select
                    value={filterIntervalloPotenza}
                    onValueChange={(value) => setFilterIntervalloPotenza(value)}
                >
                  <SelectTrigger id="filterIntervalloPotenza" className="w-full">
                    <SelectValue placeholder="Filtra per Intervallo di Potenza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli Intervalli</SelectItem>
                    {Array.isArray(intervalliPotenza) && intervalliPotenza.map(intervalli => (
                        <SelectItem key={intervalli} value={intervalli}>{intervalli}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterClasseAgevolazione">Classe di Agevolazione</Label>
                <Select
                    value={filterClasseAgevolazione}
                    onValueChange={(value) => setFilterClasseAgevolazione(value)}
                >
                  <SelectTrigger id="filterClasseAgevolazione" className="w-full">
                    <SelectValue placeholder="Filtra per Classe di Agevolazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli Intervalli</SelectItem>
                    {Array.isArray(classiAgevolazione) && classiAgevolazione.map(classe => (
                        <SelectItem key={classe} value={classe}>{classe}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              {/* SINISTRA: Comandi azione */}
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center">
                  <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={data.length > 0 && ids.length === data.length}
                      onChange={() => {
                        if (ids.length > 0) {
                          setIds([]);
                        } else {
                          setIds(data.map(costo => costo.id));
                        }
                      }}
                  />
                  <span className="ml-2">Seleziona tutti</span>
                </label>

                <label className="inline-flex items-center">
                  <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-100"
                      aria-label="Aggiorna tabella"
                      onClick={() => fetchCostiFiltrati(page, size)}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <span className="ml-2">Aggiorna Item</span>
                </label>

                <label className="inline-flex items-center">
                  <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-100"
                      aria-label="Aggiungi nuova riga"
                      onClick={() => {
                        setNewRowData({
                          id: 0,
                          item: "",
                          unitaMisura: "",
                          modality: "0",
                          checkModality: "0",
                          costo: 0,
                          categoria: "",
                          intervalloPotenza: "",
                          classeAgevolazione: "",
                          annoRiferimento: ""
                        });
                        setIsAddDialogOpen(true);
                      }}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="ml-2">Aggiungi Item</span>
                </label>

                {ids.length > 0 && (
                    <label className="inline-flex items-center">
                      <button
                          type="button"
                          className="p-2 rounded hover:bg-red-100"
                          aria-label="Elimina selezionati"
                          onClick={() => setIsBulkDeleteDialogOpen(true)}
                      >
                        <Trash className="w-5 h-5 text-red-600" />
                      </button>
                      <span className="ml-2">Elimina Item Selezionati</span>
                    </label>
                )}
              </div>

              {/* DESTRA: paginazione compatta */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select
                      value={size === 0 ? "all" : size.toString()}
                      onValueChange={value => {
                        if (value === "all") {
                          setSize(0);
                          setPage(0);
                        } else {
                          setSize(Number(value));
                          setPage(0);
                        }
                      }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Elementi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  {size === 0
                      ? `1-${totalElements} di ${totalElements}`
                      : `${page * size + 1}-${Math.min((page + 1) * size, totalElements)} di ${totalElements}`}
                </div>
                <div className="flex gap-1">
                  <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(Math.max(0, page - 1))}
                  >
                    &lt;
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Errore</AlertTitle>
                  <AlertDescription>
                    {error}
                    <div className="mt-2">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchCostiFiltrati(page, size)}
                      >
                        Riprova
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
            )}

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>    </TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Unità di Misura</TableHead>
                    <TableHead>Modality</TableHead>
                    <TableHead>Check Modality</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Intervallo Potenza</TableHead>
                    <TableHead>Classe Agevolazione</TableHead>
                    <TableHead>Anno Riferimento</TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center py-4">
                          Caricamento in corso...
                        </TableCell>
                      </TableRow>
                  ) : data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center py-4">
                          {error ? "Impossibile caricare i dati" : "Nessun risultato trovato"}
                        </TableCell>
                      </TableRow>
                  ) : (
                      data.map((costo, index) => (
                          <TableRow key={costo.id || `row-${index}`}>
                            <TableCell>
                              <input
                                  type="checkbox"
                                  checked={ids.includes(costo.id)}
                                  onChange={() => handleToggleCheckbox(costo.id)}
                              />
                            </TableCell>
                            <TableCell>{costo.item}</TableCell>
                            <TableCell>{costo.unitaMisura}</TableCell>
                            <TableCell>{getModalityLabel(costo.checkModality, costo.modality)}</TableCell>
                            <TableCell>{getCheckModalityLabel(costo.checkModality)}</TableCell>
                            <TableCell>{costo.costo}</TableCell>
                            <TableCell>{costo.categoria}</TableCell>
                            <TableCell>{costo.intervalloPotenza}</TableCell>
                            <TableCell>{costo.classeAgevolazione}</TableCell>
                            <TableCell>{costo.annoRiferimento}</TableCell>

                              <TableCell>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Modifica"
                                    onClick={() => handleSelectRow(index, costo.id)}
                                    className="mr-2"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Elimina"
                                    onClick={() => confirmAndDeleteCosto(costo.id)}
                                >
                                  <Trash className="w-4 h-4 text-red-500" />
                                </Button>
                              </TableCell>

                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog per la modifica */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifica</DialogTitle>
            </DialogHeader>
            {editRowData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

                  {/* ITEM */}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-item">Item</Label>
                    <CreatableSelect
                        isClearable
                        inputId="edit-item"
                        value={
                          editRowData.item
                              ? { value: editRowData.item, label: editRowData.item }
                              : null
                        }
                        onChange={option => handleEditChange('item', option ? option.value : '')}
                        options={
                          Array.isArray(item)
                              ? item.map(i => ({ value: i, label: i }))
                              : []
                        }
                        placeholder="Seleziona o scrivi un item"
                    />
                  </div>

                  {/* UNITA' DI MISURA */}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-unitaMisura">Unità di Misura</Label>
                    <CreatableSelect
                        isClearable
                        inputId="edit-unitaMisura"
                        value={
                          editRowData.unitaMisura
                              ? { value: editRowData.unitaMisura, label: editRowData.unitaMisura }
                              : null
                        }
                        onChange={option => handleEditChange('unitaMisura', option ? option.value : '')}
                        options={
                          Array.isArray(unitaMisure)
                              ? unitaMisure.map(m => ({ value: m, label: m }))
                              : []
                        }
                        placeholder="Seleziona o scrivi unità di misura"
                    />
                  </div>

                  {/* PERIODICITA' */}
                  <div className="grid gap-2">
                    <Label>Periodicità</Label>
                    <CreatableSelect
                        isClearable={false}
                        value={
                          checkModalityOptions.find(opt =>
                              opt.value.toString() === (editRowData.checkModality?.toString() ?? "0")
                          )
                              ? { value: (editRowData.checkModality?.toString() ?? "0"), label:
                                checkModalityOptions.find(opt =>
                                    opt.value.toString() === (editRowData.checkModality?.toString() ?? "0")).label }
                              : null
                        }
                        onChange={option => {
                          setEditRowData(prev => prev ? {
                            ...prev,
                            checkModality: option ? option.value : "0",
                            modality: "0"
                          } : prev);
                        }}
                        options={checkModalityOptions.map(opt => ({
                          value: opt.value.toString(),
                          label: opt.label,
                        }))}
                        placeholder="Seleziona periodicità"
                        isDisabled={false}
                        isSearchable
                    />
                  </div>

                  {/* PERIODO */}
                  <div className="grid gap-2">
                    <Label>Periodo</Label>
                    <CreatableSelect
                        isClearable={false}
                        value={
                          (modalityOptions[Number(editRowData.checkModality)] || [{ value: 0, label: "Unica" }])
                              .find(opt => opt.value.toString() === (editRowData.modality?.toString() ?? "0"))
                              ? { value: (editRowData.modality?.toString() ?? "0"), label:
                                (modalityOptions[Number(editRowData.checkModality)] || [{ value: 0, label: "Unica" }])
                                    .find(opt => opt.value.toString() === (editRowData.modality?.toString() ?? "0")).label }
                              : null
                        }
                        onChange={option =>
                            handleEditChange('modality', option ? option.value : '')
                        }
                        options={
                          (modalityOptions[Number(editRowData.checkModality)] || [{ value: 0, label: "Unica" }])
                              .map(opt => ({ value: opt.value.toString(), label: opt.label }))
                        }
                        placeholder="Seleziona periodo"
                        isDisabled={false}
                        isSearchable
                    />
                  </div>

                  {/* COSTO */}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-costo">Costo</Label>
                    <Input
                        id="edit-costo"
                        type="number"
                        step="0.000001"
                        value={editRowData.costo}
                        onChange={e => handleEditChange('costo', parseFloat(e.target.value))}
                    />
                  </div>

                  {/* CATEGORIA */}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-categoria">Categoria</Label>
                    <CreatableSelect
                        isClearable
                        inputId="edit-categoria"
                        value={
                          editRowData.categoria
                              ? { value: editRowData.categoria, label: editRowData.categoria }
                              : null
                        }
                        onChange={option => handleEditChange('categoria', option ? option.value : '')}
                        options={
                          Array.isArray(categorie) ? categorie.map(cat => ({ value: cat, label: cat })) : []
                        }
                        placeholder="Seleziona o scrivi una categoria"
                    />
                  </div>

                  {/* INTERVALLO DI POTENZA */}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-intervalloPotenza">Intervallo di Potenza</Label>
                    <CreatableSelect
                        isClearable
                        inputId="edit-intervalloPotenza"
                        value={
                          editRowData.intervalloPotenza
                              ? { value: editRowData.intervalloPotenza, label: editRowData.intervalloPotenza }
                              : null
                        }
                        onChange={option => handleEditChange('intervalloPotenza', option ? option.value : '')}
                        options={
                          Array.isArray(intervalliPotenza)
                              ? intervalliPotenza.map(ip => ({ value: ip, label: ip }))
                              : []
                        }
                        placeholder="Seleziona o scrivi intervallo"
                    />
                  </div>

                  {/* CLASSE AGEVOLAZIONE */}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-classeAgevolazione">Classe Agevolazione</Label>
                    <CreatableSelect
                        isClearable
                        inputId="edit-classeAgevolazione"
                        value={
                          editRowData.classeAgevolazione
                              ? { value: editRowData.classeAgevolazione, label: editRowData.classeAgevolazione }
                              : null
                        }
                        onChange={option => handleEditChange('classeAgevolazione', option ? option.value : '')}
                        options={
                          Array.isArray(classiAgevolazione)
                              ? classiAgevolazione.map(ca => ({ value: ca, label: ca }))
                              : []
                        }
                        placeholder="Seleziona o scrivi classe"
                    />
                  </div>

                  {/* ANNO RIFERIMENTO */}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-annoRiferimento">Anno Riferimento</Label>
                    <Input
                        value={editRowData.annoRiferimento}
                        onChange={e => {
                          const val = e.target.value;
                          // Consenti solo numeri e massimo 4 cifre
                          if (/^\d{0,4}$/.test(val)) {
                            handleEditChange('annoRiferimento', val);
                          }
                        }}
                    />
                  </div>
                </div>
            )}
            <DialogFooter>
              <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
              >
                Annulla
              </Button>
              <Button
                  type="button"
                  onClick={handleSaveChanges}
              >
                Salva Modifiche
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Dialog per aggiunta item */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nuova Riga</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

              {/* DESCRIZIONE (ITEM) */}
              <div className="grid gap-2">
                <Label>Descrizione</Label>
                <CreatableSelect
                    isClearable
                    inputId="add-item"
                    value={
                      newRowData.item
                          ? { value: newRowData.item, label: newRowData.item }
                          : null
                    }
                    onChange={option =>
                        setNewRowData({ ...newRowData, item: option ? option.value : '' })
                    }
                    options={
                      Array.isArray(item) ? item.map(i => ({ value: i, label: i })) : []
                    }
                    placeholder="Seleziona o scrivi una descrizione"
                />
              </div>

              {/* UNITA' DI MISURA */}
              <div className="grid gap-2">
                <Label>Unità di Misura</Label>
                <CreatableSelect
                    isClearable
                    inputId="add-unitaMisura"
                    value={
                      newRowData.unitaMisura
                          ? { value: newRowData.unitaMisura, label: newRowData.unitaMisura }
                          : null
                    }
                    onChange={option =>
                        setNewRowData({
                          ...newRowData,
                          unitaMisura: option ? option.value : ''
                        })
                    }
                    options={
                      Array.isArray(unitaMisure)
                          ? unitaMisure.map(m => ({ value: m, label: m }))
                          : []
                    }
                    placeholder="Seleziona o scrivi unità di misura"
                />
              </div>

              {/* PERIODICITA' */}
              <div className="grid gap-2">
                <Label>Periodicità</Label>
                <Select
                    value={newRowData.checkModality}
                    onValueChange={value =>
                        setNewRowData({
                          ...newRowData,
                          checkModality: value,
                          modality: "0"
                        })
                    }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona periodicità" />
                  </SelectTrigger>
                  <SelectContent>
                    {checkModalityOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* PERIODO */}
              <div className="grid gap-2">
                <Label>Periodo</Label>
                <Select
                    value={newRowData.modality}
                    onValueChange={value =>
                        setNewRowData({ ...newRowData, modality: value })
                    }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(modalityOptions[Number(newRowData.checkModality)] ||
                        [{ value: 0, label: "Unica" }]).map(opt => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* COSTO */}
              <div className="grid gap-2">
                <Label>Costo</Label>
                <Input
                    type="number"
                    step="0.000001"
                    value={newRowData.costo}
                    onChange={e =>
                        setNewRowData({
                          ...newRowData,
                          costo: parseFloat(e.target.value)
                        })
                    }
                />
              </div>

              {/* CATEGORIA */}
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <CreatableSelect
                    isClearable
                    inputId="add-categoria"
                    value={
                      newRowData.categoria
                          ? { value: newRowData.categoria, label: newRowData.categoria }
                          : null
                    }
                    onChange={option =>
                        setNewRowData({
                          ...newRowData,
                          categoria: option ? option.value : ''
                        })
                    }
                    options={
                      Array.isArray(categorie)
                          ? categorie.map(cat => ({ value: cat, label: cat }))
                          : []
                    }
                    placeholder="Seleziona o scrivi categoria"
                />
              </div>

              {/* INTERVALLO DI POTENZA */}
              <div className="grid gap-2">
                <Label>Intervallo di Potenza</Label>
                <CreatableSelect
                    isClearable
                    inputId="add-intervalloPotenza"
                    value={
                      newRowData.intervalloPotenza
                          ? { value: newRowData.intervalloPotenza, label: newRowData.intervalloPotenza }
                          : null
                    }
                    onChange={option =>
                        setNewRowData({
                          ...newRowData,
                          intervalloPotenza: option ? option.value : ''
                        })
                    }
                    options={
                      Array.isArray(intervalliPotenza)
                          ? intervalliPotenza.map(i => ({ value: i, label: i }))
                          : []
                    }
                    placeholder="Seleziona o scrivi intervallo"
                />
              </div>

              {/* CLASSE AGEVOLAZIONE */}
              <div className="grid gap-2">
                <Label>Classe Agevolazione</Label>
                <CreatableSelect
                    isClearable
                    inputId="add-classeAgevolazione"
                    value={
                      newRowData.classeAgevolazione
                          ? { value: newRowData.classeAgevolazione, label: newRowData.classeAgevolazione }
                          : null
                    }
                    onChange={option =>
                        setNewRowData({
                          ...newRowData,
                          classeAgevolazione: option ? option.value : ''
                        })
                    }
                    options={
                      Array.isArray(classiAgevolazione)
                          ? classiAgevolazione.map(ca => ({ value: ca, label: ca }))
                          : []
                    }
                    placeholder="Seleziona o scrivi classe"
                />
              </div>

              {/* ANNO RIFERIMENTO */}
              <div className="grid gap-2">
                <Label>Anno Riferimento</Label>
                <Input
                    value={newRowData.annoRiferimento}
                    onChange={e => {
                      const val = e.target.value;
                      // Consenti solo numeri e massimo 4 cifre
                      if (/^\d{0,4}$/.test(val)) {
                        setNewRowData({ ...newRowData, annoRiferimento: val });
                      }
                    }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
              >
                Annulla
              </Button>
              <Button
                  type="button"
                  onClick={async () => {
                    // Chiamata API per inserire la nuova riga
                    const response = await fetch(`${PATH_DEV}/costi/add`, {
                      method: 'POST',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newRowData)
                    });
                    if (response.ok) {
                      setIsAddDialogOpen(false);
                      fetchCostiFiltrati(page, size);
                      toast.success("Riga aggiunta con successo");
                    } else {
                      toast.error("Errore durante l'aggiunta");
                    }
                  }}
              >
                Aggiungi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Conferma Eliminazione</DialogTitle>
            </DialogHeader>
            <p>Sei sicuro di voler eliminare i seguenti elementi?</p>
            <div className="my-4 max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                <tr>
                  <th className="text-left">Nome</th>
                  <th className="text-left">Intervallo Potenza</th>
                  <th className="text-left">Anno</th>
                </tr>
                </thead>
                <tbody>
                {data
                    .filter(c => ids.includes(c.id))
                    .map(c => (
                        <tr key={c.id}>
                          <td>{c.item}</td>
                          <td>{c.intervalloPotenza}</td>
                          <td>{c.annoRiferimento}</td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBulkDeleteDialogOpen(false)}
              >
                Annulla
              </Button>
              <Button
                  type="button"
                  variant="destructive"
                  onClick={async () => {
                    // Chiamata API per eliminazione multipla
                    const selectedIds = ids;
                    // Esegui una fetch DELETE per tutti gli id selezionati o una batch API se disponibile
                    await Promise.all(
                        selectedIds.map(id =>
                            fetch(`${PATH_DEV}/costi/delete/${id}`, {
                              method: 'DELETE',
                              credentials: 'include',
                              headers: { 'Content-Type': 'application/json' }
                            })
                        )
                    );
                    setIsBulkDeleteDialogOpen(false);
                    setIds([]);
                    fetchCostiFiltrati(page, size);
                    toast.success("Elementi eliminati con successo");
                  }}
              >
                Elimina selezionati
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Dialog per l'upload del file Excel */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Carica file Excel</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="file-upload">Seleziona file Excel</Label>
                <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                />
                {file && (
                    <p className="text-sm text-muted-foreground">
                      File selezionato: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                )}
              </div>
              <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                    disabled={loading}
                >
                  Annulla
                </Button>
                <Button
                    type="submit"
                    disabled={loading || !file}
                >
                  {loading ? "Caricamento in corso..." : "Carica file"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default DettaglioCostoPage;
