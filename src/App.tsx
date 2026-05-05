import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import Auth from "./pages/Auth";
import Finance from "./pages/Finance";
import ThumbnailEditor from "./pages/ThumbnailEditor";
import VoiceEditor from "./pages/VoiceEditor";
import LiveChat from "./pages/LiveChat";
import NamazTime from "./pages/NamazTime";
import Quran from "./pages/Quran";
import Converter from "./pages/Converter";
import LiveTV from "./pages/LiveTV";
import Downloader from "./pages/Downloader";
import Scheduler from "./pages/Scheduler";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Portfolio from "./pages/Portfolio";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Marketplace from "./pages/Marketplace";
import Rentals from "./pages/Rentals";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import About from "./pages/About";
import Appointment from "./pages/Appointment";
import Policies from "./pages/Policies";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:id" element={<ProductDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/rentals" element={<Rentals />} />
                <Route path="/about" element={<About />} />
                <Route path="/appointment" element={<Appointment />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/thumbnail" element={<ThumbnailEditor />} />
                <Route path="/voice" element={<VoiceEditor />} />
                <Route path="/chat" element={<LiveChat />} />
                <Route path="/namaz" element={<NamazTime />} />
                <Route path="/quran" element={<Quran />} />
                <Route path="/converter" element={<Converter />} />
                <Route path="/livetv" element={<LiveTV />} />
                <Route path="/downloader" element={<Downloader />} />
                <Route path="/scheduler" element={<Scheduler />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
