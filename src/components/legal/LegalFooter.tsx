import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

interface LegalFooterProps {
  maxWidth?: string; // es. '1200px', '100%', '800px'
  height?: string;   // es. '400px', 'auto', '100vh'
  paddingY?: string; // es. '48px', '3rem' ecc. (per padding verticale)
}

export function LegalFooter({
  maxWidth = '1200px',
  height = 'auto',
  paddingY = '3rem',
}: LegalFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary/5 border-t mt-auto" style={{ paddingTop: paddingY, paddingBottom: paddingY }}>
      <div
        className="mx-auto px-6"
        style={{ maxWidth: maxWidth, height: height }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-lg font-semibold text-primary mb-4">Informazioni Legali</h4>
            <p className="text-base text-muted-foreground mb-4">
              Mies - EnergyPortfolio è un servizio di gestione energetica aziendale fornito da{' '}
              Mies Energy Solutions S.p.A., P.IVA 12345678900, REA MI-1234567.
            </p>
            <p className="text-base text-muted-foreground">
              Sede legale: Via Energia 123, 20123 Milano (MI), Italia
            </p>
          </div>

          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-primary mb-4">Documenti Legali</h4>
            <ul className="space-y-3 text-base">
              <li>
                <Link to="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-primary hover:underline">
                  Termini e Condizioni
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-primary hover:underline">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-primary mb-4">GDPR e Privacy</h4>
            <p className="text-base text-muted-foreground mb-4">
              Responsabile Protezione Dati (DPO): <br />
              <a href="mailto:dpo@miesenergy.it" className="text-primary hover:underline">
                dpo@miesenergy.it
              </a>
            </p>
            <Link to="/gdpr-request" className="text-base text-primary hover:underline">
              Esercita i tuoi diritti GDPR
            </Link>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground mb-3 sm:mb-0">
            © {currentYear} Mies Energy Solutions S.p.A. Tutti i diritti riservati.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
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

export default LegalFooter;
