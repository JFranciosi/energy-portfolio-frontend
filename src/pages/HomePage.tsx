
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-blue-400 h-[50vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-6 z-10 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Gestione Energetica Intelligente per la Tua Azienda
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Ottimizza i consumi, riduci i costi e l'impatto ambientale con le nostre soluzioni avanzate
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link to="/contact">Contattaci</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Link to="/services">Scopri i Servizi</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex">
              <div className="relative w-48 h-48 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5f4bb6f8-1237-4027-8821-15add583dd7d.png" 
                  alt="Mies Logo" 
                  className="w-36 h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chi siamo section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-primary mb-4">Chi Siamo</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Mies è leader nelle soluzioni di monitoraggio e ottimizzazione energetica per aziende di ogni dimensione. Da oltre 15 anni aiutiamo le imprese a ridurre i consumi, abbattere i costi e rispettare l'ambiente.
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

      {/* Statistiche */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">I Nostri Risultati</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '1,500+', label: 'Clienti Soddisfatti' },
              { value: '30%', label: 'Risparmio Energetico Medio' },
              { value: '20M+', label: 'kWh Risparmiati' },
              { value: '15K+', label: 'Tonnellate di CO₂ Evitate' }
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

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-400 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto a iniziare?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contattaci oggi stesso per una consulenza gratuita e scopri come possiamo aiutare la tua azienda a ottimizzare i consumi energetici.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/auth" className="flex items-center gap-2">
              Registrati ora <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar py-12 text-sidebar-foreground">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Mies</h3>
              <p className="mb-4">
                Soluzioni avanzate per il monitoraggio e l'ottimizzazione energetica aziendale.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contatti</h3>
              <address className="not-italic">
                <p className="mb-2">Via Energia 123, 20100 Milano</p>
                <p className="mb-2">info@mies.it</p>
                <p>+39 02 1234567</p>
              </address>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Collegamenti</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/services" className="hover:underline">Servizi</Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:underline">Contatti</Link>
                </li>
                <li>
                  <Link to="/auth" className="hover:underline">Area Clienti</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-sidebar-border text-center">
            <p>&copy; {new Date().getFullYear()} Mies. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
