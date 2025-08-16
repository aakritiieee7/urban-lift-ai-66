import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ShipperLogin from "./pages/auth/ShipperLogin";
import ShipperRegister from "./pages/auth/ShipperRegister";
import CarrierLogin from "./pages/auth/CarrierLogin";
import CarrierRegister from "./pages/auth/CarrierRegister";
import ShipperDashboard from "./pages/dashboard/ShipperDashboard";
import CarrierDashboard from "./pages/dashboard/CarrierDashboard";
import Community from "./pages/Community";
import Leaderboard from "./pages/Leaderboard";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import PublicTransits from "./pages/PublicTransits";
import AIPooling from "./pages/AIPooling";
import CarrierTransit from "./pages/carrier/Transit";
import CarrierTrack from "./pages/carrier/Track";
import CarrierCommunity from "./pages/carrier/Community";
import CarrierAnalytics from "./pages/carrier/Analytics";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/shipper/login" element={<ShipperLogin />} />
            <Route path="/auth/shipper/register" element={<ShipperRegister />} />
            <Route path="/auth/carrier/login" element={<CarrierLogin />} />
            <Route path="/auth/carrier/register" element={<CarrierRegister />} />
            <Route path="/dashboard" element={<ShipperDashboard />} />
            <Route path="/carrier-dashboard" element={<CarrierDashboard />} />
            <Route path="/community" element={<Community />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/transits" element={<PublicTransits />} />
            <Route path="/ai-pooling" element={<AIPooling />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
<Route path="/profile" element={<Profile />} />
{/* Carrier section pages */}
<Route path="/carrier/transit" element={<CarrierTransit />} />
<Route path="/carrier/track" element={<CarrierTrack />} />
<Route path="/carrier/community" element={<CarrierCommunity />} />
<Route path="/carrier/analytics" element={<CarrierAnalytics />} />
{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
<Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
