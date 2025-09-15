// src/App.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./App.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Portfoyler from "./pages/Portfoyler";
import IlanDetay from "./pages/IlanDetay";
import FeaturedGrid from "./components/FeaturedGrid";

import { fetchListings } from "./lib/api";
import type { ListingRow } from "./lib/api";
import { loadFeaturedCache, saveFeaturedCache } from "./lib/cache";

/* Basit hash router */
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

  // Bölümler görünür olduğunda animasyonu tetikleyen Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    const els = document.querySelectorAll<HTMLElement>(".reveal");
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [route]);

  // Çevrimdışı/çevrimiçi durum göstergesi
  const [online, setOnline] = useState<boolean>(navigator.onLine);
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

  // Ana sayfadaki "Öne Çıkan Portföyler" için Supabase verisi (+ cache)
  const [featured, setFeatured] = useState<ListingRow[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    setFeaturedError(null);
    try {
      const { items } = await fetchListings({
        page: 1,
        pageSize: 6,
        order: "new",
        type: "All",
      });
      setFeatured(items);
      saveFeaturedCache({ items });
    } catch (e: any) {
      console.error(e);
      setFeaturedError(e?.message || String(e));
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  useEffect(() => {
    // 1) Son iyi veriyi anında göster
    const cached = loadFeaturedCache<{ items: ListingRow[] }>();
    if (cached?.items?.length) setFeatured(cached.items);

    // 2) Arkadan tazele
    void loadFeatured();
  }, [loadFeatured]);

  const year = useMemo(() => new Date().getFullYear(), []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Nuray Keser",
    image: "https://example.com/logo.jpg",
    url: "https://example.com",
    telephone: "+90 555 111 22 33",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mahalle, Cadde No:1",
      addressLocality: "İlçe",
      addressRegion: "Şehir",
      addressCountry: "TR",
    },
    areaServed: ["İstanbul", "Ankara", "İzmir"],
    description: "Lüks konut, ticari gayrimenkul ve yatırım danışmanlığı.",
  };

  // Ana sayfa içi #servisler / #iletisim kaydırma
  useEffect(() => {
    if (route !== "/") return;

    const tryScrollToHash = (retries = 24) => {
      const h = window.location.hash;
      const targetId =
        h === "#servisler" ? "servisler" :
        h === "#iletisim"  ? "iletisim"  : null;

      if (!targetId) return;

      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (retries > 0) {
        setTimeout(() => tryScrollToHash(retries - 1), 50);
      }
    };

    const t = setTimeout(() => tryScrollToHash(), 0);
    return () => clearTimeout(t);
  }, [route]);

  // Rotalar
  if (route === "admin") {
    return (
      <>
        <Header />
        <Admin />
      </>
    );
  }

  if (route === "hakkimda") {
    return (
      <>
        <Header />
        <About />
      </>
    );
  }

  if (route === "portfoyler") {
    return (
      <>
        <Header />
        <Portfoyler />
      </>
    );
  }

  if (route.startsWith("ilan/")) {
    const id = route.split("/")[1] || "";
    return (
      <>
        <Header />
        <IlanDetay id={id} />
      </>
    );
  }

  const headerOffset = "88px";

  return (
    <>
      <Header />

      {/* Çevrimdışı uyarısı */}
      {!online && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: "#fef3c7",
            color: "#78350f",
            padding: "10px 16px",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Bağlantı kesildi. Yeniden bağlanınca veriler otomatik güncellenecek.
        </div>
      )}

      <main>
        {/* HERO */}
        <section className="section reveal">
          <Hero />
        </section>

        {/* ÖNE ÇIKAN PORTFÖYLER - Basit Izgara */}
        <section id="ilanlar" className="section reveal">
          <div className="container">
            <h2 className="title">Portföy</h2>
            <p className="subtitle">Seçilmiş konut ve ticari gayrimenkuller.</p>

            {loadingFeatured ? (
              <div className="card" style={{ padding: 16 }}>Yükleniyor…</div>
            ) : featuredError ? (
              <div className="card" style={{ padding: 16, color: "#b91c1c" }}>
                İlanlar yüklenemedi: {featuredError}
                <div style={{ marginTop: 12 }}>
                  <button className="btn" onClick={() => void loadFeatured()}>
                    Tekrar dene
                  </button>
                </div>
              </div>
            ) : featured.length === 0 ? (
              <div className="card" style={{ padding: 16 }}>
                Şu anda gösterilecek ilan bulunamadı.
              </div>
            ) : (
              <FeaturedGrid items={featured} />
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <a className="btn btn-primary" href="#/portfoyler">Tüm portföyü gör</a>
            </div>
          </div>
        </section>

        {/* HİZMETLER */}
        <section
          id="servisler"
          className="section reveal"
          style={{ scrollMarginTop: headerOffset }}
        >
          <div className="container about">
            <h2 className="title">Hizmetler</h2>
            <div className="services">
              <div className="service">
                <div className="tag" style={{ width: "max-content" }}></div>
                <h3>Satış &amp; Değerleme</h3>
                <p>Karşılaştırmalı pazar analizi ile doğru fiyat, hızlı satış.</p>
              </div>
              <div className="service">
                <div className="tag" style={{ width: "max-content" }}></div>
                <h3>Kiralama Yönetimi</h3>
                <p>Kiracı profili doğrulama, sözleşme ve teslim yönetimi.</p>
              </div>
              <div className="service">
                <div className="tag" style={{ width: "max-content" }}></div>
                <h3>Yatırım Danışmanlığı</h3>
                <p>Getiri odaklı portföy oluşturma ve bölge analizleri.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DANIŞAN YORUMLARI */}
        <section className="section reveal">
          <div className="container">
            <h2 className="title">Danışan Yorumları</h2>
            <div className="testimonials">
              <div className="testimonial">
                <p>"İlk görüşmeden satışa kadar her aşamada yanımızdaydı. Fiyatlama ve pazarlıkta profesyonelliği fark yaratıyor."</p>
                <p className="author">— A. Yılmaz</p>
              </div>
              <div className="testimonial">
                <p>"Kiracı seçimindeki titizlik ve süreç yönetimi sayesinde içim çok rahat. Teşekkürler!"</p>
                <p className="author">— B. Aksoy</p>
              </div>
            </div>
          </div>
        </section>

        {/* İLETİŞİM */}
        <section
          id="iletisim"
          className="section reveal"
          style={{ scrollMarginTop: headerOffset }}
        >
          <div className="container contact">
            <div className="info">
              <h2 className="title" style={{ marginBottom: 6 }}>İletişime Geçin</h2>
              <p className="subtitle">Soru, randevu veya ekspertiz talebi için formu doldurun ya da doğrudan arayın.</p>
              <div className="item"><div><div>E-posta</div><a href="mailto:nuray.keser@cb.com.tr">nuray.keser@cb.com.tr</a></div></div>
              <div className="item"><div><div>Telefon</div><a href="tel:+905397445120">+90 539 744 51 20</a></div></div>
              <div className="item"><div><div>Ofis</div><address style={{ fontStyle: "normal"}}>Yukarı Bahçelievler Mah. Kazakistan Cad. (4. Cad.) No:101/A Çankaya / Ankara</address></div></div>
            </div>

            <form action="mailto:nuray.keser@cb.com.tr" method="post" encType="text/plain">
              <div className="form-row">
                <div><label htmlFor="name">Ad Soyad</label><input id="name" name="Ad Soyad" placeholder="Adınız Soyadınız" required /></div>
                <div><label htmlFor="phone">Telefon</label><input id="phone" name="Telefon" placeholder="05xx xxx xx xx" inputMode="tel" pattern="[0-9+\\s]{10,}" /></div>
              </div>
              <div className="form-row">
                <div><label htmlFor="email">E-posta</label><input id="email" name="E-posta" type="email" placeholder="ornek@mail.com" required /></div>
                <div><label htmlFor="subject">Konu</label><input id="subject" name="Konu" placeholder="Talebinizin konusu" /></div>
              </div>
              <div><label htmlFor="msg">Mesajınız</label><textarea id="msg" name="Mesaj" rows={5} placeholder="Kısa bir mesaj bırakın" /></div>
              <div><button className="btn btn-primary" type="submit">Gönder</button></div>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="reveal">
        <div className="container foot">
          <div>
            <div className="brand" style={{ marginBottom: 8 }}>
              <span className="brand-logo" aria-hidden="true" />
            </div>
            <small>© <span>{year}</span> Doğa Ata Demir|Tüm hakları saklıdır.</small>
          </div>
          <div>
            <div style={{ color: "#cbd5e1", marginBottom: 8, fontWeight: 600 }}>Bağlantılar</div>
            <nav>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                <li><a href="#/portfoyler">Portföyler</a></li>
                <li><a href="#/hakkimda">Hakkımda</a></li>
                <li><a href="#servisler">Hizmetler</a></li>
                <li><a href="#iletisim">İletişim</a></li>
              </ul>
            </nav>
          </div>
          <div>
            <div style={{ color: "#cbd5e1", marginBottom: 8, fontWeight: 600 }}>Sosyal</div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="#">Instagram</a>
              <a href="#">LinkedIn</a>
              <a href="#">YouTube</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ✅ Sabit Aksiyon Butonları */}
      <div className="fab-wrap">
        <a className="fab phone" href="tel:+905397445120" title="Hemen Ara">📞</a>
        <a className="fab" href="https://wa.me/+905397445120" target="_blank" rel="noopener" title="WhatsApp ile yaz">💬</a>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

export default App;
