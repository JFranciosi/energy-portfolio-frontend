
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const CostiPage = () => {
  const PATH_DEV = "http://localhost:8081";
  
  // Stato per i dati e la paginazione
  const [data, setData] = useState<Costo[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ids, setIds] = useState<number[]>([]);

  // Stato per i filtri
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterAnno, setFilterAnno] = useState("");
  const [filterAnnoRiferimento, setFilterAnnoRiferimento] = useState("");
  const [filterIntervalloPotenza, setFilterIntervalloPotenza] = useState("");

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
        setData(responseData);
        
        // Calcola il numero totale di pagine
        const totalItems = responseData.length || 0; // Questo dovrebbe essere regolato in base alla tua API
        setTotalPages(Math.ceil(totalItems / size) || 1);
      } else {
        console.error('Errore durante il fetch:', response.statusText);
        setError(`Errore del server: ${response.status} ${response.statusText}`);
        toast.error("Errore nel caricamento dei costi");
      }
    } catch (error) {
      console.error('Errore durante il fetch dei costi filtrati:', error);
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
    // Implementazione per gestire la modifica
    toast.info(`Modifica costo con ID: ${id}`);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Gestione Costi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="filterCategoria">Categoria</Label>
              <Input
                id="filterCategoria"
                placeholder="Filtra per categoria"
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterAnno">Anno</Label>
              <Input
                id="filterAnno"
                placeholder="Filtra per anno"
                value={filterAnno}
                onChange={(e) => setFilterAnno(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterAnnoRiferimento">Anno di riferimento</Label>
              <Input
                id="filterAnnoRiferimento"
                placeholder="Filtra per anno di riferimento"
                value={filterAnnoRiferimento}
                onChange={(e) => setFilterAnnoRiferimento(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterIntervalloPotenza">Intervallo Potenza</Label>
              <Input
                id="filterIntervalloPotenza"
                placeholder="Filtra per intervallo potenza"
                value={filterIntervalloPotenza}
                onChange={(e) => setFilterIntervalloPotenza(e.target.value)}
              />
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
                    <TableRow key={costo.id}>
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

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(0, page - 1))}
                  className={page === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Mostra 5 pagine alla volta centrate intorno alla pagina corrente
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
                  onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                  className={page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostiPage;
