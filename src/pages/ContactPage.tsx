import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import LayoutPublic from '@/components/layout/LayoutPublic';

const ContactPage = () => {
  const faqs = [
    {
      question: "Quali tipi di aziende possono beneficiare dei vostri servizi?",
      answer:
        "I nostri servizi sono adatti a qualsiasi tipo di azienda, dalle piccole imprese alle grandi società. Offriamo soluzioni personalizzate in base alle dimensioni e alle esigenze specifiche di ogni cliente, dai settori manifatturieri a quelli dei servizi.",
    },
    {
      question: "Come funziona il processo di implementazione?",
      answer:
        "Il nostro processo inizia con una consulenza gratuita per comprendere le tue esigenze. Successivamente, effettuiamo una diagnosi energetica, progettiamo una soluzione personalizzata, installiamo i dispositivi necessari e configuriamo il software. Infine, forniamo formazione e supporto continuo.",
    },
    {
      question: "Quanto tempo ci vuole per vedere risultati concreti?",
      answer:
        "La maggior parte dei nostri clienti inizia a vedere risultati già dal primo mese di utilizzo. Tuttavia, i risparmi più significativi si osservano generalmente dopo 3-6 mesi di ottimizzazione continua dei processi energetici.",
    },
    {
      question: "Offrite assistenza tecnica continua?",
      answer:
        "Sì, offriamo un servizio di assistenza tecnica continua durante l'orario lavorativo. I nostri clienti possono contattarci tramite telefono, email o il portale dedicato. Per interventi urgenti, garantiamo una risposta entro 4 ore.",
    },
    {
      question: "Quali sono i costi dei vostri servizi?",
      answer:
        "I costi variano in base al tipo di servizio e alle dimensioni dell'azienda. Offriamo sempre una prima consulenza gratuita durante la quale valutiamo le esigenze specifiche e forniamo un preventivo dettagliato. Molti dei nostri servizi si ripagano attraverso i risparmi energetici generati.",
    },
    {
      question: "Lavorate anche con aziende di piccole dimensioni?",
      answer:
        "Assolutamente sì. Abbiamo soluzioni scalabili adatte anche alle piccole e medie imprese. Comprendiamo che ogni azienda ha esigenze diverse e offriamo pacchetti flessibili che si adattano al budget e alle necessità specifiche di ogni cliente.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-400 py-16 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contattaci
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Siamo qui per rispondere a tutte le tue domande e aiutarti a trovare 
              la soluzione energetica più adatta alla tua azienda.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Invia un messaggio</CardTitle>
                <p className="text-muted-foreground">
                  Compila il form e ti ricontatteremo entro 24 ore
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input id="name" placeholder="Il tuo nome" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Cognome *</Label>
                      <Input id="surname" placeholder="Il tuo cognome" required />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="tua@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefono</Label>
                      <Input id="phone" type="tel" placeholder="+39 123 456 7890" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Azienda *</Label>
                    <Input id="company" placeholder="Nome della tua azienda" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Ruolo in azienda</Label>
                    <Input id="role" placeholder="Es: Responsabile Tecnico, CEO, ecc." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Servizio di interesse</Label>
                    <select 
                      id="service" 
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Seleziona un servizio</option>
                      <option value="diagnosi">Diagnosi Energetica</option>
                      <option value="engineering">Engineering</option>
                      <option value="oneview">OneView Platform</option>
                      <option value="performance">Energy Performance Contract</option>
                      <option value="portfolio">Energy Portfolio</option>
                      <option value="iso50001">ISO 50001</option>
                      <option value="certificati-bianchi">Certificati Bianchi</option>
                      <option value="consulenza">Consulenza Generale</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Messaggio *</Label>
                    <Textarea
                      id="message"
                      placeholder="Descrivi brevemente le tue esigenze o fai una domanda specifica..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="privacy" required className="rounded" />
                    <Label htmlFor="privacy" className="text-sm">
                      Accetto il trattamento dei dati personali secondo la Privacy Policy *
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Invia messaggio
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info & Map */}
            <div className="space-y-8">
              {/* Contact Information */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Informazioni di contatto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="text-primary shrink-0 mt-1" size={20} />
                      <div>
                        <h3 className="font-semibold mb-1">Sede principale</h3>
                        <p className="text-muted-foreground">
                          Via Energia 123<br />
                          20100 Milano (MI)<br />
                          Italia
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Mail className="text-primary shrink-0 mt-1" size={20} />
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <p className="text-muted-foreground">info@mies.it</p>
                        <p className="text-muted-foreground text-sm">
                          Risposta entro 24 ore
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Phone className="text-primary shrink-0 mt-1" size={20} />
                      <div>
                        <h3 className="font-semibold mb-1">Telefono</h3>
                        <p className="text-muted-foreground">+39 02 1234567</p>
                        <p className="text-muted-foreground text-sm">
                          Assistenza tecnica clienti
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Clock className="text-primary shrink-0 mt-1" size={20} />
                      <div>
                        <h3 className="font-semibold mb-1">Orari di apertura</h3>
                        <p className="text-muted-foreground">
                          Lunedì - Venerdì: 9:00 - 18:00<br />
                          Sabato: 9:00 - 13:00<br />
                          Domenica: Chiuso
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="shadow-lg h-[300px]">
                <div className="h-full bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">
                      Mappa interattiva
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Via Energia 123, Milano
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Domande Frequenti
              </h2>
              <p className="text-lg text-muted-foreground">
                Trova risposte alle domande più comuni sui nostri servizi
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-400 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Non hai trovato quello che cercavi?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            I nostri esperti sono sempre disponibili per una consulenza personalizzata. 
            Chiamaci direttamente o prenota un appuntamento.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              Chiama ora: +39 02 1234567
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Prenota appuntamento
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
