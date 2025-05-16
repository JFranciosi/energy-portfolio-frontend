
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Settings, Monitor, FileText, BarChart2, Award, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const ServicesPage = () => {
  const services = [
    {
      id: 'diagnosi',
      title: 'DIAGNOSI ENERGETICA',
      description: 'Mappatura completa dei consumi energetici aziendali',
      icon: Activity,
      features: [
        'Mappatura completa dei consumi energetici aziendali',
        'Individuazione e quantificazione delle opportunità di risparmio',
        'Conformità alla Direttiva Europea 2012/27/UE (D.lgs 102/2014)',
        'Strumenti: soluzioni ad alta efficienza, ottimizzazione gestionale, monitoraggio consumi, ISO 50001'
      ]
    },
    {
      id: 'engineering',
      title: 'ENGINEERING',
      description: 'Supporto alla realizzazione di interventi di efficienza energetica',
      icon: Settings,
      features: [
        'Supporto alla realizzazione di interventi di efficienza energetica',
        'Competenze specifiche in refrigerazione industriale (ottimizzazione, free cooling)',
        'Sistemi aria compressa (riduzione perdite, parametri ottimali)',
        'Ottimizzazione centrali termiche (coibentazione, recupero termico)',
        'Analisi processo produttivo con benchmark di mercato'
      ]
    },
    {
      id: 'oneview',
      title: 'ONEVIEW',
      description: 'Sistema avanzato di Energy Management',
      icon: Monitor,
      features: [
        'Sistema avanzato di Energy Management',
        'Monitoraggio dinamico e personalizzato dei consumi',
        'Integrazione con protocolli moderni (LoRa, OPC-UA, ModBus)',
        'Archivio dati locale e cloud',
        'Confronto prestazionale tra macchinari e simulazione nuove installazioni'
      ]
    },
    {
      id: 'epc',
      title: 'ENERGY PERFORMANCE CONTRACT',
      description: 'Garanzia sui risparmi energetici attesi',
      icon: FileText,
      features: [
        'Garanzia sui risparmi energetici attesi',
        'Possibilità di finanziamento degli interventi',
        'Contratti personalizzati secondo norma 11352',
        'Ripagamento attraverso i flussi di cassa generati dall\'efficienza'
      ]
    },
    {
      id: 'portfolio',
      title: 'ENERGY PORTFOLIO',
      description: 'Ottimizzazione dei contratti di acquisto energia',
      icon: BarChart2,
      features: [
        'Ottimizzazione dei contratti di acquisto energia',
        'Analisi preliminare gratuita del profilo consumi',
        'Verifica mensile delle fatture energetiche',
        'Aggiornamenti su normative e mercato energetico'
      ]
    },
    {
      id: 'iso',
      title: 'ISO 50001',
      description: 'Implementazione Sistema di Gestione Energia',
      icon: Award,
      features: [
        'Implementazione Sistema di Gestione Energia',
        'Integrazione con altri sistemi (ISO 14001, ISO 9001)',
        'Miglioramento continuo dell\'efficienza energetica',
        'Valorizzazione dell\'immagine aziendale sostenibile'
      ]
    },
    {
      id: 'bianchi',
      title: 'CERTIFICATI BIANCHI',
      description: 'Contributo economico per interventi di efficienza',
      icon: Check,
      features: [
        'Contributo economico per interventi di efficienza',
        'Riduzione dei tempi di rientro degli investimenti',
        'Incentivi erogati per 5 anni',
        'Gestione completa delle pratiche tecniche e normative'
      ]
    }
  ];
  
  const isMobile = useIsMobile();

  return (
    <div className={cn("space-y-8", !isMobile && "ml-5")}>
      {/* Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="flex flex-col h-full border-l-4 border-l-primary hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="bg-primary/10 p-2 rounded-lg mb-3">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-primary">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2 list-disc pl-5">
                {service.features.map((feature, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Maggiori informazioni
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Section - Improved responsive layout */}
      <div className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold text-primary">Domande Frequenti</h2>
        <Tabs defaultValue="diagnosi" className="w-full">
          <TabsList className="flex flex-wrap mb-6 overflow-x-auto">
            {services.map(service => (
              <TabsTrigger 
                key={service.id} 
                value={service.id} 
                className="text-xs md:text-sm whitespace-nowrap flex-shrink-0"
              >
                {service.title.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {services.map(service => (
            <TabsContent key={service.id} value={service.id} className="p-4 border rounded-md mt-4">
              <h3 className="font-bold text-lg mb-4">FAQ - {service.title}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Quali sono i vantaggi principali di {service.title}?</h4>
                  <p className="text-muted-foreground text-sm">
                    {service.features[0]} Inoltre, forniamo supporto tecnico completo e consulenza personalizzata.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Come posso richiedere questo servizio?</h4>
                  <p className="text-muted-foreground text-sm">
                    Puoi contattarci direttamente attraverso il form nella pagina contatti o chiamare il nostro numero dedicato.
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="mt-12">
        <Card className="bg-primary text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Richiedi una consulenza gratuita</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              I nostri esperti sono a tua disposizione per aiutarti a trovare la soluzione più adatta alle tue esigenze energetiche.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-white text-primary hover:bg-white/90">
                Contattaci ora
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Scopri di più
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicesPage;
