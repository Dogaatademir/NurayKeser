import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Portfoyler from "./pages/Portfoyler";
import IlanDetay from "./pages/IlanDetay";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Contact from "./pages/Contact";
import { supabase } from "./lib/supabase";
import NotFound from "./pages/NotFound";

const App: React.FC = () => {
  const location = useLocation();

  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Sayfa değiştiğinde en üste çık
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  // Admin yetki kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

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

    void checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const email = session?.user?.email?.toLowerCase() ?? null;

      if (!email) {
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }

      const { data: adm } = await supabase
        .from("admins")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      setIsAdmin(!!adm);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Online / offline takibi
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

  const PageLoading = (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-sm text-[#8B92A4] tracking-widest uppercase">
      Yükleniyor...
    </div>
  );

  const PublicShell = ({ children }: { children: React.ReactNode }) => (
    <Layout>{children}</Layout>
  );

  const ListingDetailRoute = () => {
    const { id = "" } = useParams();
    return (
      <PublicShell>
        <IlanDetay id={id} />
      </PublicShell>
    );
  };

  return (
    <>
      {!online && (
        <div
          role="status"
          aria-live="polite"
          className="bg-amber-100 text-amber-900 py-2.5 px-4 text-sm text-center font-medium fixed top-0 w-full z-[100] shadow-sm border-b border-amber-200"
        >
          Bağlantı kesildi. Yeniden bağlanınca veriler otomatik güncellenecek.
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <PublicShell>
              <HomePage />
            </PublicShell>
          }
        />

        <Route
          path="/hakkimda"
          element={
            <PublicShell>
              <About />
            </PublicShell>
          }
        />

        <Route
          path="/portfoyler"
          element={
            <PublicShell>
              <Portfoyler />
            </PublicShell>
          }
        />

        <Route
          path="/iletisim"
          element={
            <PublicShell>
              <Contact />
            </PublicShell>
          }
        />

        <Route path="/ilan/:id" element={<ListingDetailRoute />} />

        <Route
          path="/admin"
          element={
            authLoading ? (
              PageLoading
            ) : isAdmin ? (
              <div className="min-h-screen bg-[#FAFAFA]">
                <Admin />
              </div>
            ) : (
              <Navigate to="/admin-login" replace />
            )
          }
        />

        <Route
          path="/admin-login"
          element={
            authLoading ? (
              PageLoading
            ) : isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <div className="min-h-screen bg-[#FAFAFA]">
                <AdminLogin />
              </div>
            )
          }
        />

       <Route
  path="*"
  element={
    <PublicShell>
      <NotFound />
    </PublicShell>
  }
/>
</Routes>
    </>
  );
};

export default App;