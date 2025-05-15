
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
import DashboardPage from "./pages/energy-portfolio/DashboardPage";
import FuturesPage from "./pages/energy-portfolio/FuturesPage";
import CostsPage from "./pages/energy-portfolio/CostsPage";
import CreateUserPage from "./pages/energy-portfolio/CreateUserPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/dashboard" element={<Layout><Index /></Layout>} />
            <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
            <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/energy-portfolio" element={<Layout><EnergyPortfolioPage /></Layout>} />
            <Route path="/energy-portfolio/upload" element={<Layout><UploadBillsPage /></Layout>} />
            <Route path="/energy-portfolio/dashboard" element={<Layout><DashboardPage /></Layout>} />
            <Route path="/energy-portfolio/futures" element={<Layout><FuturesPage /></Layout>} />
            <Route path="/energy-portfolio/costs" element={<Layout><CostsPage /></Layout>} />
            <Route path="/energy-portfolio/create-user" element={<Layout><CreateUserPage /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
