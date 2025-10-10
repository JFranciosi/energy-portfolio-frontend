
import React, { useEffect, useState } from 'react';
import { Button } from "../../components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "../../components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { AlertCircle, Upload, Download, Filter } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import Swal from 'sweetalert2';
import { useIsMobile } from "../../hooks/use-mobile";


// Interfacce per definire le strutture dati
interface Costo {
  id: number;
  descrizione: string;
  unitaMisura: string;
  trimestre: string;
  anno: string;
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

const CostiPage = () => {
    const PATH_DEV = 'https://energyportfolio.it';

  //const PATH_DEV = "http://localhost:8081";
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
  const [filterAnno, setFilterAnno] = useState("");
  const [filterAnnoRiferimento, setFilterAnnoRiferimento] = useState("");
  const [filterIntervalloPotenza, setFilterIntervalloPotenza] = useState("");

  // Stato per il file upload
  const [file, setFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Funzione per caricare i costi filtrati
  const fetchCostiFiltrati = async (page = 0, size = 50) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterCategoria) params.append("categoria", filterCategoria);
      if (filterAnno) params.append("anno", filterAnno);
      if (filterAnnoRiferimento) params.append("annoRiferimento", filterAnnoRiferimento);
      if (filterIntervalloPotenza) params.append("intervalloPotenza", filterIntervalloPotenza);
      
      // Aggiungi parametri di paginazione
      params.append("page", page.toString());
      params.append("size", size.toString());

      console.log(`${PATH_DEV}/costi/filtrati?${params.toString()}`);
      const response = await fetch(`${PATH_DEV}/costi/filtrati?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log("Dati ricevuti:", responseData);
        
        // Gestione per il formato di risposta paginato
        if (responseData && responseData.contenuto && Array.isArray(responseData.contenuto)) {
          setData(responseData.contenuto);
          setTotalPages(responseData.totalePagine || 1);
          setTotalElements(responseData.totaleElementi || 0);
          setPage(responseData.pagina || 0);
        } else if (Array.isArray(responseData)) {
          // Fallback per risposta in formato array
          setData(responseData);
          setTotalPages(Math.ceil(responseData.length / size) || 1);
          setTotalElements(responseData.length || 0);
        } else if (responseData && typeof responseData === 'object') {
          // Fallback per risposta in formato oggetto
          const costiArray = Object.values(responseData);
          if (Array.isArray(costiArray)) {
            setData(costiArray as Costo[]);
            setTotalPages(Math.ceil(costiArray.length / size) || 1);
            setTotalElements(costiArray.length || 0);
          } else {
            throw new Error("Formato di risposta non riconosciuto");
          }
        } else {
          throw new Error("Formato di risposta non riconosciuto");
        }
      } else {
        console.error('Errore durante il fetch:', response.statusText);
        setData([]);
        setError(`Errore del server: ${response.status} ${response.statusText}`);
        toast.error("Errore nel caricamento dei costi");
      }
    } catch (error) {
      console.error('Errore durante il fetch dei costi filtrati:', error);
      setData([]);
      setError("Impossibile connettersi al server. Verifica che il server API sia in esecuzione su http://localhost:8081");
      toast.error("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  // Carica i dati iniziali e quando cambiano i filtri o la pagina
  useEffect(() => {
    fetchCostiFiltrati(page, size);
  }, [page, filterCategoria, filterAnno, filterAnnoRiferimento, filterIntervalloPotenza]);

  // Gestione della selezione delle righe
  const handleToggleCheckbox = (id: number) => {
    setIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const handleSelectRow = (index: number, id: number) => {
    console.log("Riga selezionata:", index, "ID:", id);
    // Trova il costo con l'ID corrispondente
    const costoToEdit = data.find(costo => costo.id === id);
    if (costoToEdit) {
      setSelectedIndex(index);
      setEditRowData({...costoToEdit});
      setIsEditDialogOpen(true);
    } else {
      toast.error("Errore: costo non trovato");
    }
  };

  // Funzione per gestire il salvataggio delle modifiche
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
          fetchCostiFiltrati(page, size); // Ricarica i dati dopo il salvataggio
        });
      } else {
        Swal.fire({
          icon: "error",
          text: "Errore durante il salvataggio delle modifiche"
        });
        console.log("modifiche: " + JSON.stringify(editRowData));
      }
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      Swal.fire({
        icon: "error",
        text: "Errore di connessione durante il salvataggio"
      });
    }
  };

  // Funzione per eliminare un costo
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
          fetchCostiFiltrati(page, size); // Ricarica i dati
        } else {
          toast.error("Errore nell'eliminazione del costo");
        }
      } catch (error) {
        console.error('Errore durante l\'eliminazione:', error);
        toast.error("Errore di connessione");
      }
    }
  };

  // Funzione per gestire il cambio pagina
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Funzione per gestire il cambio dei campi nel form di modifica
  const handleEditChange = (field: keyof Costo, value: string | number) => {
    if (editRowData) {
      setEditRowData({
        ...editRowData,
        [field]: value
      });
    }
  };

  // Gestione upload file Excel
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
        fetchCostiFiltrati(page, size); // Ricarica i dati dopo l'upload
      } else {
        await Swal.fire({
          icon: "error",
          text: "Errore durante l'upload dei dati",
        });
      }
    } catch (error) {
      console.error('Errore durante l\'upload:', error);
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
        link.remove();  // <-- qui
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
      console.error('Errore durante il download:', error);
      await Swal.fire({
        icon: 'error',
        text: 'Si è verificato un errore durante il download'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl-blue-900">Gestione Costi</CardTitle>
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
          {/* Nuovi filtri responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="filterCategoria">Categoria</Label>
              <Select
                value={filterCategoria}
                onValueChange={(value) => setFilterCategoria(value)}
              >
                <SelectTrigger id="filterCategoria" className="w-full">
                  <SelectValue placeholder="Filtra per Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le Categorie</SelectItem>
                  <SelectItem value="dispacciamento">Dispacciamento</SelectItem>
                  <SelectItem value="trasporti">Trasporti</SelectItem>
                  <SelectItem value="penali">Penali</SelectItem>
                  <SelectItem value="oneri">Oneri</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterAnno">Anno</Label>
              <Input
                id="filterAnno"
                placeholder="Filtra per Anno"
                value={filterAnno}
                onChange={(e) => setFilterAnno(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterAnnoRiferimento">Anno di riferimento</Label>
              <Input
                id="filterAnnoRiferimento"
                placeholder="Filtra per Anno di Riferimento"
                value={filterAnnoRiferimento}
                onChange={(e) => setFilterAnnoRiferimento(e.target.value)}
              />
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
                  <SelectItem value=">500KW">+500KW</SelectItem>
                  <SelectItem value="100-500KW">100-500KW</SelectItem>
                  <SelectItem value="<100KW">-100KW</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead><input type="checkbox" /></TableHead>
                  <TableHead>Indice</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead>Unità Misura</TableHead>
                  <TableHead>Trimestre</TableHead>
                  <TableHead>Anno</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Intervallo Potenza</TableHead>
                  <TableHead>Classe Agevolazione</TableHead>
                  <TableHead>Anno Riferimento</TableHead>
                  <TableHead>Modifica</TableHead>
                  <TableHead>Elimina</TableHead>
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
                      <TableCell>{page * size + index + 1}</TableCell>
                      <TableCell>{costo.descrizione}</TableCell>
                      <TableCell>{costo.unitaMisura}</TableCell>
                      <TableCell>{costo.trimestre}</TableCell>
                      <TableCell>{costo.anno}</TableCell>
                      <TableCell>{costo.costo}</TableCell>
                      <TableCell>{costo.categoria}</TableCell>
                      <TableCell>{costo.intervalloPotenza}</TableCell>
                      <TableCell>{costo.classeAgevolazione}</TableCell>
                      <TableCell>{costo.annoRiferimento}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => handleSelectRow(index, costo.id)}
                          className="mr-2"
                        >
                          Modifica
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => confirmAndDeleteCosto(costo.id)}
                        >
                          Elimina
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && data.length > 0 && (
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              <div>
                Mostrando {page * size + 1}-{Math.min((page + 1) * size, totalElements)} di {totalElements} elementi
              </div>
            </div>
          )}

          <Pagination className="mt-4"> 
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                size="sm"
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                className={page === 0 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i;
              } else if (page < 3) {
                pageToShow = i;
              } else if (page > totalPages - 3) {
                pageToShow = totalPages - 5 + i;
              } else {
                pageToShow = page - 2 + i;
              }
              
              return (
                <PaginationItem key={pageToShow}>
                  <PaginationLink
                    size="sm"
                    isActive={pageToShow === page} 
                    onClick={() => handlePageChange(pageToShow)}
                  >
                    {pageToShow + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                className={page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        </CardContent>
      </Card>

      {/* Dialog per la modifica */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifica Costo</DialogTitle>
          </DialogHeader>

          {editRowData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-descrizione">Descrizione</Label>
                <Input
                  id="edit-descrizione"
                  value={editRowData.descrizione}
                  onChange={(e) => handleEditChange('descrizione', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-unitaMisura">Unità Misura</Label>
                <Input
                  id="edit-unitaMisura"
                  value={editRowData.unitaMisura}
                  onChange={(e) => handleEditChange('unitaMisura', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-trimestre">Trimestre</Label>
                <Input
                  id="edit-trimestre"
                  value={editRowData.trimestre}
                  onChange={(e) => handleEditChange('trimestre', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-anno">Anno</Label>
                <Input
                  id="edit-anno"
                  value={editRowData.anno}
                  onChange={(e) => handleEditChange('anno', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-costo">Costo</Label>
                <Input
                  id="edit-costo"
                  type="number"
                  step="0.000001"
                  value={editRowData.costo}
                  onChange={(e) => handleEditChange('costo', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-categoria">Categoria</Label>
                <Input
                  id="edit-categoria"
                  value={editRowData.categoria}
                  onChange={(e) => handleEditChange('categoria', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-intervalloPotenza">Intervallo Potenza</Label>
                <Input
                  id="edit-intervalloPotenza"
                  value={editRowData.intervalloPotenza || ''}
                  onChange={(e) => handleEditChange('intervalloPotenza', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-classeAgevolazione">Classe Agevolazione</Label>
                <Input
                  id="edit-classeAgevolazione"
                  value={editRowData.classeAgevolazione || ''}
                  onChange={(e) => handleEditChange('classeAgevolazione', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-annoRiferimento">Anno Riferimento</Label>
                <Input
                  id="edit-annoRiferimento"
                  value={editRowData.annoRiferimento}
                  onChange={(e) => handleEditChange('annoRiferimento', e.target.value)}
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

export default CostiPage;
