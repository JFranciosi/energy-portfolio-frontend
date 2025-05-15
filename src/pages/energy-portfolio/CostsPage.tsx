
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { 
  FileSpreadsheet, 
  Pencil, 
  Trash2, 
  User, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

type CostItem = {
  id: string;
  costItem: string;
  amount: number;
};

const CostsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Table state
  const [costItems, setCostItems] = useState<CostItem[]>([
    { id: '1', costItem: 'Energia elettrica', amount: 3450.50 },
    { id: '2', costItem: 'Gas naturale', amount: 1250.75 },
    { id: '3', costItem: 'Manutenzione impianti', amount: 750.00 },
    { id: '4', costItem: 'Consulenza energetica', amount: 2000.00 },
    { id: '5', costItem: 'Certificazioni ambientali', amount: 1500.00 },
    { id: '6', costItem: 'Tasse ecologiche', amount: 850.25 },
    { id: '7', costItem: 'Ottimizzazione consumi', amount: 1200.00 },
    { id: '8', costItem: 'Monitoraggio continuo', amount: 950.50 },
    { id: '9', costItem: 'Formazione personale', amount: 1100.30 },
    { id: '10', costItem: 'Audit energetico', amount: 3200.00 },
    { id: '11', costItem: 'Materiali isolanti', amount: 2470.80 },
    { id: '12', costItem: 'Sistemi di raffreddamento', amount: 4200.90 },
  ]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<'costItem' | 'amount'>('costItem');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Modal state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<CostItem | null>(null);
  const [editForm, setEditForm] = useState({
    costItem: '',
    amount: 0,
  });

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': []
    },
    onDrop: (acceptedFiles) => {
      handleFileUpload(acceptedFiles);
    },
  });

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadSuccess(false);
    
    // Simulate upload delay
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      
      toast({
        title: "Upload completato",
        description: `${files[0].name} è stato caricato con successo.`,
      });
      
      // Reset success status after a delay
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    }, 2000);
  };

  // Sort handlers
  const handleSort = (column: 'costItem' | 'amount') => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(column);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Sort and paginate data
  const sortedItems = [...costItems].sort((a, b) => {
    if (sortColumn === 'costItem') {
      return sortDirection === 'asc' 
        ? a.costItem.localeCompare(b.costItem)
        : b.costItem.localeCompare(a.costItem);
    } else {
      return sortDirection === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
  });
  
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(costItems.length / itemsPerPage);

  // Edit handlers
  const handleEdit = (item: CostItem) => {
    setCurrentItem(item);
    setEditForm({
      costItem: item.costItem,
      amount: item.amount,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!currentItem) return;
    
    setCostItems(prevItems =>
      prevItems.map(item =>
        item.id === currentItem.id
          ? { ...item, costItem: editForm.costItem, amount: editForm.amount }
          : item
      )
    );
    
    toast({
      title: "Modifiche salvate",
      description: "La voce è stata aggiornata con successo.",
    });
    
    setEditDialogOpen(false);
  };

  // Delete handlers
  const handleDeleteClick = (item: CostItem) => {
    setCurrentItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!currentItem) return;
    
    setCostItems(prevItems => prevItems.filter(item => item.id !== currentItem.id));
    
    toast({
      title: "Voce eliminata",
      description: "La voce è stata eliminata con successo.",
      variant: "destructive",
    });
    
    setDeleteDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/energy-portfolio">Energy Portfolio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Gestione Costi</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold text-primary mb-2">Gestione Costi</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Gestisci e monitora i costi energetici della tua azienda caricando file Excel o modificando manualmente le voci.
      </p>

      {/* Upload area */}
      <div className="mb-8">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-muted",
            uploading ? "opacity-70 pointer-events-none" : "",
            uploadSuccess ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <p className="text-muted-foreground">Caricamento in corso...</p>
            </div>
          ) : uploadSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-2 text-green-600 dark:text-green-400">
              <svg
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="font-medium">File caricato con successo!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <FileSpreadsheet className="h-16 w-16 text-muted-foreground" />
              <div>
                <p className="font-medium text-lg">
                  Trascina qui il file Excel o fai clic per selezionarlo
                </p>
                <p className="text-muted-foreground mt-1">
                  Supporta file .xls e .xlsx
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-md shadow mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer w-2/3"
                onClick={() => handleSort('costItem')}
              >
                <div className="flex items-center">
                  Voce di Costo
                  {sortColumn === 'costItem' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="ml-2 h-4 w-4" /> : 
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end">
                  Importo (€)
                  {sortColumn === 'amount' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="ml-2 h-4 w-4" /> : 
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow 
                key={item.id}
                className="hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
              >
                <TableCell className="font-medium">{item.costItem}</TableCell>
                <TableCell className="text-right">
                  {item.amount.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                      <span className="sr-only">Modifica</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Elimina</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, costItems.length)} di {costItems.length} voci
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, i, arr) => (
                <React.Fragment key={page}>
                  {i > 0 && arr[i - 1] !== page - 1 && (
                    <span className="px-2">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className="w-9 h-9"
                  >
                    {page}
                  </Button>
                </React.Fragment>
              ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary">Modifica voce</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="costItem">Voce di Costo</Label>
              <Input
                id="costItem"
                value={editForm.costItem}
                onChange={(e) => setEditForm({ ...editForm, costItem: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Importo (€)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleEditSave}>Salva Modifiche</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" /> Conferma eliminazione
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Sei sicuro di voler eliminare questa voce?</p>
            <p className="font-medium mt-2">
              {currentItem?.costItem} - {currentItem?.amount.toLocaleString('it-IT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}€
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
            >
              Conferma Eliminazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostsPage;
