import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  ArrowRight,
  Activity,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const isMobile = useIsMobile();

  const services = [
    {
      id: 'diagnosi',
      title: 'DIAGNOSI ENERGETICA',
      icon: Activity,
      features: [
        'Mappatura completa dei consumi energetici aziendali',
        'Individuazione e quantificazione delle opportunità di risparmio',
        'Conformità alla Direttiva Europea 2012/27/UE (D.lgs 102/2014)',
        'Strumenti: soluzioni ad alta efficienza, ottimizzazione gestionale, monitoraggio consumi, ISO 50001',
      ],
    },
  ];

  return (
      <div className="max-w-[1920px] w-full mx-auto">
        {/* HERO / HOME */}
        <section className="relative bg-gradient-to-r from-primary to-blue-400 h-[50vh] min-h-[400px] flex items-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="max-w-[1920px] w-full mx-auto px-6 z-10">
          <div className="flex items-center justify-between w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Gestione Energetica Intelligente per la Tua Azienda
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Ottimizza i consumi, riduci i costi e l&apos;impatto ambientale con le nostre soluzioni avanzate
              </p>
            </div>
            <div className="hidden md:flex">
              <div className="relative w-48 h-48 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                <img
                  src="/lovable-uploads/f33dc69c-12e2-4b05-a3eb-b3073381d202.png"
                  alt="Mies Logo"
                  className="w-36 h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* CHI SIAMO */}
        <section className="py-16 bg-background">
          <div className="max-w-[1920px] w-full mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-primary mb-4">Chi Siamo</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Mies è leader nelle soluzioni di monitoraggio e ottimizzazione energetica per aziende di ogni dimensione. Da oltre 15 anni aiutiamo le imprese a ridurre i consumi, abbattere i costi e rispettare l&apos;ambiente.
                </p>
                <p className="text-lg text-muted-foreground">
                  La nostra mission è rendere la gestione energetica semplice, efficiente e sostenibile attraverso tecnologie innovative e consulenza specializzata.
                </p>
              </div>
              <div className="md:w-1/2">
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <div className="text-4xl text-muted-foreground">Immagine Aziendale</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTICHE */}
        <section className="py-16 bg-muted">
          <div className="max-w-[1920px] w-full mx-auto px-6">
            <h2 className="text-3xl font-bold text-primary text-center mb-12">
              I Nostri Risultati
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: '1,500+', label: 'Clienti Soddisfatti' },
                { value: '30%', label: 'Risparmio Energetico Medio' },
                { value: '20M+', label: 'kWh Risparmiati' },
                { value: '15K+', label: 'Tonnellate di CO₂ Evitate' },
              ].map((stat, index) => (
                <Card key={index} className="text-center border-none shadow-md">
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINALE */}
        <section className="py-16 bg-gradient-to-r from-primary to-blue-400 text-white">
          <div className="w-full mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto a iniziare?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Contattaci oggi stesso per una consulenza gratuita e scopri come possiamo aiutare la tua azienda a ottimizzare i consumi energetici.
            </p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/Contact" className="flex items-center gap-2">
                Contattami ora <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </section>
      </div>
  );
};

export default HomePage;
