
import React, { useRef } from 'react';
import { ArrowUp, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LegalFooter } from '@/components/legal/LegalFooter';

const TermsConditionsPage = () => {
  const topRef = useRef<HTMLDivElement>(null);
  const currentDate = "15 Maggio 2024"; // Last update date
  
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="min-h-screen flex flex-col" ref={topRef}>
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8 print:mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Termini e Condizioni</h1>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 print:hidden">
              <Card className="sticky top-6">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Indice</h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      { id: 'intro', label: 'Introduzione' },
                      { id: 'access', label: 'Accesso al servizio' },
                      { id: 'usage', label: 'Utilizzo del servizio' },
                      { id: 'account', label: 'Account utente' },
                      { id: 'intellectual', label: 'Proprietà intellettuale' },
                      { id: 'limitation', label: 'Limitazioni di responsabilità' },
                      { id: 'termination', label: 'Cessazione' },
                      { id: 'modifications', label: 'Modifiche ai termini' },
                      { id: 'applicable-law', label: 'Legge applicabile' },
                    ].map((section) => (
                      <li key={section.id}>
                        <a 
                          href={`#${section.id}`} 
                          className="block py-1 px-2 rounded hover:bg-primary/5"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {section.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  <section id="intro" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">1. Introduzione</h2>
                    <p className="mb-4">
                      Benvenuto su Energy Portfolio ("Servizio"), una piattaforma di gestione energetica aziendale fornita da 
                      Energy Solutions S.p.A. ("noi", "nostro" o "la Società").
                    </p>
                    <p>
                      I presenti Termini e Condizioni ("Termini") regolano l'utilizzo del nostro Servizio e costituiscono un 
                      accordo legalmente vincolante tra te e la Società. Utilizzando il Servizio, accetti di rispettare questi 
                      Termini. Se non accetti questi Termini, ti preghiamo di non utilizzare il Servizio.
                    </p>
                  </section>
                  
                  <section id="access" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">2. Accesso al servizio</h2>
                    <p className="mb-4">
                      2.1. Il Servizio è rivolto esclusivamente alle aziende e ai professionisti del settore energetico.
                    </p>
                    <p className="mb-4">
                      2.2. Per accedere al Servizio, è necessario creare un account e fornire informazioni accurate e complete. 
                      Sei responsabile del mantenimento della sicurezza del tuo account e della password.
                    </p>
                    <p>
                      2.3. Ci riserviamo il diritto di rifiutare l'accesso al Servizio, terminare gli account, rimuovere 
                      o modificare i contenuti a nostra esclusiva discrezione.
                    </p>
                  </section>
                  
                  <section id="usage" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">3. Utilizzo del servizio</h2>
                    <p className="mb-4">
                      3.1. Il Servizio è concesso in licenza, non venduto. Ti concediamo una licenza limitata, non esclusiva, 
                      non trasferibile e revocabile per utilizzare il Servizio in conformità con questi Termini.
                    </p>
                    <p className="mb-4">
                      3.2. È vietato:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>Utilizzare il Servizio per scopi illegali o non autorizzati</li>
                      <li>Violare qualsiasi legge applicabile nell'utilizzo del Servizio</li>
                      <li>Interferire con la sicurezza o il funzionamento del Servizio</li>
                      <li>Raccogliere dati degli utenti o accedere al Servizio tramite mezzi automatizzati</li>
                      <li>Tentare di accedere a parti del Servizio per cui non si dispone di autorizzazione</li>
                    </ul>
                    <p>
                      3.3. Ci riserviamo il diritto di monitorare l'utilizzo del Servizio per garantire la conformità a questi Termini.
                    </p>
                  </section>
                  
                  <section id="account" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">4. Account utente</h2>
                    <p className="mb-4">
                      4.1. Per utilizzare il Servizio, è necessario creare un account con username e password. Sei responsabile 
                      del mantenimento della riservatezza delle tue credenziali.
                    </p>
                    <p className="mb-4">
                      4.2. Sei l'unico responsabile di tutte le attività che avvengono con il tuo account. Devi informarci 
                      immediatamente di qualsiasi utilizzo non autorizzato del tuo account.
                    </p>
                    <p>
                      4.3. Ci riserviamo il diritto di disabilitare o cancellare il tuo account in qualsiasi momento se riteniamo 
                      che tu abbia violato questi Termini o se la tua condotta possa danneggiare il Servizio o altri utenti.
                    </p>
                  </section>
                  
                  <section id="intellectual" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">5. Proprietà intellettuale</h2>
                    <p className="mb-4">
                      5.1. Il Servizio e tutti i suoi contenuti, funzionalità e funzionalità sono di proprietà della Società, 
                      dei suoi licenzianti o di altri fornitori e sono protetti da leggi sul diritto d'autore, marchi, brevetti, 
                      segreti commerciali e altre proprietà intellettuali o diritti di proprietà.
                    </p>
                    <p className="mb-4">
                      5.2. Non è consentito riprodurre, distribuire, modificare, creare opere derivate, mostrare pubblicamente, 
                      eseguire pubblicamente, ripubblicare, scaricare, archiviare o trasmettere qualsiasi materiale dal nostro Servizio, 
                      tranne come consentito da questi Termini.
                    </p>
                    <p>
                      5.3. Caricando, contribuendo o comunque rendendo disponibile qualsiasi contenuto attraverso il Servizio, 
                      concedi alla Società una licenza mondiale, non esclusiva, gratuita per utilizzare, modificare, eseguire 
                      pubblicamente, visualizzare pubblicamente, riprodurre e distribuire tale contenuto in connessione con 
                      il Servizio e le attività commerciali della Società.
                    </p>
                  </section>
                  
                  <section id="limitation" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">6. Limitazioni di responsabilità</h2>
                    <p className="mb-4">
                      6.1. Il Servizio è fornito "così com'è" e "come disponibile", senza garanzie di alcun tipo, esplicite o implicite.
                    </p>
                    <p className="mb-4">
                      6.2. La Società non garantisce che:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      <li>Il Servizio soddisferà i tuoi requisiti specifici</li>
                      <li>Il Servizio sarà ininterrotto, tempestivo, sicuro o privo di errori</li>
                      <li>I risultati ottenuti dall'uso del Servizio saranno accurati o affidabili</li>
                      <li>La qualità del Servizio soddisferà le tue aspettative</li>
                    </ul>
                    <p className="mb-4">
                      6.3. La Società non sarà responsabile per danni indiretti, incidentali, speciali o consequenziali, inclusi 
                      perdita di profitti, dati o altre perdite, derivanti dall'uso o dall'impossibilità di utilizzare il Servizio.
                    </p>
                    <p>
                      6.4. La responsabilità massima aggregata della Società derivante da o relativa all'uso del Servizio, 
                      indipendentemente dalla causa di azione, non supererà l'importo pagato per il Servizio nei 12 mesi 
                      precedenti l'evento che ha dato origine alla responsabilità.
                    </p>
                  </section>
                  
                  <section id="termination" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">7. Cessazione</h2>
                    <p className="mb-4">
                      7.1. Puoi interrompere l'utilizzo del Servizio in qualsiasi momento. Non sei obbligato ad informarci quando 
                      smetti di utilizzare il Servizio.
                    </p>
                    <p className="mb-4">
                      7.2. Possiamo terminare o sospendere il tuo accesso al Servizio immediatamente, senza preavviso o 
                      responsabilità, per qualsiasi motivo, incluso, senza limitazione, la violazione di questi Termini.
                    </p>
                    <p>
                      7.3. In caso di cessazione, il tuo diritto di utilizzare il Servizio cesserà immediatamente. Tutte le 
                      disposizioni dei Termini che per loro natura dovrebbero sopravvivere alla cessazione sopravviveranno, 
                      incluse, senza limitazione, le disposizioni sulla proprietà, le esclusioni di garanzia e la limitazione 
                      di responsabilità.
                    </p>
                  </section>
                  
                  <section id="modifications" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">8. Modifiche ai termini</h2>
                    <p className="mb-4">
                      8.1. Ci riserviamo il diritto, a nostra esclusiva discrezione, di modificare o sostituire questi Termini 
                      in qualsiasi momento. Se una revisione è materiale, forniremo un preavviso di almeno 30 giorni prima 
                      che i nuovi termini entrino in vigore.
                    </p>
                    <p>
                      8.2. Continuando ad accedere o utilizzare il nostro Servizio dopo che le revisioni diventano effettive, 
                      accetti di essere vincolato dai termini rivisti. Se non sei d'accordo con i nuovi termini, sei tenuto a 
                      cessare l'uso del Servizio.
                    </p>
                  </section>
                  
                  <section id="applicable-law" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">9. Legge applicabile</h2>
                    <p className="mb-4">
                      9.1. Questi Termini saranno regolati e interpretati in conformità con la legge italiana, senza riguardo 
                      ai suoi conflitti di principi di legge.
                    </p>
                    <p>
                      9.2. Il nostro mancato rispetto di qualsiasi diritto o disposizione di questi Termini non sarà considerato 
                      una rinuncia a tali diritti. Se una disposizione di questi Termini è ritenuta non valida o inapplicabile 
                      da un tribunale, le restanti disposizioni di questi Termini rimarranno in vigore.
                    </p>
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
      </div>
      

    </div>
  );
};

export default TermsConditionsPage;
