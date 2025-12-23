# Energy Portfolio Frontend

Benvenuto nel repository del frontend di **Energy Portfolio**. Questa applicazione web moderna, sviluppata con **React** e **Vite**, fornisce un'interfaccia intuitiva e performante per la gestione dei portafogli energetici.

## 📋 Descrizione

Il progetto **Energy Portfolio Frontend** è progettato per offrire agli utenti una piattaforma completa per monitorare, analizzare e gestire i propri asset energetici. Grazie all'utilizzo di tecnologie all'avanguardia come **Shadcn/ui** e **Tailwind CSS**, l'applicazione garantisce un'esperienza utente fluida, reattiva ed esteticamente curata.

## ✨ Funzionalità Chiave

*   **Autenticazione Sicura**: Sistema completo di Login, Registrazione, Recupero Password e gestione del Profilo Utente.
*   **Dashboard Interattiva**: Visualizzazione centralizzata dei dati chiave e delle metriche di performance.
*   **Gestione Portafoglio**: Strumenti avanzati per creare, modificare e monitorare i portafogli energetici.
*   **Visualizzazione Dati**: Grafici interattivi e dinamici realizzati con **Recharts** per l'analisi dei trend.
*   **Area Amministrativa**: Sezione dedicata agli amministratori per la gestione della piattaforma.
*   **Design Responsivo**: Interfaccia ottimizzata per dispositivi desktop, tablet e mobile.
*   **Modalità Scura/Chiara**: Supporto nativo per temi multipli (Dark/Light mode).

## 🛠️ Tecnologie Utilizzate

Questo progetto si basa su un moderno stack tecnologico:

*   **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/) (basato su Radix UI)
*   **Stato & Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
*   **Routing**: [React Router DOM](https://reactrouter.com/)
*   **Form**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (validazione)
*   **Grafici**: [Recharts](https://recharts.org/)
*   **Icone**: [Lucide React](https://lucide.dev/)
*   **HTTP Client**: [Axios](https://axios-http.com/)

## 🚀 Per Iniziare

Segui questi passaggi per configurare ed eseguire il progetto localmente.

### Prerequisiti

Assicurati di avere installato:
*   [Node.js](https://nodejs.org/) (versione 18 o superiore raccomandata)
*   npm (normalmente incluso con Node.js) o [Bun](https://bun.sh/)

### Installazione

1.  Clona il repository:
    ```bash
    git clone https://github.com/tuo-username/energy-portfolio-frontend.git
    cd energy-portfolio-frontend
    ```

2.  Installa le dipendenze:
    ```bash
    npm install
    # oppure
    bun install
    ```

### Configurazione

Crea un file `.env` nella root del progetto se necessario (basati su eventuali file di esempio forniti) per configurare le variabili d'ambiente come l'endpoint dell'API backend.

### Esecuzione (Sviluppo)

Per avviare il server di sviluppo locale:

```bash
npm run dev
```

L'applicazione sarà accessibile all'indirizzo `http://localhost:8080` (o un'altra porta indicata nel terminale).

## 📜 Script Disponibili

Nel file `package.json` sono definiti i seguenti script:

*   `npm run dev`: Avvia il server di sviluppo con hot-reload.
*   `npm run build`: Compila l'applicazione per la produzione nella cartella `dist`.
*   `npm run build:dev`: Compila l'applicazione in modalità development.
*   `npm run preview`: Avvia un server locale per visualizzare la build di produzione.
*   `npm run lint`: Esegue il linting del codice con ESLint per trovare errori e problemi di stile.

## 📂 Struttura del Progetto

```
src/
├── admin/          # Funzionalità e pagine dell'area amministrativa
├── components/     # Componenti UI riutilizzabili (pulsanti, input, ecc.)
├── energy-portfolio/ # Logica e componenti specifici del dominio energetico
├── hooks/          # Custom React Hooks
├── lib/            # Utility e configurazioni (es. utils.ts per Tailwind)
├── pages/          # Pagine principali dell'applicazione (Home, Auth, Profile...)
├── styles/         # Stili globali CSS
├── App.tsx         # Componente radice e configurazione del routing
└── main.tsx        # Entry point dell'applicazione React
```

## 🤝 Contribuire

I contributi sono benvenuti! Per modifiche importanti, apri prima una issue per discutere cosa vorresti cambiare.

1.  Fai un Fork del repository
2.  Crea un branch per la tua Feature (`git checkout -b feature/NuovaFeature`)
3.  Commetta le tue modifiche (`git commit -m 'Aggiunta nuova feature'`)
4.  Pusha sul branch (`git push origin feature/NuovaFeature`)
5.  Apri una Pull Request

## 📄 Licenza

Questo progetto è privato e proprietario. Tutti i diritti sono riservati.
