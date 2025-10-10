import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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
import { Check, Edit, Lock, Mail, User, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LegalFooter } from '@/components/legal/LegalFooter';
import { Link } from 'react-router-dom';
import { Separator } from '@radix-ui/react-separator';

interface UserData {
  codiceAtecoSecondario: string | number;
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

interface Option {
  label: string;
  value: string;
}

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
  codiceAtecoSecondario: "",
  energivori: false,
  gassivori: false,
  consumoAnnuoEnergia: 15000.5,
  fatturatoAnnuo: 500001.0,
  checkEmail: false
};

const countryOpts: Option[] = [
  { label: "IT", value: "IT" },
  { label: "RU", value: "RU" },
  { label: "FR", value: "FR" },
  { label: "ES", value: "ES" },
];

const agevolOpts: Option[] = [
  { label: "No Agevolazioni", value: "No Agevolazioni" },
  { label: "Fat1", value: "Fat1" },
  { label: "Fat2", value: "Fat2" },
  { label: "Fat3", value: "Fat3" },
  { label: "Val",  value: "Val"  },
];

// Component for editable field
interface EditableFieldProps {
  label: string;
  value: string | number;
  fieldKey: keyof UserData;
  onSave: (fieldKey: keyof UserData, value: any) => void;
  type?: "text" | "email" | "number" | "tel";
  isLoading?: boolean;
  disableEdit?: boolean;
  options?: Option[];   // <-- supporta anche select
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  fieldKey,
  onSave,
  type = 'text',
  isLoading = false,
  disableEdit = false,
  options,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);

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
        <div className="flex gap-2 items-center">
          {options ? (
            <Select value={String(fieldValue)} onValueChange={setFieldValue}>
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={String(fieldKey)}
              type={type}
              value={fieldValue as any}
              onChange={(e) =>
                setFieldValue(
                  type === "number" ? parseFloat(e.target.value) : e.target.value
                )
              }
            />
          )}

          <Button
            size="icon"
            type="button"
            onClick={handleSave}
            className="shrink-0"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
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
          disabled={isLoading || disableEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

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
  //const PATH_DEV = "http://localhost:8081";
    const PATH_DEV = 'https://energyportfolio.it';

  const [userData, setUserData] = useState<UserData>(fallbackUserData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [keepLogged, setKeepLogged] = useState(false);
  const [keepLoggedLoading, setKeepLoggedLoading] = useState(false);
  const { toast } = useToast();

  // Password schema con Zod
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

  // Recupera dati utente
  const getCliente = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`${PATH_DEV}/cliente`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const safeData = {
          ...fallbackUserData,
          ...data,
          energivori: Boolean(data.energivori),
          gassivori: Boolean(data.gassivori),
          checkEmail: Boolean(data.checkEmail)
        };
        setUserData(safeData);

        // Recupera anche keepLogged dalla sessione
        const sessResp = await fetch(`${PATH_DEV}/cliente/sessione`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (sessResp.ok) {
          const sessData = await sessResp.json();
          setKeepLogged(sessData.keepLogged);
        }
      } else {
        throw new Error(`Errore durante il recupero dei dati: ${response.status}`);
      }
    } catch {
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

  // Aggiorna campo
  const aggiornaDato = async (campo: string, nuovoValore: any) => {
    setIsSubmitting(true);
    try {
      setUserData(prev => ({ ...prev, [campo]: nuovoValore }));
      const response = await fetch(`${PATH_DEV}/cliente/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campo]: nuovoValore }),
      });
      if (response.ok) {
        toast({ title: "Campo aggiornato", description: "Il campo è stato aggiornato con successo." });
      } else {
        toast({ title: "Errore", description: "Impossibile aggiornare il campo.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Errore di connessione", description: "Verifica la tua connessione e riprova", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true);
    try {
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
        toast({ title: "Password aggiornata", description: "La tua password è stata aggiornata con successo." });
        passwordForm.reset();
      } else {
        const text = await response.text();
        toast({ title: "Errore", description: text || "Impossibile aggiornare la password", variant: "destructive" });
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento password:", error);
      toast({ title: "Errore di connessione", description: "Verifica la tua connessione e riprova", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeepLogged = async () => {
    setKeepLoggedLoading(true);
    try {
      if (!userData.id) throw new Error("Utente non identificato");
      const response = await fetch(`${PATH_DEV}/cliente/keep-logged`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUtente: userData.id, keepLogged: !keepLogged })
      });
      if (response.ok) {
        setKeepLogged(!keepLogged);
        toast({
          title: "Preferenza aggiornata",
          description: `Resta connesso è ora ${!keepLogged ? "attivato" : "disattivato"}.`,
        });
      } else {
        toast({ title: "Errore", description: "Impossibile aggiornare la preferenza.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Errore", description: error instanceof Error ? error.message : "Errore sconosciuto", variant: "destructive" });
    } finally {
      setKeepLoggedLoading(false);
    }
  };

  useEffect(() => {
    getCliente();
  }, []);

  const notificationsForm = useForm({
    defaultValues: {
      "email-alerts": true,
      "push-notifications": true,
      "monthly-report": true,
      "anomaly-detection": true
    }
  });

  const handleSaveField = (fieldKey: keyof UserData, value: any) => {
    aggiornaDato(fieldKey as string, value);
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
  
  const isAdmin = userData.tipologia === "Admin";

  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto py-8 px-4 pb-[6rem]"> {/* padding-bottom per footer fisso */}
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
            {isAdmin ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                Amministratore
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                Cliente
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={getCliente} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Aggiorna dati
          </Button>
          <Button
            variant={keepLogged ? "default" : "outline"}
            onClick={handleKeepLogged}
            disabled={isLoading || keepLoggedLoading}
          >
            {keepLoggedLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {keepLogged ? "Disattiva Resta Connesso" : "Resta connesso"}
          </Button>
        </div>
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

                {isAdmin ? (
                  <EditableField
                    label="Telefono"
                    value={userData.telefono}
                    fieldKey="telefono"
                    type="tel"
                    onSave={handleSaveField}
                    isLoading={isSubmitting}
                  />
                ) : (
                  <>
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
                        label="Paese"
                        value={userData.stato}
                        fieldKey="stato"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                        options={countryOpts}
                      />
                      <EditableField
                        label="Classe Agevolazione"
                        value={userData.classeAgevolazione}
                        fieldKey="classeAgevolazione"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                        options={agevolOpts}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <EditableField
                        label="Codice Ateco"
                        value={userData.codiceAteco}
                        fieldKey="codiceAteco"
                        onSave={handleSaveField}
                        isLoading={isSubmitting}
                      />
                      <EditableField
                        label="Codice Ateco secondario"
                        value={userData.codiceAtecoSecondario}
                        fieldKey="codiceAtecoSecondario"
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
                  </>
                )}
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
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm w-full">
        <div className="mx-auto px-4 py-3 w-full" style={{ maxWidth: "800px" }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-sm font-semibold text-primary mb-1">Informazioni Legali</h4>
              <p className="text-xs text-muted-foreground mb-1">
                Mies - EnergyPortfolio è un servizio di gestione energetica aziendale fornito da{" "}
                Mies Energy Solutions S.p.A., P.IVA 12345678900, REA MI-1234567.
              </p>
              <p className="text-xs text-muted-foreground">
                Sede legale: Via Energia 123, 20123 Milano (MI), Italia
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-primary mb-1">Documenti Legali</h4>
              <ul className="space-y-1 text-xs">
                <li><Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link></li>
                <li><Link to="/terms-conditions" className="text-primary hover:underline">Termini e Condizioni</Link></li>
                <li><Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-primary mb-1">GDPR e Privacy</h4>
              <p className="text-xs text-muted-foreground mb-1">
                DPO:{" "}
                <a href="mailto:dpo@miesenergy.it" className="text-primary hover:underline">
                  dpo@miesenergy.it
                </a>
              </p>
              <Link to="/gdpr-request" className="text-xs text-primary hover:underline">
                Esercita i tuoi diritti GDPR
              </Link>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Mies Energy Solutions S.p.A. Tutti i diritti riservati.
            </p>
            <div className="flex gap-4 text-[11px] text-muted-foreground">
              <Link to="/accessibility" className="hover:text-primary transition-colors">Accessibilità</Link>
              <Link to="/sitemap" className="hover:text-primary transition-colors">Mappa del sito</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;
