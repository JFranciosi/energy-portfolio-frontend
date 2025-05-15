
import React, { useState } from 'react';
import { FileUploader } from '@/components/energy-portfolio/FileUploader';
import { CollapsibleSidebar } from '@/components/energy-portfolio/CollapsibleSidebar';
import { StatusIndicator } from '@/components/energy-portfolio/StatusIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Download, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface BillFile {
  id: string;
  name: string;
  date: string;
  pod: string;
  consumption: string;
  size: string;
}

const UploadBillsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPod, setSelectedPod] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const mockBills: BillFile[] = [
    {
      id: '1',
      name: 'Bolletta_Maggio_2025.pdf',
      date: '15 maggio 2025',
      pod: 'IT001E12345678',
      consumption: '3.450 kWh',
      size: '1.2 MB'
    },
    {
      id: '2',
      name: 'Bolletta_Aprile_2025.pdf',
      date: '15 aprile 2025',
      pod: 'IT001E12345678',
      consumption: '3.200 kWh',
      size: '1.1 MB'
    },
    {
      id: '3',
      name: 'Bolletta_Marzo_2025.pdf',
      date: '15 marzo 2025',
      pod: 'IT001E12345678',
      consumption: '3.600 kWh',
      size: '1.3 MB'
    },
    {
      id: '4',
      name: 'Bolletta_Maggio_2025_Sede2.pdf',
      date: '10 maggio 2025',
      pod: 'IT001E87654321',
      consumption: '2.100 kWh',
      size: '1.0 MB'
    },
    {
      id: '5',
      name: 'Bolletta_Aprile_2025_Sede2.pdf',
      date: '10 aprile 2025',
      pod: 'IT001E87654321',
      consumption: '2.250 kWh',
      size: '1.1 MB'
    },
  ];

  const uniquePods = Array.from(new Set(mockBills.map(bill => bill.pod)));

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredBills = mockBills
    .filter(bill => 
      bill.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (selectedPod === 'all' || bill.pod === selectedPod)
    )
    .sort((a, b) => {
      const aValue = a[sortColumn as keyof BillFile];
      const bValue = b[sortColumn as keyof BillFile];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleFileAccepted = (file: File) => {
    console.log('File accepted:', file);
    // Here you would typically handle the file, maybe upload it to a server
  };

  const sortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Inserimento Bollette</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Carica e gestisci le tue bollette energetiche
        </p>

        {/* Upload Section */}
        <div className="mb-8">
          <FileUploader onFileAccepted={handleFileAccepted} />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca bollette..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedPod} onValueChange={setSelectedPod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per POD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i POD</SelectItem>
              {uniquePods.map(pod => (
                <SelectItem key={pod} value={pod}>{pod}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bills Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[250px] cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Nome File {sortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Data {sortIcon('date')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('pod')}
                >
                  <div className="flex items-center">
                    POD {sortIcon('pod')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('consumption')}
                >
                  <div className="flex items-center">
                    Consumo {sortIcon('consumption')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nessuna bolletta trovata
                  </TableCell>
                </TableRow>
              ) : (
                sortedAndFilteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <div className="font-medium">{bill.name}</div>
                      <div className="text-xs text-muted-foreground">{bill.size}</div>
                    </TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>{bill.pod}</TableCell>
                    <TableCell>{bill.consumption}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sidebar */}
      <CollapsibleSidebar title="Statistiche Upload">
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">Stato Caricamenti</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completati</span>
                <StatusIndicator status="success" text="12" className="h-6" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">In corso</span>
                <StatusIndicator status="loading" text="1" className="h-6" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Con errori</span>
                <StatusIndicator status="error" text="2" className="h-6" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">POD Monitorati</h4>
            <div className="space-y-2">
              {uniquePods.map((pod) => (
                <div key={pod} className="flex justify-between text-sm">
                  <span>{pod}</span>
                  <span className="font-medium">
                    {mockBills.filter(bill => bill.pod === pod).length} bollette
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">Periodo Coperto</h4>
            <p className="text-sm text-muted-foreground">
              Da <span className="font-medium">Marzo 2025</span> a <span className="font-medium">Maggio 2025</span>
            </p>
          </div>
        </div>
      </CollapsibleSidebar>
    </div>
  );
};

export default UploadBillsPage;
