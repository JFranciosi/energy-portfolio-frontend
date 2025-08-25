import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import {
  Activity,
  Settings,
  Monitor,
  FileText,
  BarChart2,
  Award,
  Check,
  ArrowRight,
} from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      id: 'diagnosi',
      title: 'DIAGNOSI ENERGETICA',
      icon: Activity,
      description: 'Analisi approfondita per identificare le opportunità di risparmio energetico',
      features: [
        'Mappatura completa dei consumi energetici aziendali',
        'Individuazione e quantificazione delle opportunità di risparmio',
        'Conformità alla Direttiva Europea 2012/27/UE (D.lgs 102/2014)',
        'Strumenti: soluzioni ad alta efficienza, ottimizzazione gestionale, monitoraggio consumi, ISO 50001',
      ],
      benefits: [
        'Riduzione costi energetici fino al 30%',
        'Identificazione immediata degli sprechi',
        'Report dettagliato con piano di interventi',
        'Conformità normativa garantita',
      ],
    },
    {
      id: 'engineering',
      title: 'ENGINEERING',
      icon: Settings,
      description: 'Progettazione e implementazione di soluzioni di efficienza energetica',
      features: [
        'Supporto alla realizzazione di interventi di efficienza energetica',
        'Competenze specifiche in refrigerazione industriale (ottimizzazione, free cooling)',
        'Sistemi aria compressa (riduzione perdite, parametri ottimali)',
        'Ottimizzazione centrali termiche (coibentazione, recupero termico)',
        'Analisi processo produttivo con benchmark di mercato',
      ],
      benefits: [
        'Soluzioni tecniche innovative',
        'Ottimizzazione impianti esistenti',
        'Riduzione consumi del 25-40%',
        'ROI garantito entro 2-3 anni',
      ],
    },
    {
      id: 'oneview',
      title: 'ONEVIEW PLATFORM',
      icon: Monitor,
      description: 'Sistema avanzato di monitoraggio energetico in tempo reale',
      features: [
        'Sistema avanzato di Energy Management',
        'Monitoraggio dinamico e personalizzato dei consumi',
        'Integrazione con protocolli moderni (LoRa, OPC-UA, ModBus)',
        'Archivio dati locale e cloud',
        'Confronto prestazionale tra macchinari e simulazione nuove installazioni',
      ],
      benefits: [
        'Controllo in tempo reale 24/7',
        'Dashboard personalizzabili',
        'Allarmi automatici su anomalie',
        'Reportistica avanzata',
      ],
    },
    {
      id: 'performance',
      title: 'PERFORMANCE CONTRACT',
      icon: FileText,
      description: 'Contratti con garanzia sui risparmi energetici',
      features: [
        'Garanzia sui risparmi energetici attesi',
        'Possibilità di finanziamento degli interventi',
        'Contratti personalizzati secondo norma 11352',
        'Ripagamento attraverso i flussi di cassa generati dalla efficienza',
      ],
      benefits: [
        'Nessun investimento iniziale',
        'Risparmi garantiti contrattualmente',
        'Gestione completa del progetto',
        'Riduzione del rischio tecnico',
      ],
    },
    {
      id: 'portfolio',
      title: 'ENERGY PORTFOLIO',
      icon: BarChart2,
      description: 'Ottimizzazione dei contratti di fornitura energetica',
      features: [
        'Ottimizzazione dei contratti di acquisto energia',
        'Analisi preliminare gratuita del profilo consumi',
        'Verifica mensile delle fatture energetiche',
        'Aggiornamenti su normative e mercato energetico',
      ],
      benefits: [
        'Riduzione costi di approvvigionamento',
        'Contratti ottimizzati su misura',
        'Monitoraggio continuo mercato',
        'Consulenza normativa inclusa',
      ],
    },
    {
      id: 'iso',
      title: 'ISO 50001',
      icon: Award,
      description: 'Certificazione del Sistema di Gestione Energia',
      features: [
        'Implementazione Sistema di Gestione Energia',
        'Integrazione con altri sistemi (ISO 14001, ISO 9001)',
        'Miglioramento continuo della efficienza energetica',
        'Valorizzazione della immagine aziendale sostenibile',
      ],
      benefits: [
        'Certificazione internazionale',
        'Miglioramento continuo garantito',
        'Vantaggio competitivo',
        'Accesso a incentivi dedicati',
      ],
    },
    {
      id: 'bianchi',
      title: 'CERTIFICATI BIANCHI',
      icon: Check,
      description: 'Gestione completa degli incentivi per la efficienza energetica',
      features: [
        'Contributo economico per interventi di efficienza',
        'Riduzione dei tempi di rientro degli investimenti',
        'Incentivi erogati per 5 anni',
        'Gestione completa delle pratiche tecniche e normative',
      ],
      benefits: [
        'Contributi fino al 50% del costo',
        'Pratiche gestite interamente da noi',
        'Tempi di rientro ridotti',
        'Supporto normativo completo',
      ],
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-400 py-16 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">I Nostri Servizi</h1>
            <p className="text-xl text-white/90 mb-8">
              Soluzioni complete per la efficienza energetica aziendale. 
              Dalla diagnosi al monitoraggio, dalla progettazione agli incentivi.
            </p>
          </div>
        </div>
      </section>

      {/* I Nostri Servizzi */}
      <section className="container mx-auto px-6 py-16">
        <Tabs defaultValue="diagnosi" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-8 h-auto">
            {services.map((service) => (
              <TabsTrigger
                key={service.id}
                value={service.id}
                className="text-xs whitespace-nowrap px-2 py-3"
              >
                {service.title.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {services.map((service) => (
            <TabsContent key={service.id} value={service.id} className="mt-8">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <service.icon className="h-10 w-10 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">{service.title}</CardTitle>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-lg mb-4 text-primary">Caratteristiche del Servizio</h4>
                      <ul className="space-y-3">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-4 text-primary">Benefici per la Tua Azienda</h4>
                      <ul className="space-y-3">
                        {service.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start">
                            <ArrowRight className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button asChild className="flex-1">
                    <Link to="/contact">Richiedi preventivo</Link>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Scarica brochure
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
};

export default ServicesPage;
