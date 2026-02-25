import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Portfoyler from "./pages/Portfoyler";
import IlanDetay from "./pages/IlanDetay";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin"; // Yeni giriş sayfası eklendi
import { supabase } from "./lib/supabase";
import Contact from "./pages/Contact";

/* Basit Hash Router: URL'deki değişimleri izleyerek sayfa değiştirir */
function useHashRoute() {
  const [hash, setHash] = useState<string>(window.location.hash);
  
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const route = hash.replace(/^#\/?/, "");
  return route || "/";
}

const App: React.FC = () => {
  const route = useHashRoute();
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Sayfa her değiştiğinde tarayıcıyı en tepeye taşır
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  // Admin yetki kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email?.toLowerCase() ?? null;
      
      if (email) {
        const { data: adm } = await supabase
          .from("admins")
          .select("email")
          .eq("email", email)
          .maybeSingle();
        setIsAdmin(!!adm);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    };
    checkAuth();

    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email?.toLowerCase() ?? null;
      if (!email) {
        setIsAdmin(false);
      } else {
        checkAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Çevrimdışı durum takibi
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Aktif rotaya göre sayfa içeriğini döndüren fonksiyon
  const renderPage = () => {
    if (authLoading) return null; // Yetki kontrolü bitene kadar boş render

    if (route === "admin") {
      // Yetki varsa paneli, yoksa giriş ekranını göster
      return isAdmin ? <Admin /> : <AdminLogin />;
    }
    
    if (route === "hakkimda") return <About />;
    if (route === "portfoyler") return <Portfoyler />;
    if (route === "iletisim") return <Contact />;
    // İlan detay rotası kontrolü
    if (route.startsWith("ilan/")) {
      const id = route.split("/")[1] || "";
      return <IlanDetay id={id} />;
    }
    
    return <HomePage />;
  };

  return (
    <>
      {/* İnternet bağlantısı kesildiğinde çıkan uyarı barı - Her zaman en üstte kalabilir */}
      {!online && (
        <div role="status" aria-live="polite" className="bg-amber-100 text-amber-900 py-2.5 px-4 text-sm text-center font-medium fixed top-0 w-full z-[100] shadow-sm border-b border-amber-200">
          Bağlantı kesildi. Yeniden bağlanınca veriler otomatik güncellenecek.
        </div>
      )}

      {/* Admin sayfaları için Layoutsuz, diğer sayfalar için Layoutlu render */}
      {route === "admin" ? (
        <div className="min-h-screen bg-[#FAFAFA]">
          {renderPage()}
        </div>
      ) : (
        <Layout>
          {renderPage()}
        </Layout>
      )}
    </>
  );
};

export default App;