
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LegalFooter } from '@/components/legal/LegalFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(3, { message: "Il nome completo è obbligatorio" }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido" }),
  companyName: z.string().min(2, { message: "Il nome dell'azienda è obbligatorio" }),
  requestType: z.string(),
  requestDetails: z.string().min(10, { message: "Fornisci maggiori dettagli sulla tua richiesta" }),
  identityProof: z.boolean().refine(val => val === true, { message: "Devi confermare la tua identità" }),
  consent: z.boolean().refine(val => val === true, { message: "È necessario accettare le condizioni" })
});

type FormValues = z.infer<typeof formSchema>;

const GdprRequestPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      requestType: "",
      requestDetails: "",
      identityProof: false,
      consent: false
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("La tua richiesta è stata inviata con successo", {
        description: "Riceverai un'email di conferma a breve."
      });
      form.reset();
    } catch (error) {
      toast.error("Si è verificato un errore", {
        description: "Non siamo riusciti a inviare la richiesta. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2">Richiesta Diritti GDPR</h1>
          <p className="text-muted-foreground mb-8">
            Usa questo modulo per richiedere l'esercizio dei tuoi diritti in base al Regolamento Generale sulla Protezione dei Dati (GDPR).
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle>Modulo di richiesta</CardTitle>
              <CardDescription>
                La tua richiesta sarà processata entro 30 giorni, come previsto dal GDPR.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome e Cognome</FormLabel>
                          <FormControl>
                            <Input placeholder="Mario Rossi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="mario.rossi@esempio.it" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Azienda</FormLabel>
                        <FormControl>
                          <Input placeholder="Azienda SRL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo di richiesta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona il tipo di richiesta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="access">Accesso ai dati</SelectItem>
                            <SelectItem value="rectification">Rettifica dei dati</SelectItem>
                            <SelectItem value="erasure">Cancellazione (diritto all'oblio)</SelectItem>
                            <SelectItem value="restriction">Limitazione del trattamento</SelectItem>
                            <SelectItem value="portability">Portabilità dei dati</SelectItem>
                            <SelectItem value="objection">Opposizione al trattamento</SelectItem>
                            <SelectItem value="consent-withdrawal">Revoca del consenso</SelectItem>
                            <SelectItem value="other">Altra richiesta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requestDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dettagli della richiesta</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Fornisci una descrizione dettagliata della tua richiesta" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Includi tutte le informazioni pertinenti per elaborare la tua richiesta.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="identityProof"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Confermo di essere l'interessato di cui si richiedono i dati
                            </FormLabel>
                            <FormDescription>
                              Potremmo richiedere ulteriori prove di identità per evadere la richiesta.
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Accetto che i dati forniti siano trattati per gestire la mia richiesta
                            </FormLabel>
                            <FormDescription>
                              I dati saranno utilizzati solo per rispondere alla tua richiesta e saranno conservati per il periodo necessario.
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Invio in corso..." : "Invia richiesta"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Le richieste vengono elaborate entro 30 giorni come previsto dal GDPR. 
                    Per informazioni contatta: dpo@energyportfolio.it
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      

    </div>
  );
};

export default GdprRequestPage;
