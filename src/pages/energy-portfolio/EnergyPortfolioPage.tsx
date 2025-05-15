
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PortfolioCard, PortfolioCardAction } from '@/components/energy-portfolio/PortfolioCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ArrowRight, Upload, LineChart, TrendingUp } from 'lucide-react';

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
      </div>

      {/* Recent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Ultima bolletta</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Data</dt>
                <dd className="text-sm font-medium">{recentStats.lastBill.date}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Importo</dt>
                <dd className="text-sm font-medium">{recentStats.lastBill.amount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Consumo</dt>
                <dd className="text-sm font-medium">{recentStats.lastBill.consumption}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Ultimo mese</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Consumo totale</dt>
                <dd className="text-sm font-medium">{recentStats.lastMonth.consumption}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Costo totale</dt>
                <dd className="text-sm font-medium">{recentStats.lastMonth.cost}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <LineChart className="h-10 w-10 text-primary mr-3" />
              <div>
                <div className="flex items-center">
                  <span className={cn(
                    "text-lg font-bold",
                    recentStats.trend.percentage < 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {recentStats.trend.percentage < 0 ? "" : "+"}
                    {recentStats.trend.percentage}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {recentStats.trend.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnergyPortfolioPage;
