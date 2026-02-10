import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminDishes from "./pages/admin/AdminDishes";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSubAdmins from "./pages/admin/AdminSubAdmins";
import AdminTables from './pages/admin/AdminTables';
import AdminOrders from './pages/admin/AdminOrders';

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminAuth />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
<Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="dishes" element={<AdminDishes />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="sub-admins" element={<AdminSubAdmins />} />
              <Route path="tables" element={<AdminTables />} />
              <Route path="orders" element={<AdminOrders />} />


            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
