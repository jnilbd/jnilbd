import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import MobileTabBar from "./MobileTabBar";
import ScrollToTop from "@/components/ScrollToTop";
import SiteRuntime from "@/components/SiteRuntime";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <SiteRuntime />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileTabBar />
    </div>
  );
};

export default Layout;
