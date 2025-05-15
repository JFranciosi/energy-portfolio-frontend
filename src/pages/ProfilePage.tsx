
import React from 'react';
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
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, Bell, Lock, User } from 'lucide-react';

const ProfilePage = () => {
  const recentActivities = [
    { type: 'Login', date: '14 maggio 2025, 09:45', device: 'Chrome, Windows' },
    { type: 'Modifica profilo', date: '12 maggio 2025, 14:23', device: 'Safari, macOS' },
    { type: 'Download report', date: '10 maggio 2025, 11:05', device: 'Firefox, Windows' },
    { type: 'Cambio password', date: '5 maggio 2025, 16:30', device: 'Chrome, Android' }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src="" />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">MB</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Mario Bianchi</h1>
            <p className="text-muted-foreground">mario.bianchi@azienda.it</p>
          </div>
        </div>
        <Button>Salva modifiche</Button>
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
            <Bell className="h-4 w-4" />
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
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" defaultValue="Mario" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Cognome</Label>
                    <Input id="lastName" defaultValue="Bianchi" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="mario.bianchi@azienda.it" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input id="phone" defaultValue="+39 123 456 7890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Azienda</Label>
                  <Input id="company" defaultValue="TechCorp S.p.A." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Ruolo</Label>
                  <Input id="role" defaultValue="Energy Manager" />
                </div>
              </form>
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
              <form className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Cambia password</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password attuale</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nuova password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Conferma nuova password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button className="mt-2">Aggiorna password</Button>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Sicurezza account</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Autenticazione a due fattori</p>
                        <p className="text-sm text-muted-foreground">Aggiungi un ulteriore livello di sicurezza al tuo account</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sessioni attive</p>
                        <p className="text-sm text-muted-foreground">Gestisci i dispositivi connessi al tuo account</p>
                      </div>
                      <Button variant="outline">Gestisci</Button>
                    </div>
                  </div>
                </div>
              </form>
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
              <Form>
                <div className="space-y-4">
                  <FormField
                    name="email-alerts"
                    render={() => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Avvisi via email</FormLabel>
                          <FormDescription>
                            Ricevi email per avvisi critici e aggiornamenti importanti
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch defaultChecked />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="push-notifications"
                    render={() => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Notifiche push</FormLabel>
                          <FormDescription>
                            Ricevi notifiche push nel browser o nell'app mobile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch defaultChecked />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="monthly-report"
                    render={() => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Report mensile</FormLabel>
                          <FormDescription>
                            Ricevi un report mensile via email con le statistiche dei consumi
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch defaultChecked />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="anomaly-detection"
                    render={() => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Rilevamento anomalie</FormLabel>
                          <FormDescription>
                            Ricevi notifiche quando vengono rilevate anomalie nei consumi
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch defaultChecked />
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

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Attività recenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">{activity.type}</p>
                  <p className="text-sm text-muted-foreground">{activity.device}</p>
                </div>
                <p className="text-sm text-muted-foreground">{activity.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
