
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BarChart3, Activity, Zap, Settings, Lightbulb, LineChart } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      title: 'Monitoraggio Energetico',
      description: 'Monitora in tempo reale i consumi energetici della tua azienda con dashboard personalizzabili e reportistica avanzata.',
      icon: BarChart3,
      features: ['Monitoraggio real-time', 'Dashboard personalizzabili', 'Reportistica automatica']
    },
    {
      title: 'Analisi Predittiva',
      description: 'Utilizza algoritmi di intelligenza artificiale per prevedere consumi futuri e identificare pattern di risparmio.',
      icon: LineChart,
      features: ['Algoritmi avanzati', 'Previsioni accurate', 'Identificazione pattern']
    },
    {
      title: 'Ottimizzazione Consumi',
      description: 'Ricevi suggerimenti personalizzati per ottimizzare i consumi energetici e ridurre i costi operativi.',
      icon: Lightbulb,
      features: ['Suggerimenti automatici', 'Analisi costi/benefici', 'Prioritizzazione interventi']
    },
    {
      title: 'Rilevamento Anomalie',
      description: 'Identifica rapidamente anomalie nei consumi per prevenire guasti e sprechi energetici.',
      icon: Activity,
      features: ['Notifiche in tempo reale', 'Diagnosi precoce', 'Prevenzione guasti']
    },
    {
      title: 'Gestione Impianti',
      description: 'Gestisci centralmente tutti gli impianti energetici della tua azienda da un'unica piattaforma.',
      icon: Settings,
      features: ['Controllo centralizzato', 'Programmazione automatica', 'Manutenzione preventiva']
    },
    {
      title: 'Consulenza Energetica',
      description: 'Ricevi consulenza specializzata dai nostri esperti per migliorare l'efficienza energetica della tua azienda.',
      icon: Zap,
      features: ['Audit energetici', 'Piano di efficientamento', 'Supporto continuo']
    }
  ];

  const testimonials = [
    {
      quote: "Grazie a EnergyMon abbiamo ridotto i costi energetici del 27% in soli sei mesi, con un significativo impatto sul nostro bilancio.",
      author: "Marco Bianchi",
      role: "Direttore Operativo, TechCorp S.p.A."
    },
    {
      quote: "Il sistema di monitoraggio in tempo reale ci ha permesso di identificare sprechi che non avremmo mai notato. Un investimento che si è ripagato in pochissimo tempo.",
      author: "Giulia Ricci",
      role: "Sustainability Manager, GreenFuture"
    },
    {
      quote: "La facilità d'uso della piattaforma è impressionante. Anche i membri del team senza competenze tecniche riescono a utilizzarla efficacemente.",
      author: "Roberto Esposito",
      role: "CTO, Innovatech"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-primary mb-2">I Nostri Servizi</h1>
      <p className="text-lg text-muted-foreground mb-8">Soluzioni complete per l'efficienza energetica della tua azienda</p>

      {/* Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {services.map((service, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {service.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-start text-primary">
                Scopri di più <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Testimonials */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-primary mb-8 text-center">Cosa Dicono i Nostri Clienti</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-muted border-none">
              <CardContent className="pt-6">
                <div className="text-xl font-serif text-muted-foreground italic mb-4">
                  "{testimonial.quote}"
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Pronto a ottimizzare i tuoi consumi energetici?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Richiedi una demo gratuita o un preventivo personalizzato per la tua azienda.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="bg-white text-primary hover:bg-white/90">
            Richiedi una Demo
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            Preventivo Personalizzato
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
