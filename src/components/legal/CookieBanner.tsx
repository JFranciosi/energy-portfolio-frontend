
import React, { useState, useEffect } from 'react';
import { X, Shield, Info, PieChart, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type CookiePreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true and disabled
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookiePreferences');
    if (!cookieChoice) {
      // If no choice has been made, show the banner
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    } else {
      // If a choice exists, parse and set it
      setPreferences(JSON.parse(cookieChoice));
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setShowBanner(false);
    toast.success("Tutte le preferenze cookie sono state salvate");
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    setPreferences(essentialOnly);
    setShowBanner(false);
    toast.success("Solo i cookie necessari sono stati accettati");
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setShowBanner(false);
    setShowPreferences(false);
    toast.success("Le tue preferenze cookie sono state salvate");
  };

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Don't allow changing necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/95 to-secondary/95 text-white p-4 shadow-lg animate-fade-in">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Informativa sui Cookie</h3>
            <p className="text-sm">
              Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito, personalizzare contenuti e analizzare il traffico. 
              Puoi scegliere quali cookie accettare.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <Button 
              variant="outline" 
              className="bg-transparent border-white text-white hover:bg-white hover:text-primary text-xs sm:text-sm"
              onClick={() => {
                setShowBanner(false);
                setShowPreferences(true);
              }}
            >
              Personalizza
            </Button>
            <Button 
              variant="outline" 
              className="bg-transparent border-white text-white hover:bg-white hover:text-primary text-xs sm:text-sm"
              onClick={handleRejectNonEssential}
            >
              Rifiuta non essenziali
            </Button>
            <Button 
              className="bg-white text-primary hover:bg-white/90 text-xs sm:text-sm"
              onClick={handleAcceptAll}
            >
              Accetta tutti
            </Button>
          </div>
          <button 
            className="absolute top-2 right-2 text-white/80 hover:text-white"
            onClick={() => setShowBanner(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Chiudi</span>
          </button>
        </div>
      </div>

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Preferenze Cookie</DialogTitle>
            <DialogDescription>
              Personalizza le tue preferenze sui cookie. I cookie necessari non possono essere disabilitati poiché sono essenziali per il funzionamento del sito.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Panoramica</TabsTrigger>
              <TabsTrigger value="necessary">Necessari</TabsTrigger>
              <TabsTrigger value="functional">Funzionali</TabsTrigger>
              <TabsTrigger value="analytics">Analitici</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Seleziona le categorie di cookie che desideri accettare. I cookie necessari non possono essere disabilitati.
                </p>
                
                <div className="space-y-3">
                  {[
                    { 
                      id: 'necessary', 
                      icon: <Shield className="h-4 w-4 text-primary" />, 
                      title: 'Cookie Necessari', 
                      description: 'Essenziali per il funzionamento del sito.' 
                    },
                    { 
                      id: 'functional', 
                      icon: <Info className="h-4 w-4 text-primary" />, 
                      title: 'Cookie Funzionali', 
                      description: 'Migliorano la funzionalità e personalizzazione.' 
                    },
                    { 
                      id: 'analytics', 
                      icon: <PieChart className="h-4 w-4 text-primary" />, 
                      title: 'Cookie Analitici', 
                      description: 'Aiutano a capire come utilizzi il sito.' 
                    },
                    { 
                      id: 'marketing', 
                      icon: <Target className="h-4 w-4 text-primary" />, 
                      title: 'Cookie di Marketing', 
                      description: 'Usati per pubblicità mirate.' 
                    }
                  ].map(cookie => (
                    <div key={cookie.id} className="flex items-center space-x-3 border rounded-md p-3">
                      <div className="flex-shrink-0">
                        {cookie.icon}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{cookie.title}</p>
                        <p className="text-sm text-muted-foreground">{cookie.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox
                          id={cookie.id}
                          checked={preferences[cookie.id as keyof CookiePreferences]}
                          onCheckedChange={() => handlePreferenceChange(cookie.id as keyof CookiePreferences)}
                          disabled={cookie.id === 'necessary'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="necessary">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cookie Necessari</h4>
                    <p className="text-sm text-muted-foreground">
                      Questi cookie sono necessari per il funzionamento del sito web e non possono essere disattivati.
                    </p>
                  </div>
                  <Checkbox checked disabled />
                </div>
                <div className="border rounded-md p-4 bg-muted/30">
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="font-medium">session:</span> Mantiene la tua sessione attiva
                    </li>
                    <li>
                      <span className="font-medium">csrf_token:</span> Protegge da attacchi CSRF
                    </li>
                    <li>
                      <span className="font-medium">cookie_consent:</span> Salva le tue preferenze sui cookie
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="functional">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cookie Funzionali</h4>
                    <p className="text-sm text-muted-foreground">
                      Questi cookie permettono funzionalità avanzate e personalizzazioni.
                    </p>
                  </div>
                  <Checkbox 
                    checked={preferences.functional}
                    onCheckedChange={() => handlePreferenceChange('functional')}
                  />
                </div>
                <div className="border rounded-md p-4 bg-muted/30">
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="font-medium">language:</span> Ricorda la preferenza di lingua
                    </li>
                    <li>
                      <span className="font-medium">theme:</span> Ricorda le preferenze di tema (chiaro/scuro)
                    </li>
                    <li>
                      <span className="font-medium">ui_settings:</span> Salva le preferenze dell'interfaccia utente
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cookie Analitici</h4>
                    <p className="text-sm text-muted-foreground">
                      Ci aiutano a capire come utilizzi il sito per migliorare l'esperienza utente.
                    </p>
                  </div>
                  <Checkbox 
                    checked={preferences.analytics}
                    onCheckedChange={() => handlePreferenceChange('analytics')}
                  />
                </div>
                <div className="border rounded-md p-4 bg-muted/30">
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="font-medium">_ga, _gid:</span> Google Analytics
                    </li>
                    <li>
                      <span className="font-medium">_hjid:</span> Hotjar per analisi del comportamento
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowPreferences(false)}>
              Annulla
            </Button>
            <Button onClick={handleSavePreferences}>
              Salva preferenze
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
