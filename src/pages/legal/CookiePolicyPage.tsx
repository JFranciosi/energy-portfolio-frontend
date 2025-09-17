import React, { useRef } from 'react';
import { ArrowUp, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SidebarMenu from "@/components/layout/SidebarMenu";

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
      <SidebarMenu /> 
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 print:mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Cookie Policy</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
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
          
          {/* Card contenuto */}
          <Card className="mb-8">
            <CardContent className="p-4 sm:p-6">
              <section className="mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">Cosa sono i cookie?</h2>
                <p className="mb-4 text-sm sm:text-base">
                  I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo durante la navigazione. 
                  Servono a diverse funzioni, come ricordare le tue preferenze, analizzare come utilizzi il sito o 
                  personalizzare i contenuti e gli annunci pubblicitari.
                </p>
                <p className="text-sm sm:text-base">
                  Questa Cookie Policy spiega come Energy Portfolio utilizza i cookie e tecnologie simili, quali dati 
                  vengono raccolti e come puoi controllare il loro utilizzo.
                </p>
              </section>
              
              {/* Sezioni dinamiche */}
              {cookieTypes.map((type) => (
                <section key={type.category} className="mb-8">
                  <h3 className="text-base sm:text-lg font-medium text-primary mb-3">Cookie {type.category}</h3>
                  <p className="mb-4 text-sm sm:text-base">{type.description}</p>
                  
                  {/* Tabella responsive */}
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
                </section>
              ))}
              
              <section className="mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">Contattaci</h2>
                <p className="text-sm sm:text-base">
                  Se hai domande o dubbi riguardo ai cookie o a questa Cookie Policy, non esitare a contattarci:
                </p>
                <address className="mt-3 not-italic text-sm sm:text-base">
                  <p><strong>Email:</strong> <a href="mailto:privacy@energyportfolio.it" className="text-primary hover:underline">privacy@energyportfolio.it</a></p>
                  <p><strong>Telefono:</strong> +39 02 1234567</p>
                  <p><strong>Indirizzo:</strong> Energy Solutions S.p.A., Via Energia 123, 20123 Milano (MI), Italia</p>
                </address>
              </section>
            </CardContent>
          </Card>
          
          {/* Torna su */}
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
