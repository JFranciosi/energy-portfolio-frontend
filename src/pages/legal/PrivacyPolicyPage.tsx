
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Printer, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LegalFooter } from '@/components/legal/LegalFooter';

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const topRef = useRef<HTMLDivElement>(null);
  const currentDate = "15 Maggio 2024"; // This should be updated when the policy is updated
  
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
              <h1 className="text-3xl font-bold text-primary mb-2">Privacy Policy</h1>
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
                      { id: 'overview', label: 'Panoramica' },
                      { id: 'controller', label: 'Titolare del trattamento' },
                      { id: 'data-types', label: 'Dati raccolti' },
                      { id: 'purposes', label: 'Finalità del trattamento' },
                      { id: 'legal-basis', label: 'Base giuridica' },
                      { id: 'retention', label: 'Conservazione' },
                      { id: 'rights', label: 'Diritti dell\'interessato' },
                      { id: 'transfers', label: 'Trasferimenti' },
                      { id: 'security', label: 'Misure di sicurezza' },
                    ].map((section) => (
                      <li key={section.id}>
                        <a 
                          href={`#${section.id}`} 
                          className={`block py-1 px-2 rounded ${activeSection === section.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-primary/5'}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                            setActiveSection(section.id);
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
                  <section id="overview" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Panoramica</h2>
                    <p className="mb-4">
                      La presente Privacy Policy descrive le modalità di raccolta, utilizzo e protezione dei dati personali 
                      degli utenti che utilizzano il portale di gestione energetica Energy Portfolio.
                    </p>
                    <p>
                      La protezione dei tuoi dati personali è importante per noi. Questa Policy è stata redatta per aiutarti 
                      a comprendere quali dati raccogliamo, perché li raccogliamo e come puoi aggiornare, gestire ed 
                      eventualmente richiedere la cancellazione delle tue informazioni.
                    </p>
                  </section>
                  
                  <section id="controller" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Titolare del trattamento</h2>
                    <p>
                      Il Titolare del trattamento dei dati personali è Energy Solutions S.p.A., con sede legale in 
                      Via Energia 123, 20123 Milano (MI), Italia, P.IVA 12345678900. Il Titolare può essere contattato 
                      all'indirizzo email: privacy@energyportfolio.it.
                    </p>
                    <p className="mt-3">
                      Il Responsabile della Protezione dei Dati (DPO) può essere contattato all'indirizzo: dpo@energyportfolio.it
                    </p>
                  </section>
                  
                  <section id="data-types" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Dati raccolti</h2>
                    <p className="mb-3">
                      Raccogliamo diversi tipi di informazioni personali, tra cui:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-3">
                      <li>
                        <span className="font-medium">Dati di identificazione:</span> nome, cognome, indirizzo email, numero di telefono
                      </li>
                      <li>
                        <span className="font-medium">Dati aziendali:</span> nome azienda, ruolo, settore di attività
                      </li>
                      <li>
                        <span className="font-medium">Dati di accesso:</span> credenziali, log di accesso, indirizzo IP
                      </li>
                      <li>
                        <span className="font-medium">Dati di utilizzo:</span> funzionalità utilizzate, preferenze, impostazioni salvate
                      </li>
                      <li>
                        <span className="font-medium">Dati energetici:</span> consumi, POD, bollette, costi energetici
                      </li>
                    </ul>
                    <p>
                      La maggior parte di questi dati è fornita direttamente dall'utente durante la registrazione, l'utilizzo 
                      del servizio o tramite l'upload di documenti. Altri dati vengono raccolti automaticamente durante l'utilizzo 
                      della piattaforma.
                    </p>
                  </section>
                  
                  <section id="purposes" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Finalità del trattamento</h2>
                    <p className="mb-3">
                      Utilizziamo i dati raccolti per le seguenti finalità:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Fornitura e gestione dei servizi richiesti</li>
                      <li>Analisi energetica e creazione di report personalizzati</li>
                      <li>Comunicazioni di servizio e assistenza clienti</li>
                      <li>Miglioramento della piattaforma e sviluppo di nuove funzionalità</li>
                      <li>Rispetto degli obblighi legali e normativi</li>
                      <li>Con il tuo consenso, invio di comunicazioni di marketing e newsletter</li>
                    </ul>
                  </section>
                  
                  <section id="legal-basis" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Base giuridica del trattamento</h2>
                    <p className="mb-3">
                      Il trattamento dei dati personali si basa su:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Esecuzione del contratto per i servizi richiesti</li>
                      <li>Adempimento di obblighi legali</li>
                      <li>Legittimo interesse del titolare (es. miglioramento dei servizi, sicurezza informatica)</li>
                      <li>Consenso esplicito dell'interessato (es. per comunicazioni di marketing)</li>
                    </ul>
                  </section>
                  
                  <section id="retention" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Periodo di conservazione</h2>
                    <p className="mb-3">
                      I dati personali sono conservati per il tempo necessario al raggiungimento delle finalità per 
                      cui sono raccolti, o per adempiere ad obblighi di legge:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Dati dell'account: per tutta la durata del rapporto contrattuale e per 10 anni successivi</li>
                      <li>Dati di fatturazione: 10 anni come richiesto dalla normativa fiscale</li>
                      <li>Dati energetici: 5 anni dalla data di caricamento</li>
                      <li>Log di accesso: 12 mesi per ragioni di sicurezza</li>
                    </ul>
                  </section>
                  
                  <section id="rights" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Diritti dell'interessato</h2>
                    <p className="mb-3">
                      Hai diritto di:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-3">
                      <li>Accedere ai tuoi dati personali</li>
                      <li>Richiedere la rettifica di dati inesatti</li>
                      <li>Richiedere la cancellazione dei dati (diritto all'oblio)</li>
                      <li>Richiedere la limitazione del trattamento</li>
                      <li>Ricevere i tuoi dati in formato strutturato (portabilità)</li>
                      <li>Opporti al trattamento in qualsiasi momento</li>
                      <li>Revocare il consenso (senza pregiudicare la liceità del trattamento basato sul consenso prima della revoca)</li>
                      <li>Presentare reclamo a un'autorità di controllo</li>
                    </ul>
                    <p>
                      Per esercitare i tuoi diritti, puoi utilizzare l'apposita <Link to="/gdpr-request" className="text-primary hover:underline">pagina dedicata</Link> o 
                      contattare il nostro Responsabile della Protezione dei Dati all'indirizzo: dpo@energyportfolio.it
                    </p>
                  </section>
                  
                  <section id="transfers" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Trasferimenti di dati</h2>
                    <p className="mb-3">
                      I tuoi dati sono conservati principalmente su server situati nell'Unione Europea. Tuttavia, 
                      alcuni dei nostri fornitori di servizi potrebbero elaborare i dati al di fuori dell'UE.
                    </p>
                    <p>
                      In questi casi, garantiamo che il trasferimento avvenga verso paesi che offrono un livello adeguato 
                      di protezione o mediante l'adozione di garanzie adeguate (come le Clausole Contrattuali Standard 
                      approvate dalla Commissione Europea).
                    </p>
                  </section>
                  
                  <section id="security" className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Misure di sicurezza</h2>
                    <p className="mb-3">
                      Adottiamo adeguate misure di sicurezza per proteggere i tuoi dati personali da accessi non autorizzati, 
                      divulgazione, alterazione o distruzione, tra cui:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Crittografia dei dati sensibili</li>
                      <li>Protocolli di trasmissione sicuri (HTTPS)</li>
                      <li>Controllo degli accessi e autenticazione multi-fattore</li>
                      <li>Backup regolari e disaster recovery</li>
                      <li>Formazione del personale sulle procedure di sicurezza</li>
                      <li>Revisione periodica delle misure di sicurezza</li>
                    </ul>
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
      
      <LegalFooter />
    </div>
  );
};

export default PrivacyPolicyPage;
