
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { MapPin, Mail, Phone } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-primary mb-2">Contattaci</h1>
      <p className="text-lg text-muted-foreground mb-8">Siamo qui per rispondere a tutte le tue domande</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
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
              <Button type="submit" className="w-full">Invia messaggio</Button>
            </form>
          </CardContent>
        </Card>

        {/* Map and Contact Info */}
        <div className="space-y-8">
          {/* Interactive Map */}
          <Card className="overflow-hidden shadow-md h-[300px]">
            <div className="h-full bg-muted flex items-center justify-center">
              <div className="text-xl text-muted-foreground">Mappa interattiva</div>
            </div>
          </Card>

          {/* Contact Information */}
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
                    <p className="text-muted-foreground">Via Energia 123, 20100 Milano</p>
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

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-primary mb-6">Domande Frequenti</h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              question: "Quali tipi di aziende possono beneficiare dei vostri servizi?",
              answer: "I nostri servizi sono adatti a qualsiasi tipo di azienda, dalle piccole imprese alle grandi società. Offriamo soluzioni personalizzate in base alle dimensioni e alle esigenze specifiche di ogni cliente."
            },
            {
              question: "Come funziona il processo di implementazione?",
              answer: "Il nostro processo di implementazione inizia con una consulenza gratuita per comprendere le tue esigenze. Successivamente, progettiamo una soluzione personalizzata, installiamo i dispositivi necessari e configuriamo il software. Infine, forniamo formazione e supporto continuo."
            },
            {
              question: "Quanto tempo ci vuole per vedere risultati concreti?",
              answer: "La maggior parte dei nostri clienti inizia a vedere risultati già dal primo mese di utilizzo. Tuttavia, i risparmi più significativi si osservano generalmente dopo 3-6 mesi di ottimizzazione continua."
            },
            {
              question: "Offrite assistenza tecnica continua?",
              answer: "Sì, offriamo un servizio di assistenza tecnica continua 24/7. I nostri clienti possono contattarci in qualsiasi momento tramite telefono, email o il portale dedicato."
            }
          ].map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
};

export default ContactPage;
