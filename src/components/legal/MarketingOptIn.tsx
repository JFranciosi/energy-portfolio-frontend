
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';

interface MarketingOptInProps {
  control: any;
  className?: string;
}

export function MarketingOptIn({ control, className }: MarketingOptInProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-base font-medium">Preferenze di comunicazione</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Seleziona le comunicazioni che desideri ricevere. Potrai modificare queste impostazioni in qualsiasi momento.
      </p>
      
      <FormField
        control={control}
        name="marketingEmail"
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
                Newsletter e aggiornamenti via email
              </FormLabel>
              <FormDescription>
                Ricevi notizie, aggiornamenti e offerte speciali tramite email.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="webinarInvites"
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
                Inviti a webinar e eventi
              </FormLabel>
              <FormDescription>
                Sii informato sui prossimi webinar, workshop e eventi sul risparmio energetico.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="productUpdates"
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
                Aggiornamenti sui prodotti e servizi
              </FormLabel>
              <FormDescription>
                Ricevi aggiornamenti su nuove funzionalità e miglioramenti della piattaforma.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <p className="text-xs text-muted-foreground mt-2">
        Trattiamo i tuoi dati personali in conformità con la nostra <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>. 
        Puoi revocare il tuo consenso in qualsiasi momento dalle impostazioni del tuo account.
      </p>
    </div>
  );
}
