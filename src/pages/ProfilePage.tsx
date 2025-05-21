
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import { Check, Edit, Lock, Mail, Phone, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"; // Fixed import path
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the user data type
interface UserData {
  id: number;
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

// Mock data - could be replaced with API call
const initialUserData: UserData = {
  id: 1,
  username: "mario.rossi",
  password: "password_hash_here",
  sedeLegale: "Via Roma 123, Milano, 20100",
  pIva: "12345678901",
  email: "mario.rossi@example.com",
  telefono: "+39 02 1234567",
  stato: "Italia",
  tipologia: "Cliente",
  classeAgevolazione: "A1",
  codiceAteco: "25.62.00",
  energivori: false,
  gassivori: false,
  consumoAnnuoEnergia: 45000.5,
  fatturatoAnnuo: 1500000.0,
  checkEmail: true
};

// Component for editable field
interface EditableFieldProps {
  label: string;
  value: string | number;
  fieldKey: keyof UserData;
  onSave: (fieldKey: keyof UserData, value: any) => void;
  type?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, fieldKey, onSave, type = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);
  
  const handleSave = () => {
    onSave(fieldKey, fieldValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldKey as string}>{label}</Label>
        <div className="flex gap-2">
          <Input
            id={fieldKey as string}
            type={type}
            value={fieldValue}
            onChange={(e) => setFieldValue(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
          />
          <Button 
            size="icon"
            type="button" 
            onClick={handleSave}
            className="shrink-0">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldKey as string}>{label}</Label>
      <div className="flex items-center justify-between gap-2">
        <div className="px-3 py-2 border rounded-md bg-background w-full overflow-ellipsis">
          {value || <span className="text-muted-foreground italic">Non specificato</span>}
        </div>
        <Button 
          size="icon" 
          variant="outline" 
          type="button"
          onClick={() => setIsEditing(true)}
          className="shrink-0">
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Component for editable switch
interface EditableSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  fieldKey: keyof UserData;
  onSave: (fieldKey: keyof UserData, value: any) => void;
}

const EditableSwitch: React.FC<EditableSwitchProps> = ({ label, description, value, fieldKey, onSave }) => {
  return (
    <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">{label}</FormLabel>
        {description && <FormDescription>{description}</FormDescription>}
      </div>
      <Switch 
        checked={value}
        onCheckedChange={(checked) => onSave(fieldKey, checked)}
      />
    </div>
  );
};

const ProfilePage = () => {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const { toast } = useToast(); // Using the correct hook
  
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
    setUserData((prev) => ({ ...prev, [fieldKey]: value }));
    
    // Here you would typically make an API call to update the field
    // For now, we'll just show a toast
    toast({
      title: "Campo aggiornato",
      description: `${fieldKey} è stato aggiornato con successo.`,
    });
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

  const handlePasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    // Here you would typically make an API call to update the password
    console.log("Password update values:", values);
    toast({
      title: "Password aggiornata",
      description: "La tua password è stata aggiornata con successo.",
    });
    passwordForm.reset();
  };

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
            <p className="text-muted-foreground">{userData.email}</p>
          </div>
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
                  />
                  <EditableField 
                    label="E-mail" 
                    value={userData.email} 
                    fieldKey="email"
                    type="email"
                    onSave={handleSaveField} 
                  />
                </div>
                
                <EditableField 
                  label="Sede legale" 
                  value={userData.sedeLegale} 
                  fieldKey="sedeLegale"
                  onSave={handleSaveField} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditableField 
                    label="P.IVA" 
                    value={userData.pIva} 
                    fieldKey="pIva"
                    onSave={handleSaveField} 
                  />
                  <EditableField 
                    label="Telefono" 
                    value={userData.telefono} 
                    fieldKey="telefono"
                    type="tel"
                    onSave={handleSaveField} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditableField 
                    label="Stato" 
                    value={userData.stato} 
                    fieldKey="stato"
                    onSave={handleSaveField} 
                  />
                  <EditableField 
                    label="Tipologia" 
                    value={userData.tipologia} 
                    fieldKey="tipologia"
                    onSave={handleSaveField} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditableField 
                    label="Classe Agevolazione" 
                    value={userData.classeAgevolazione} 
                    fieldKey="classeAgevolazione"
                    onSave={handleSaveField} 
                  />
                  <EditableField 
                    label="Codice Ateco" 
                    value={userData.codiceAteco} 
                    fieldKey="codiceAteco"
                    onSave={handleSaveField} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditableField 
                    label="Consumo Annuo Energia (kWh)" 
                    value={userData.consumoAnnuoEnergia} 
                    fieldKey="consumoAnnuoEnergia"
                    type="number"
                    onSave={handleSaveField} 
                  />
                  <EditableField 
                    label="Fatturato Annuo (€)" 
                    value={userData.fatturatoAnnuo} 
                    fieldKey="fatturatoAnnuo"
                    type="number"
                    onSave={handleSaveField} 
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
                    />
                    <EditableSwitch
                      label="Gassivori"
                      description="L'azienda rientra nei criteri di classificazione come gassivora"
                      value={userData.gassivori}
                      fieldKey="gassivori"
                      onSave={handleSaveField}
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
                    
                    <Button type="submit" className="mt-2">Aggiorna password</Button>
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
              <Form {...notificationsForm}>
                <div className="space-y-4">
                  <EditableSwitch
                    label="Avvisi via email"
                    description="Ricevi email per avvisi critici e aggiornamenti importanti"
                    value={userData.checkEmail}
                    fieldKey="checkEmail"
                    onSave={handleSaveField}
                  />
                  
                  <FormField
                    name="push-notifications"
                    control={notificationsForm.control}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Notifiche push</FormLabel>
                          <FormDescription>
                            Ricevi notifiche push nel browser o nell'app mobile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="monthly-report"
                    control={notificationsForm.control}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Report mensile</FormLabel>
                          <FormDescription>
                            Ricevi un report mensile via email con le statistiche dei consumi
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="anomaly-detection"
                    control={notificationsForm.control}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Rilevamento anomalie</FormLabel>
                          <FormDescription>
                            Ricevi notifiche quando vengono rilevate anomalie nei consumi
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
