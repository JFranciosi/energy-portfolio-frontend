
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PortfolioCard, PortfolioCardAction } from '@/components/energy-portfolio/PortfolioCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ArrowRight, Upload, LineChart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const EnergyPortfolioPage = () => {
  const navigate = useNavigate();
  
  const recentStats = {
    lastBill: {
      date: '15 maggio 2025',
      amount: '1.254,30€',
      consumption: '3.450 kWh'
    },
    lastMonth: {
      consumption: '10.780 kWh',
      cost: '3.245,20€'
    },
    trend: {
      percentage: -8.5,
      description: 'rispetto al mese precedente'
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-primary mb-2">Energy Portfolio</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Gestisci, monitora e analizza il consumo energetico della tua azienda
      </p>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PortfolioCard
          icon={Upload}
          title="Inserimento Bollette"
          description="Carica e gestisci le tue bollette energetiche per una visione completa dei tuoi consumi."
          onClick={() => navigate('/energy-portfolio/upload')}
          footerContent={
            <PortfolioCardAction>
              Inserisci bollette <ArrowRight className="ml-2 h-4 w-4" />
            </PortfolioCardAction>
          }
          className="bg-gradient-to-br from-white to-blue-50 dark:from-card dark:to-blue-950/10"
        />

        <PortfolioCard
          icon={BarChart3}
          title="Dashboard"
          description="Visualizza grafici dettagliati e analisi dei tuoi consumi energetici nel tempo."
          onClick={() => navigate('/energy-portfolio/dashboard')}
          footerContent={
            <PortfolioCardAction>
              Visualizza dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </PortfolioCardAction>
          }
          className="bg-gradient-to-br from-white to-blue-50 dark:from-card dark:to-blue-950/10"
        />

        <PortfolioCard
          icon={TrendingUp}
          title="Futures"
          description="Esplora previsioni e scenari futuri per ottimizzare la tua strategia energetica."
          onClick={() => navigate('/energy-portfolio/futures')}
          footerContent={
            <PortfolioCardAction>
              Esplora previsioni <ArrowRight className="ml-2 h-4 w-4" />
            </PortfolioCardAction>
          }
          className="bg-gradient-to-br from-white to-blue-50 dark:from-card dark:to-blue-950/10"
        />

        <PortfolioCard
          icon={BarChart3}
          title="Budget"
          description="Visualizza grafici dettagliati e analisi dei tuoi consumi energetici nel tempo."
          onClick={() => navigate('/budget')}
          footerContent={
            <PortfolioCardAction>
              Budget <ArrowRight className="ml-2 h-4 w-4" />
            </PortfolioCardAction>
          }
          className="bg-gradient-to-br from-white to-blue-50 dark:from-card dark:to-blue-950/10"
        />
      </div>
    </div>
  );
};

export default EnergyPortfolioPage;
