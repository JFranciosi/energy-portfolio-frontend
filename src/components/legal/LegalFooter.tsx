
import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export function LegalFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary/5 border-t mt-auto py-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-base font-medium text-primary mb-3">Informazioni Legali</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Energy Portfolio è un servizio di gestione energetica aziendale fornito da 
              Energy Solutions S.p.A., P.IVA 12345678900, REA MI-1234567.
            </p>
            <p className="text-sm text-muted-foreground">
              Sede legale: Via Energia 123, 20123 Milano (MI), Italia
            </p>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-base font-medium text-primary mb-3">Documenti Legali</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-primary hover:underline">Termini e Condizioni</Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-base font-medium text-primary mb-3">GDPR e Privacy</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Responsabile Protezione Dati (DPO): <br />
              <a href="mailto:dpo@energyportfolio.it" className="text-primary hover:underline">dpo@energyportfolio.it</a>
            </p>
            <Link to="/gdpr-request" className="text-sm text-primary hover:underline">
              Esercita i tuoi diritti GDPR
            </Link>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground mb-2 sm:mb-0">
            © {currentYear} Energy Solutions S.p.A. Tutti i diritti riservati.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/accessibility" className="hover:text-primary transition-colors">
              Accessibilità
            </Link>
            <Link to="/sitemap" className="hover:text-primary transition-colors">
              Mappa del sito
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
