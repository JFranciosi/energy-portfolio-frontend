import React, { useState } from 'react';
import { SecondaryNavbar } from '@/components/energy-portfolio/SecondaryNavbar';
import { DataFilters } from '@/components/energy-portfolio/DataFilters';
import { NotesSection } from '@/components/energy-portfolio/NotesSection';
import { Card } from '@/components/ui/card';
import { AreaChart, BarChart, LineChart, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Line, Bar, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('consumption');

  const dashboardTabs = [
    { id: 'consumption', label: 'Consumi' },
    { id: 'costs', label: 'Costi' },
    { id: 'comparison', label: 'Confronto Anni' },
    { id: 'breakdown', label: 'Suddivisione' },
    { id: 'powerbi', label: 'Power BI' },
  ];

  // Mock data for charts
  const consumptionData = [
    { month: 'Gen', value: 2400 },
    { month: 'Feb', value: 1398 },
    { month: 'Mar', value: 2800 },
    { month: 'Apr', value: 3908 },
    { month: 'Mag', value: 4800 },
    { month: 'Giu', value: 3800 },
    { month: 'Lug', value: 4300 },
  ];

  const costsData = [
    { month: 'Gen', value: 1240 },
    { month: 'Feb', value: 898 },
    { month: 'Mar', value: 1400 },
    { month: 'Apr', value: 1908 },
    { month: 'Mag', value: 2200 },
    { month: 'Giu', value: 1800 },
    { month: 'Lug', value: 2100 },
  ];

  const comparisonData = [
    { month: 'Gen', '2024': 4000, '2025': 2400 },
    { month: 'Feb', '2024': 3000, '2025': 1398 },
    { month: 'Mar', '2024': 2000, '2025': 2800 },
    { month: 'Apr', '2024': 2780, '2025': 3908 },
    { month: 'Mag', '2024': 4890, '2025': 4800 },
    { month: 'Giu', '2024': 3390, '2025': 3800 },
    { month: 'Lug', '2024': 3490, '2025': 4300 },
  ];

  const breakdownData = [
    { name: 'Uffici', value: 45 },
    { name: 'Produzione', value: 30 },
    { name: 'Magazzino', value: 15 },
    { name: 'Illuminazione', value: 10 },
  ];

  const renderChart = () => {
    switch (activeTab) {
      case 'consumption':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                fillOpacity={0.2} 
                fill="#2563eb" 
                name="kWh"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'costs':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={costsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4, fill: '#fff' }} 
                name="€"
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="2024" fill="#94a3b8" name="2024" />
              <Bar dataKey="2025" fill="#2563eb" name="2025" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'breakdown':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Tooltip />
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }} height={300}>
                <Pie 
                  data={breakdownData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%"
                  outerRadius={120} 
                  fill="#2563eb"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${210 + index * 15}, 80%, ${60 - index * 5}%)`} />
                  ))}
                </Pie>
              </PieChart>
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'powerbi':
        return (
          <div className="flex items-center justify-center border border-primary/30 rounded-lg h-[400px] bg-gradient-to-br from-white to-blue-50 dark:from-card dark:to-blue-950/10">
            <div className="text-center p-8">
              <h3 className="text-xl font-semibold text-primary mb-2">Power BI Integration</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Questa sezione integra i report di Power BI. 
                Contatta l'amministratore per configurare l'integrazione.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Dynamic notes based on active tab
  const getNotes = () => {
    switch (activeTab) {
      case 'consumption':
        return (
          <NotesSection title="Note sui consumi" defaultOpen>
            <p>
              Il grafico mostra i consumi energetici in kWh per il periodo selezionato. 
              I picchi possono corrispondere a periodi di maggiore attività produttiva o 
              condizioni climatiche estreme che richiedono maggior utilizzo di sistemi HVAC.
            </p>
          </NotesSection>
        );
        
      case 'costs':
        return (
          <NotesSection title="Note sui costi" defaultOpen>
            <p>
              Il grafico rappresenta i costi energetici in Euro per il periodo selezionato.
              I costi non includono IVA e altre imposte. 
              L'andamento può differire dai consumi a causa di variazioni nelle tariffe.
            </p>
          </NotesSection>
        );
        
      case 'comparison':
        return (
          <NotesSection title="Note sul confronto anni" defaultOpen>
            <p>
              Questo grafico confronta i consumi dell'anno corrente con quelli dell'anno precedente.
              Un valore inferiore indica un miglioramento nell'efficienza energetica.
            </p>
          </NotesSection>
        );
        
      case 'breakdown':
        return (
          <NotesSection title="Note sulla suddivisione" defaultOpen>
            <p>
              Il grafico mostra la suddivisione percentuale dei consumi per area funzionale.
              Questa informazione è utile per identificare le aree dove concentrare gli interventi 
              di efficientamento energetico.
            </p>
          </NotesSection>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Energetica</h1>
      <p className="text-lg text-muted-foreground mb-4">
        Visualizza e analizza i tuoi consumi energetici
      </p>
      
      {/* Secondary Navbar */}
      <SecondaryNavbar 
        items={dashboardTabs}
        activeItemId={activeTab}
        onItemClick={setActiveTab}
      />
      
      {/* Filters */}
      <DataFilters 
        className="mb-6" 
        onExport={() => console.log('Exporting data...')}
      />
      
      {/* Chart Area */}
      <Card className="mb-6 p-6">
        {renderChart()}
      </Card>
      
      {/* Notes */}
      {getNotes()}
    </div>
  );
};

export default DashboardPage;
