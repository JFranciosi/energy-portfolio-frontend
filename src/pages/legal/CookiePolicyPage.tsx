
import React, { useRef } from 'react';
import { ArrowUp, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LegalFooter } from '@/components/legal/LegalFooter';

const CookiePolicyPage = () => {
  const topRef = useRef<HTMLDivElement>(null);
  const currentDate = "15 Maggio 2024"; // Last update date
  
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const cookieTypes = [
    {
      category: "Necessari",
      description: "Cookie strettamente necessari per il funzionamento del sito",
      examples: [
        { name: "session", provider: "energyportfolio.it", purpose: "Mantiene la sessione dell'utente", duration: "Session" },
        { name: "csrf_token", provider: "energyportfolio.it", purpose: "Protezione contro attacchi CSRF", duration: "Session" },
      ]
    },
    {
      category: "Funzionali",
      description: "Cookie che consentono funzionalità specifiche come il salvataggio delle preferenze",
      examples: [
        { name: "language", provider: "energyportfolio.it", purpose: "Salva le preferenze di lingua", duration: "1 anno" },
        { name: "ui_settings", provider: "energyportfolio.it", purpose: "Memorizza le impostazioni dell'interfaccia", duration: "1 anno" },
      ]
    },
    {
      category: "Analitici",
      description: "Cookie che raccolgono informazioni su come utilizzi il sito web",
      examples: [
        { name: "_ga", provider: "Google", purpose: "Statistiche di utilizzo del sito", duration: "2 anni" },
        { name: "_gid", provider: "Google", purpose: "Distinzione degli utenti", duration: "24 ore" },
      ]
    },
    {
      category: "Marketing",
      description: "Cookie utilizzati per mostrare annunci pertinenti e coinvolgenti",
      examples: [
        { name: "_fbp", provider: "Facebook", purpose: "Tracciamento per annunci Facebook", duration: "3 mesi" },
        { name: "ads/ga-audiences", provider: "Google", purpose: "Remarketing Google Ads", duration: "Variabile" },
      ]
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col" ref={topRef}>
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8 print:mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Cookie Policy</h1>
              <p className="text-muted-foreground">
                Ultimo aggiornamento: {currentDate}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Versione stampabile
              </Button>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary mb-4">Cosa sono i cookie?</h2>
                <p className="mb-4">
                  I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo durante la navigazione. 
                  Servono a diverse funzioni, come ricordare le tue preferenze, analizzare come utilizzi il sito o 
                  personalizzare i contenuti e gli annunci pubblicitari.
                </p>
                <p>
                  Questa Cookie Policy spiega come Energy Portfolio utilizza i cookie e tecnologie simili, quali dati 
                  vengono raccolti e come puoi controllare il loro utilizzo.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary mb-4">Come utilizziamo i cookie</h2>
                <p className="mb-4">
                  Utilizziamo diversi tipi di cookie per vari scopi:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Garantire il corretto funzionamento del sito web</li>
                  <li>Salvare le tue preferenze e migliorare la tua esperienza di navigazione</li>
                  <li>Analizzare come gli utenti utilizzano il nostro sito per migliorarlo</li>
                  <li>Con il tuo consenso, fornire contenuti e annunci pubblicitari personalizzati</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary mb-4">Tipi di cookie che utilizziamo</h2>
                
                {cookieTypes.map((type, index) => (
                  <div key={type.category} className="mb-8">
                    <h3 className="text-lg font-medium text-primary mb-3">Cookie {type.category}</h3>
                    <p className="mb-4">{type.description}</p>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Fornitore</TableHead>
                            <TableHead>Scopo</TableHead>
                            <TableHead>Durata</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {type.examples.map((cookie) => (
                            <TableRow key={cookie.name}>
                              <TableCell className="font-medium">{cookie.name}</TableCell>
                              <TableCell>{cookie.provider}</TableCell>
                              <TableCell>{cookie.purpose}</TableCell>
                              <TableCell>{cookie.duration}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </section>
              
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary mb-4">Come gestire i cookie</h2>
                <p className="mb-4">
                  Puoi gestire le tue preferenze sui cookie in diversi modi:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>
                    <strong>Attraverso il nostro banner cookie:</strong> Quando visiti il nostro sito, ti viene presentato un banner che 
                    ti permette di accettare tutti i cookie, rifiutare quelli non essenziali o personalizzare le tue preferenze.
                  </li>
                  <li>
                    <strong>Attraverso il tuo browser:</strong> Puoi modificare le impostazioni del browser per bloccare o limitare i 
                    cookie. Di seguito trovi i link alle istruzioni per i browser più comuni:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                      <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                      <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                      <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                    </ul>
                  </li>
                </ul>
                <p className="mb-4">
                  Tieni presente che alcune parti del nostro sito potrebbero non funzionare correttamente se disabiliti tutti i cookie.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary mb-4">Cookie di terze parti</h2>
                <p className="mb-4">
                  Alcuni cookie presenti sul nostro sito sono gestiti da terze parti, come Google Analytics, che ci aiutano a 
                  capire come gli utenti interagiscono con il nostro sito.
                </p>
                <p>
                  Queste terze parti potrebbero utilizzare i cookie per raccogliere informazioni sulle tue attività online nel 
                  tempo e su diversi siti web. Per maggiori informazioni su come queste terze parti utilizzano le informazioni, 
                  ti consigliamo di consultare le loro politiche sulla privacy.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-primary mb-4">Modifiche alla Cookie Policy</h2>
                <p className="mb-4">
                  Ci riserviamo il diritto di modificare questa Cookie Policy in qualsiasi momento. Eventuali modifiche saranno 
                  pubblicate su questa pagina con la data di aggiornamento.
                </p>
                <p>
                  Ti invitiamo a consultare regolarmente questa pagina per rimanere informato sui cookie che utilizziamo e su 
                  come li gestiamo.
                </p>
              </section>
              
              <section className="mb-4">
                <h2 className="text-xl font-semibold text-primary mb-4">Contattaci</h2>
                <p>
                  Se hai domande o dubbi riguardo ai cookie o a questa Cookie Policy, non esitare a contattarci:
                </p>
                <address className="mt-3 not-italic">
                  <p><strong>Email:</strong> <a href="mailto:privacy@energyportfolio.it" className="text-primary hover:underline">privacy@energyportfolio.it</a></p>
                  <p><strong>Telefono:</strong> +39 02 1234567</p>
                  <p><strong>Indirizzo:</strong> Energy Solutions S.p.A., Via Energia 123, 20123 Milano (MI), Italia</p>
                </address>
              </section>
            </CardContent>
          </Card>
          
          <div className="mt-4 mb-8 text-center print:hidden">
            <Button variant="outline" size="sm" onClick={scrollToTop}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Torna all'inizio
            </Button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CookiePolicyPage;
