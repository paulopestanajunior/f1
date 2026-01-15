import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeasonProvider } from '@/lib/season-context';
import Panorama from "./pages/Panorama";
import Pilotos from "./pages/Pilotos";
import PilotoDetalhe from "./pages/PilotoDetalhe";
import Corridas from "./pages/Corridas";
import CorridaDetalhe from "./pages/CorridaDetalhe";
import Comparar from "./pages/Comparar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SeasonProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Panorama />} />
            <Route path="/pilotos" element={<Pilotos />} />
            <Route path="/pilotos/:id" element={<PilotoDetalhe />} />
            <Route path="/corridas" element={<Corridas />} />
            <Route path="/corridas/:id" element={<CorridaDetalhe />} />
            <Route path="/comparar" element={<Comparar />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SeasonProvider>
  </QueryClientProvider>
);

export default App;
