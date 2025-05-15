
import React, { useState } from 'react';
import { SecondaryNavbar } from '@/components/energy-portfolio/SecondaryNavbar';
import { DataFilters } from '@/components/energy-portfolio/DataFilters';
import { NotesSection } from '@/components/energy-portfolio/NotesSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

const FuturesPage = () => {
  const [activeTab, setActiveTab] = useState('consumptionPrediction');
  const [confidenceLevel, setConfidenceLevel] = useState([80]);
  const [seasonality, setSeasonality] = useState([50]);

  const futureTabs = [
    { id: 'consumptionPrediction', label: 'Previsione Consumi' },
    { id: 'costPrediction', label: 'Previsione Costi' },
    { id: 'scenarios', label: 'Scenari "What If"' },
    { id: 'optimization', label: 'Ottimizzazione' },
  ];

  // Mock data for predictive charts
  const consumptionPredictionData = [
    // Historical data
    { month: 'Gen', actual: 2400, predicted: null, lowerBound: null, upperBound: null },
    { month: 'Feb', actual: 1398, predicted: null, lowerBound: null, upperBound: null },
    { month: 'Mar', actual: 2800, predicted: null, lowerBound: null, upperBound: null },
    { month: 'Apr', actual: 3908, predicted: null, lowerBound: null, upperBound: null },
    { month: 'Mag', actual: 4800, predicted: null, lowerBound: null, upperBound: null },
    // Predicted data
    { month: 'Giu', actual: null, predicted: 3800, lowerBound: 3500, upperBound: 4100 },
    { month: 'Lug', actual: null, predicted: 4300, lowerBound: 3900, upperBound: 4700 },
    { month: 'Ago', actual: null, predicted: 4500, lowerBound: 4000, upperBound: 5000 },
    { month: 'Set', actual: null, predicted: 4200, lowerBound: 3700, upperBound: 4700 },
    { month: 'Ott', actual: null, predicted: 3800, lowerBound: 3300, upperBound: 4300 },
    { month: 'Nov', actual: null, predicted: 3200, lowerBound: 2800, upperBound: 3600 },
    { month: 'Dic', actual: null, predicted: 2900, lowerBound: 2500, upperBound: 3300 },
  ];

  const costPredictionData = [
    // Historical data
    { month: 'Gen', actual: 1240, predicted: null, lowerBound: null, upperBound: null },
    { month: 'Feb', actual: 898, predicted: null, lowerBound: null, upperBound: null },
    { month: 'Mar', actual: 1400, predicted: null, lowerBound: null, upperBound: null },
    { month: 'Apr', actual: 1908, predicted: null, lowerBound: null, upperBound: null },
    { month: 'Mag', actual: 2200, predicted: null, lowerBound: null, upperBound: null },
    // Predicted data
    { month: 'Giu', actual: null, predicted: 1800, lowerBound: 1650, upperBound: 1950 },
    { month: 'Lug', actual: null, predicted: 2100, lowerBound: 1900, upperBound: 2300 },
    { month: 'Ago', actual: null, predicted: 2200, lowerBound: 1980, upperBound: 2420 },
    { month: 'Set', actual: null, predicted: 2000, lowerBound: 1800, upperBound: 2200 },
    { month: 'Ott', actual: null, predicted: 1800, lowerBound: 1620, upperBound: 1980 },
    { month: 'Nov', actual: null, predicted: 1600, lowerBound: 1440, upperBound: 1760 },
    { month: 'Dic', actual: null, predicted: 1400, lowerBound: 1260, upperBound: 1540 },
  ];

  const scenarioData = [
    { month: 'Giu', baseline: 3800, scenario1: 3600, scenario2: 3400 },
    { month: 'Lug', baseline: 4300, scenario1: 4000, scenario2: 3800 },
    { month: 'Ago', baseline: 4500, scenario1: 4200, scenario2: 3900 },
    { month: 'Set', baseline: 4200, scenario1: 3900, scenario2: 3700 },
    { month: 'Ott', baseline: 3800, scenario1: 3500, scenario2: 3300 },
    { month: 'Nov', baseline: 3200, scenario1: 3000, scenario2: 2800 },
    { month: 'Dic', baseline: 2900, scenario1: 2700, scenario2: 2500 },
  ];

  const optimizationData = [
    { hour: '00:00', current: 120, optimized: 80 },
    { hour: '02:00', current: 90, optimized: 70 },
    { hour: '04:00', current: 80, optimized: 60 },
    { hour: '06:00', current: 150, optimized: 100 },
    { hour: '08:00', current: 210, optimized: 180 },
    { hour: '10:00', current: 240, optimized: 200 },
    { hour: '12:00', current: 230, optimized: 190 },
    { hour: '14:00', current: 220, optimized: 180 },
    { hour: '16:00', current: 210, optimized: 170 },
    { hour: '18:00', current: 190, optimized: 150 },
    { hour: '20:00', current: 170, optimized: 130 },
    { hour: '22:00', current: 140, optimized: 100 },
  ];

  const renderChart = () => {
    switch (activeTab) {
      case 'consumptionPrediction':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={consumptionPredictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <ReferenceLine x="Mag" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" label={{ value: 'Oggi', position: 'top' }} />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#0ea5e9" 
                strokeWidth={2} 
                dot={{ stroke: '#0ea5e9', strokeWidth: 2, r: 4, fill: '#fff' }} 
                name="Consumi effettivi"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#2563eb" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4, fill: '#fff' }} 
                name="Previsione"
              />
              <Area 
                type="monotone" 
                dataKey="upperBound" 
                stroke="transparent" 
                fill="#2563eb" 
                fillOpacity={0.1}
                name="Limite superiore" 
              />
              <Area 
                type="monotone" 
                dataKey="lowerBound" 
                stroke="transparent" 
                fill="#2563eb" 
                fillOpacity={0.1}
                name="Limite inferiore"
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'costPrediction':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={costPredictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <ReferenceLine x="Mag" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" label={{ value: 'Oggi', position: 'top' }} />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#0ea5e9" 
                strokeWidth={2} 
                dot={{ stroke: '#0ea5e9', strokeWidth: 2, r: 4, fill: '#fff' }} 
                name="Costi effettivi"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#2563eb" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4, fill: '#fff' }} 
                name="Previsione"
              />
              <Area 
                type="monotone" 
                dataKey="upperBound" 
                stroke="transparent" 
                fill="#2563eb" 
                fillOpacity={0.1}
                name="Limite superiore" 
              />
              <Area 
                type="monotone" 
                dataKey="lowerBound" 
                stroke="transparent" 
                fill="#2563eb" 
                fillOpacity={0.1}
                name="Limite inferiore"
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'scenarios':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={scenarioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                stroke="#64748b" 
                strokeWidth={2} 
                dot={{ stroke: '#64748b', strokeWidth: 2, r: 4, fill: '#fff' }} 
                name="Scenario Baseline"
              />
              <Line 
                type="monotone" 
                dataKey="scenario1" 
                stroke="#0ea5e9" 
                strokeWidth={2} 
                dot={{ stroke: '#0ea5e9', strokeWidth: 2, r: 4, fill: '#fff' }} 
                name="Scenario -5% Consumi"
              />
              <Line 
                type="monotone" 
                dataKey="scenario2" 
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4, fill: '#fff' }} 
                name="Scenario -10% Consumi"
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'optimization':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={optimizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="current" 
                stackId="1" 
                stroke="#94a3b8" 
                fill="#94a3b8" 
                name="Consumo attuale"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="optimized" 
                stackId="2" 
                stroke="#2563eb" 
                fill="#2563eb" 
                name="Consumo ottimizzato"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  const getPredictionControls = () => {
    if (activeTab === 'consumptionPrediction' || activeTab === 'costPrediction') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Livello di confidenza</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={confidenceLevel}
                onValueChange={setConfidenceLevel}
                min={50}
                max={95}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>50%</span>
                <span className="font-medium text-primary">{confidenceLevel}%</span>
                <span>95%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Peso stagionalità</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={seasonality}
                onValueChange={setSeasonality}
                min={0}
                max={100}
                step={10}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Basso</span>
                <span className="font-medium text-primary">{seasonality}%</span>
                <span>Alto</span>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Previsioni Future</h1>
      <p className="text-lg text-muted-foreground mb-4">
        Analizza le proiezioni future dei tuoi consumi energetici
      </p>
      
      {/* Secondary Navbar */}
      <SecondaryNavbar 
        items={futureTabs}
        activeItemId={activeTab}
        onItemClick={setActiveTab}
      />
      
      {/* Filters */}
      <DataFilters 
        className="mb-6" 
        onExport={() => console.log('Exporting data...')}
      />
      
      {/* Prediction Controls */}
      {getPredictionControls()}
      
      {/* Chart Area */}
      <Card className="mb-6 p-6">
        {renderChart()}
      </Card>
      
      {/* Notes */}
      <NotesSection title="Note sulle previsioni" defaultOpen>
        <p>
          Le previsioni sono generate utilizzando algoritmi di machine learning addestrati 
          sui dati storici dei consumi. L'accuratezza delle previsioni dipende dalla qualità 
          e dalla quantità dei dati storici disponibili. 
        </p>
        <p className="mt-2">
          Il livello di confidenza determina l'ampiezza dell'intervallo di confidenza (area in azzurro).
          Un valore più alto indica una maggiore certezza nella previsione, ma un intervallo più ampio.
        </p>
      </NotesSection>
    </div>
  );
};

export default FuturesPage;
