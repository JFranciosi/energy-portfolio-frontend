import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Edit, Lock, Mail, Phone, User, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the user data type
interface UserData {
  id?: number;
  username: string;
  password?: string;
  sedeLegale: string;
  pIva: string;
  email: string;
  telefono: string;
  stato: string;
  tipologia: string;
  classeAgevolazione: string;
  codiceAteco: string;
  energivori: boolean;
  gassivori: boolean;
  consumoAnnuoEnergia: number;
  fatturatoAnnuo: number;
  checkEmail: boolean;
}

// Dati utente di fallback con i valori del JSON fornito
const fallbackUserData: UserData = {
  id: 6,
  username: "Alessio",
  password: "Tf9Oo0DwqCPxXT9PAati6uDl2lecy4Ufjbnf6ExYsrN7iZA6dA4e4XLaeTpuedVg5ff5vQWKEqKAQz7W+kZRCg",
  sedeLegale: "Via Roma 10, Milano",
  pIva: "",
  email: "",
  telefono: "+39 123 456 7890",
  stato: "Italia",
  tipologia: "Admin",
  classeAgevolazione: "Fat1",
  codiceAteco: "",
  energivori: false,
  gassivori: false,
  consumoAnnuoEnergia: 15000.5,
  fatturatoAnnuo: 500001.0,
  checkEmail: false
};

// Component for editable field
interface EditableFieldProps {
  label: string;
  value: string | number;
  fieldKey: keyof UserData;
  onSave: (fieldKey: keyof UserData, value: any) => void;
  type?: string;
  isLoading?: boolean;
  disableEdit?: boolean; // NUOVA PROP per disabilitare il bottone edit
}

const EditableField: React.FC<EditableFieldProps> = ({
                                                       label,
                                                       value,
                                                       fieldKey,
                                                       onSave,
                                                       type = 'text',
                                                       isLoading = false,
                                                       disableEdit = false,
                                                     }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);

  // Update field value when the prop changes
  useEffect(() => {
    setFieldValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(fieldKey, fieldValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
        <div className="space-y-2">
          <Label htmlFor={String(fieldKey)}>{label}</Label>
          <div className="flex gap-2">
            <Input
                id={String(fieldKey)}
                type={type}
                value={fieldValue}
                onChange={(e) => setFieldValue(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            />
            <Button
                size="icon"
                type="button"
                onClick={handleSave}
                className="shrink-0"
                disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-2">
        <Label htmlFor={String(fieldKey)}>{label}</Label>
        <div className="flex items-center justify-between gap-2">
          <div className="px-3 py-2 border rounded-md bg-background w-full overflow-ellipsis">
            {value || <span className="text-muted-foreground italic">Non specificato</span>}
          </div>
          <Button
              size="icon"
              variant="outline"
              type="button"
              onClick={() => setIsEditing(true)}
              className="shrink-0"
              disabled={isLoading || disableEdit} // disabilita se la prop disableEdit è true
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
  );
};

// Component for editable switch - corretto
interface EditableSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  fieldKey: keyof UserData;
  onSave: (fieldKey: keyof UserData, value: any) => void;
  isLoading?: boolean;
}

const EditableSwitch: React.FC<EditableSwitchProps> = ({
                                                         label,
                                                         description,
                                                         value,
                                                         fieldKey,
                                                         onSave,
                                                         isLoading = false
                                                       }) => {
  return (
      <div className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
        <div className="space-y-0.5">
          <div className="text-base font-medium">{label}</div>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
        <div className="flex items-center">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <Switch
              checked={value}
              onCheckedChange={(checked) => onSave(fieldKey, checked)}
              disabled={isLoading}
          />
        </div>
      </div>
  );
};

const ProfilePage = () => {
  const PATH_DEV = "http://localhost:8081"; // Percorso base per le API
  const [userData, setUserData] = useState<UserData>(fallbackUserData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const { toast } = useToast();

  // Caricamento dati utente dall'API
  const getCliente = async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      console.log("Tentativo di recupero dati utente da:", `${PATH_DEV}/cliente`);

      const response = await fetch(`${PATH_DEV}/cliente`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Dati utente ricevuti:", data);

        // Assicuriamoci che tutti i campi siano presenti
        const safeData = {
          ...fallbackUserData, // Usiamo i valori di fallback come base
          ...data, // Sovrascriviamo con i dati ricevuti dall'API
          // Forziamo alcuni campi booleani per sicurezza
          energivori: Boolean(data.energivori),
          gassivori: Boolean(data.gassivori),
          checkEmail: Boolean(data.checkEmail)
        };

        setUserData(safeData);
        console.log("Dati utente impostati:", safeData);
      } else {
        console.error("Errore API:", response.status, response.statusText);
        throw new Error(`Errore durante il recupero dei dati: ${response.status}`);
      }
    } catch (error) {
      console.error("Errore nel recupero dei dati:", error);
      setLoadError(true);
      toast({
        title: "Errore di caricamento",
        description: "Impossibile caricare i dati dell'utente. Utilizzando dati temporanei.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Aggiornamento di un campo specifico
  const aggiornaDato = async (campo: string, nuovoValore: any) => {
    setIsSubmitting(true);

    try {
      // Aggiorna immediatamente lo stato locale per una migliore esperienza utente
      setUserData(prev => ({
        ...prev,
        [campo]: nuovoValore
      }));

      console.log(`Aggiornamento campo "${campo}" a:`, nuovoValore);

      const response = await fetch(`${PATH_DEV}/cliente/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campo]: nuovoValore }),
      });

      if (response.ok) {
        toast({
          title: "Campo aggiornato",
          description: `Il campo è stato aggiornato con successo.`,
        });
      } else {
        const text = await response.text();
        console.error('Errore durante l\'aggiornamento del dato:', text);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare il campo. I dati mostrati potrebbero non essere sincronizzati.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento del campo:", error);
      toast({
        title: "Errore di connessione",
        description: "Verifica la tua connessione e riprova",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Caricamento iniziale dei dati utente
  useEffect(() => {
    console.log("Componente montato, caricamento dati utente");
    getCliente();
  }, []);

  // Create form instance for notifications tab
  const notificationsForm = useForm({
    defaultValues: {
      "email-alerts": true,
      "push-notifications": true,
      "monthly-report": true,
      "anomaly-detection": true
    }
  });

  // Handle field save
  const handleSaveField = (fieldKey: keyof UserData, value: any) => {
    aggiornaDato(fieldKey as string, value);
  };

  // Password schema
  const passwordSchema = z.object({
    currentPassword: z.string().min(1, "La password attuale è obbligatoria"),
    newPassword: z.string().min(8, "La password deve essere di almeno 8 caratteri"),
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const handlePasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true);

    try {
      // Invia la richiesta per aggiornare la password
      const response = await fetch(`${PATH_DEV}/cliente/update-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        }),
      });

      if (response.ok) {
        toast({
          title: "Password aggiornata",
          description: "La tua password è stata aggiornata con successo.",
        });
        passwordForm.reset();
      } else {
        const text = await response.text();
        toast({
          title: "Errore",
          description: text || "Impossibile aggiornare la password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento della password:", error);
      toast({
        title: "Errore di connessione",
        description: "Verifica la tua connessione e riprova",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !loadError) {
    return (
        <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Caricamento dati utente in corso...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {userData.username?.substring(0, 2).toUpperCase() || "UT"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{userData.username || "Utente"}</h1>
              <p className="text-muted-foreground">{userData.email || "Email non disponibile"}</p>
              {userData.tipologia === "Admin" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                Amministratore
              </span>
              )}
            </div>
          </div>
          <Button
              variant="outline"
              onClick={getCliente}
              disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Aggiorna dati
          </Button>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="mb-8">
          <TabsList className="mb-8 w-full max-w-md mx-auto grid grid-cols-3 h-auto">
            <TabsTrigger value="personal" className="flex items-center gap-2 py-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Dati personali</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 py-3">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Sicurezza</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 py-3">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Notifiche</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Dati personali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                        label="Username"
                        value={userData.username}
                        fieldKey="username"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                    />
                    <EditableField
                        label="E-mail"
                        value={userData.email}
                        fieldKey="email"
                        type="email"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                    />
                  </div>

                  <EditableField
                      label="Sede legale"
                      value={userData.sedeLegale}
                      fieldKey="sedeLegale"
                      onSave={handleSaveField}
                      isLoading={isSubmitting}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                        label="P.IVA"
                        value={userData.pIva}
                        fieldKey="pIva"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                    />
                    <EditableField
                        label="Telefono"
                        value={userData.telefono}
                        fieldKey="telefono"
                        type="tel"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                        label="Stato"
                        value={userData.stato}
                        fieldKey="stato"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                    />
                    <EditableField
                        label="Tipologia"
                        value={userData.tipologia}
                        fieldKey="tipologia"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                        disableEdit={true} // disabilita modifica tipologia
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                        label="Classe Agevolazione"
                        value={userData.classeAgevolazione}
                        fieldKey="classeAgevolazione"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                    />
                    <EditableField
                        label="Codice Ateco"
                        value={userData.codiceAteco}
                        fieldKey="codiceAteco"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                        label="Consumo Annuo Energia (kWh)"
                        value={userData.consumoAnnuoEnergia}
                        fieldKey="consumoAnnuoEnergia"
                        type="number"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                    />
                    <EditableField
                        label="Fatturato Annuo (€)"
                        value={userData.fatturatoAnnuo}
                        fieldKey="fatturatoAnnuo"
                        type="number"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Opzioni aziendali</h3>
                    <div className="space-y-4">
                      <EditableSwitch
                          label="Energivori"
                          description="L'azienda rientra nei criteri di classificazione come energivora"
                          value={userData.energivori}
                          fieldKey="energivori"
                          onSave={handleSaveField}
                          isLoading={isSubmitting}
                      />
                      <EditableSwitch
                          label="Gassivori"
                          description="L'azienda rientra nei criteri di classificazione come gassivora"
                          value={userData.gassivori}
                          fieldKey="gassivori"
                          onSave={handleSaveField}
                          isLoading={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sicurezza</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Cambia password</h3>

                      <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password attuale</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                          )}
                      />

                      <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nuova password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                          )}
                      />

                      <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                              <FormItem>
                                <FormLabel>Conferma nuova password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                          )}
                      />

                      <Button type="submit" className="mt-2" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Aggiornamento in corso...
                            </>
                        ) : (
                            "Aggiorna password"
                        )}
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">Sicurezza account</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Autenticazione a due fattori</p>
                            <p className="text-sm text-muted-foreground">Aggiungi un ulteriore livello di sicurezza al tuo account</p>
                          </div>
                          <Switch
                              checked={false}
                              onCheckedChange={() => {
                                toast({
                                  title: "Funzionalità non disponibile",
                                  description: "L'autenticazione a due fattori sarà disponibile in futuro.",
                                });
                              }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Sessioni attive</p>
                            <p className="text-sm text-muted-foreground">Gestisci i dispositivi connessi al tuo account</p>
                          </div>
                          <Button variant="outline" onClick={() => {
                            toast({
                              title: "Funzionalità non disponibile",
                              description: "La gestione delle sessioni sarà disponibile in futuro.",
                            });
                          }}>Gestisci</Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferenze di notifica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <EditableSwitch
                      label="Avvisi via email"
                      description="Ricevi email per avvisi critici e aggiornamenti importanti"
                      value={userData.checkEmail}
                      fieldKey="checkEmail"
                      onSave={handleSaveField}
                      isLoading={isSubmitting}
                  />

                  <div className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="text-base font-medium">Notifiche push</div>
                      <div className="text-sm text-muted-foreground">Ricevi notifiche push nel browser o nell'app mobile</div>
                    </div>
                    <Switch
                        checked={notificationsForm.getValues("push-notifications")}
                        onCheckedChange={(checked) => notificationsForm.setValue("push-notifications", checked)}
                    />
                  </div>

                  <div className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="text-base font-medium">Report mensile</div>
                      <div className="text-sm text-muted-foreground">Ricevi un report mensile via email con le statistiche dei consumi</div>
                    </div>
                    <Switch
                        checked={notificationsForm.getValues("monthly-report")}
                        onCheckedChange={(checked) => notificationsForm.setValue("monthly-report", checked)}
                    />
                  </div>

                  <div className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="text-base font-medium">Rilevamento anomalie</div>
                      <div className="text-sm text-muted-foreground">Ricevi notifiche quando vengono rilevate anomalie nei consumi</div>
                    </div>
                    <Switch
                        checked={notificationsForm.getValues("anomaly-detection")}
                        onCheckedChange={(checked) => notificationsForm.setValue("anomaly-detection", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default ProfilePage;