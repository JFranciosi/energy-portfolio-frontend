import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Activity, Settings, Monitor, FileText, BarChart2, Award, Check, MapPin, Mail, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const isMobile = useIsMobile();

  // Lista servizi per la sezione Servizi e FAQ
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
    {
      id: 'engineering',
      title: 'ENGINEERING',
      icon: Settings,
      features: [
        'Supporto alla realizzazione di interventi di efficienza energetica',
        'Competenze specifiche in refrigerazione industriale (ottimizzazione, free cooling)',
        'Sistemi aria compressa (riduzione perdite, parametri ottimali)',
        'Ottimizzazione centrali termiche (coibentazione, recupero termico)',
        'Analisi processo produttivo con benchmark di mercato',
      ],
    },
    {
      id: 'oneview',
      title: 'ONEVIEW',
      icon: Monitor,
      features: [
        'Sistema avanzato di Energy Management',
        'Monitoraggio dinamico e personalizzato dei consumi',
        'Integrazione con protocolli moderni (LoRa, OPC-UA, ModBus)',
        'Archivio dati locale e cloud',
        'Confronto prestazionale tra macchinari e simulazione nuove installazioni',
      ],
    },
    {
      id: 'epc',
      title: 'ENERGY PERFORMANCE CONTRACT',
      icon: FileText,
      features: [
        'Garanzia sui risparmi energetici attesi',
        'Possibilità di finanziamento degli interventi',
        'Contratti personalizzati secondo norma 11352',
        "Ripagamento attraverso i flussi di cassa generati dall'efficienza",
      ],
    },
    {
      id: 'portfolio',
      title: 'ENERGY PORTFOLIO',
      icon: BarChart2,
      features: [
        'Ottimizzazione dei contratti di acquisto energia',
        'Analisi preliminare gratuita del profilo consumi',
        'Verifica mensile delle fatture energetiche',
        'Aggiornamenti su normative e mercato energetico',
      ],
    },
    {
      id: 'iso',
      title: 'ISO 50001',
      icon: Award,
      features: [
        'Implementazione Sistema di Gestione Energia',
        'Integrazione con altri sistemi (ISO 14001, ISO 9001)',
        'Miglioramento continuo dell’efficienza energetica',
        'Valorizzazione dell’immagine aziendale sostenibile',
      ],
    },
    {
      id: 'bianchi',
      title: 'CERTIFICATI BIANCHI',
      icon: Check,
      features: [
        'Contributo economico per interventi di efficienza',
        'Riduzione dei tempi di rientro degli investimenti',
        'Incentivi erogati per 5 anni',
        'Gestione completa delle pratiche tecniche e normative',
      ],
    },
  ];

  // FAQ per la sezione contatti
  const faqs = [
    {
      question: "Quali tipi di aziende possono beneficiare dei vostri servizi?",
      answer:
        "I nostri servizi sono adatti a qualsiasi tipo di azienda, dalle piccole imprese alle grandi società. Offriamo soluzioni personalizzate in base alle dimensioni e alle esigenze specifiche di ogni cliente.",
    },
    {
      question: "Come funziona il processo di implementazione?",
      answer:
        "Il nostro processo di implementazione inizia con una consulenza gratuita per comprendere le tue esigenze. Successivamente, progettiamo una soluzione personalizzata, installiamo i dispositivi necessari e configuriamo il software. Infine, forniamo formazione e supporto continuo.",
    },
    {
      question: "Quanto tempo ci vuole per vedere risultati concreti?",
      answer:
        "La maggior parte dei nostri clienti inizia a vedere risultati già dal primo mese di utilizzo. Tuttavia, i risparmi più significativi si osservano generalmente dopo 3-6 mesi di ottimizzazione continua.",
    },
    {
      question: "Offrite assistenza tecnica continua?",
      answer:
        "Sì, offriamo un servizio di assistenza tecnica continua 24/7. I nostri clienti possono contattarci in qualsiasi momento tramite telefono, email o il portale dedicato.",
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* HERO / HOME */}
      <section className="relative bg-gradient-to-r from-primary to-blue-400 h-[50vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-6 z-10 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Gestione Energetica Intelligente per la Tua Azienda
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Ottimizza i consumi, riduci i costi e l'impatto ambientale con
                le nostre soluzioni avanzate
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Link to="#contact">Contattaci</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <Link to="#services">Scopri i Servizi</Link>
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

      {/* CHI SIAMO */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-primary mb-4">Chi Siamo</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Mies è leader nelle soluzioni di monitoraggio e ottimizzazione
                energetica per aziende di ogni dimensione. Da oltre 15 anni
                aiutiamo le imprese a ridurre i consumi, abbattere i costi e
                rispettare l'ambiente.
              </p>
              <p className="text-lg text-muted-foreground">
                La nostra mission è rendere la gestione energetica semplice,
                efficiente e sostenibile attraverso tecnologie innovative e
                consulenza specializzata.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                <div className="text-4xl text-muted-foreground">
                  Immagine Aziendale
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICHE */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-6">
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
                  <p className="text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIZI */}
      <section id="services" className={cn('space-y-8 mt-5', !isMobile && 'ml-5')}>
        <h2 className="text-3xl font-bold text-primary mb-6">I Nostri Servizi</h2>

        {/* Cards servizi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="flex flex-col h-full border-l-4 border-l-primary hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 p-2 rounded-lg mb-3">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-primary">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 list-disc pl-5">
                  {service.features.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>
                  Maggiori informazioni
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 space-y-6">
          <h3 className="text-2xl font-bold text-primary">Domande Frequenti</h3>
          <Tabs defaultValue="diagnosi" className="w-full">
            <TabsList className="flex flex-wrap mb-6 overflow-x-auto">
              {services.map((service) => (
                <TabsTrigger
                  key={service.id}
                  value={service.id}
                  className="text-xs md:text-sm whitespace-nowrap flex-shrink-0"
                >
                  {service.title.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {services.map((service) => (
              <TabsContent
                key={service.id}
                value={service.id}
                className="p-4 border rounded-md mt-4"
              >
                <h4 className="font-bold text-lg mb-4">FAQ - {service.title}</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h5 className="font-medium">
                      Quali sono i vantaggi principali di {service.title}?
                    </h5>
                    <p className="text-muted-foreground text-sm">
                      {service.features[0]} Inoltre, forniamo supporto tecnico
                      completo e consulenza personalizzata.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">Come posso richiedere questo servizio?</h5>
                    <p className="text-muted-foreground text-sm">
                      Puoi contattarci direttamente attraverso il form nella pagina
                      contatti o chiamare il nostro numero dedicato.
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CONTATTI */}
      <section
        id="contact"
        className="container mx-auto py-8 px-4 max-w-7xl"
      >
        <h2 className="text-3xl font-bold text-primary mb-2">Contattaci</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Siamo qui per rispondere a tutte le tue domande
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form contatti */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Invia un messaggio</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Il tuo nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="La tua email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Azienda</Label>
                  <Input id="company" placeholder="Nome azienda" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Messaggio</Label>
                  <Textarea
                    id="message"
                    placeholder="Come possiamo aiutarti?"
                    className="min-h-[150px]"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Invia messaggio
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Mappa & Info */}
          <div className="space-y-8">
            <Card className="overflow-hidden shadow-md h-[300px]">
              <div className="h-full bg-muted flex items-center justify-center">
                <div className="text-xl text-muted-foreground">
                  Mappa interattiva
                </div>
              </div>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Informazioni di contatto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold">Indirizzo</h3>
                      <p className="text-muted-foreground">
                        Via Energia 123, 20100 Milano
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-muted-foreground">info@energymon.it</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold">Telefono</h3>
                      <p className="text-muted-foreground">+39 02 1234567</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold text-primary mb-6">Domande Frequenti</h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </section>

      {/* CTA FINALE */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-400 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto a iniziare?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contattaci oggi stesso per una consulenza gratuita e scopri come possiamo
            aiutare la tua azienda a ottimizzare i consumi energetici.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link to="/auth" className="flex items-center gap-2">
              Registrati ora <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-sidebar py-12 text-sidebar-foreground">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Mies</h3>
              <p className="mb-4">
                Soluzioni avanzate per il monitoraggio e l'ottimizzazione
                energetica aziendale.
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
                  <Link to="#services" className="hover:underline">
                    Servizi
                  </Link>
                </li>
                <li>
                  <Link to="#contact" className="hover:underline">
                    Contatti
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="hover:underline">
                    Area Clienti
                  </Link>
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
