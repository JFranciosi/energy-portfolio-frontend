
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import ServicesPage from "./pages/ServicesPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import Layout from "./components/layout/Layout";
import EnergyPortfolioPage from "./pages/energy-portfolio/EnergyPortfolioPage";
import UploadBillsPage from "./pages/energy-portfolio/UploadBillsPage";
import FuturesPage from "./pages/energy-portfolio/FuturesPage";
import CostsPage from "./pages/energy-portfolio/CostsPage";
import CreateUserPage from "./pages/admin/CreateUserPage.tsx";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import TermsConditionsPage from "./pages/legal/TermsConditionsPage";
import CookiePolicyPage from "./pages/legal/CookiePolicyPage";
import GdprRequestPage from "./pages/legal/GdprRequestPage";
import { CookieBanner } from "./components/legal/CookieBanner";
import CostiPage from "./pages/admin/CostiPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <CookieBanner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
            <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
            <Route path="/auth" element={<Layout><AuthPage /></Layout>} />
            <Route path="/energy-portfolio" element={<Layout><EnergyPortfolioPage /></Layout>} />
            <Route path="/energy-portfolio/upload" element={<Layout><UploadBillsPage /></Layout>} />
            <Route path="/energy-portfolio/futures" element={<Layout><FuturesPage /></Layout>} />
            <Route path="/energy-portfolio/costs" element={<Layout><CostsPage /></Layout>} />
            <Route path="/energy-portfolio/create-user" element={<Layout><CreateUserPage /></Layout>} />
            <Route path="/admin/costi" element={<Layout><CostiPage /></Layout>} />
            
            {/* Legal Routes */}
            <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
            <Route path="/terms-conditions" element={<Layout><TermsConditionsPage /></Layout>} />
            <Route path="/cookie-policy" element={<Layout><CookiePolicyPage /></Layout>} />
            <Route path="/gdpr-request" element={<Layout><GdprRequestPage /></Layout>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
