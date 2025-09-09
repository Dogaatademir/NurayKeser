// src/components/Header.tsx
import React, { useEffect, useRef, useState } from "react";

const Header: React.FC = () => {
  const [hash, setHash] = useState<string>(
    typeof window !== "undefined" ? window.location.hash || "#/" : "#/"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hedef bölüm ana sayfaya geçtikten sonra kaydırılsın diye bekletilecek değer
  const pendingSection = useRef<string | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      const newHash = window.location.hash || "#/";
      setHash(newHash);

      // Ana sayfaya geçiş tamamlandıysa bekleyen bölüme kaydır
      if (newHash === "#/" && pendingSection.current) {
        // Bölümün render olmasını beklemek için küçük bir deneme döngüsü
        const targetId = pendingSection.current;
        pendingSection.current = null;

        const tryScroll = (retries = 20) => {
          const el = document.getElementById(targetId!);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else if (retries > 0) {
            setTimeout(() => tryScroll(retries - 1), 50);
          }
        };

        // Menü kapanma animasyonu vs. varsa 0 ms sonra kuyruğa al
        setTimeout(() => tryScroll(), 0);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const nav = [
    { label: "Ana Sayfa",  href: "#/" },
    { label: "Hakkımda",   href: "#/hakkimda" },
    { label: "Portföy", href: "#/portfoyler" },
    { label: "Hizmetler",  href: "#servisler", noActive: true }, // asla aktif olmayacak
    { label: "İletişim",   href: "#iletisim",  noActive: true }, // asla aktif olmayacak
  ];

  // Sadece Ana Sayfa / Portföyler / Hakkımda aktif olabilir.
  const isActive = (itemHref: string, noActive?: boolean): boolean => {
    if (noActive) return false; // Hizmetler & İletişim hiçbir zaman aktif değil
    if (itemHref === "#/") {
      // Ana sayfa, hizmetler ve iletişim hash'lerinde aktif kalsın
      return hash === "#/" || hash === "#servisler" || hash === "#iletisim";
    }
    return hash === itemHref; // Portföyler & Hakkımda
  };

  const smoothScrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Mobil menüyü kapat
    setIsMobileMenuOpen(false);

    // Ana Sayfa: en üste
    if (href === "#/") {
      e.preventDefault();
      if (window.location.hash !== "#/") {
        window.location.hash = "#/";
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Portföyler ve Hakkımda sayfaları: hash değiştir ve en üste git
    if (href === "#/portfoyler" || href === "#/hakkimda") {
      e.preventDefault();
      if (window.location.hash !== href) {
        window.location.hash = href;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Hizmetler / İletişim: ana sayfa üzerindeki belirli bölümlere kaydır
    if (href === "#servisler" || href === "#iletisim") {
      e.preventDefault();
      const targetId = href.replace("#", ""); // "servisler" | "iletisim"

      // Zaten ana sayfadaysak doğrudan kaydır
      if (window.location.hash === "#/") {
        smoothScrollToId(targetId);
      } else {
        // Ana sayfaya dön ve bölüm yüklenince kaydır
        pendingSection.current = targetId;
        window.location.hash = "#/";
      }
      return;
    }

    // Diğerleri: doğal davranış
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((v) => !v);
  };

  return (
    <header className="site-header">
      <div className="container nav" role="navigation" aria-label="Ana menü">
        <a
          className="brand"
          href="#/"
          aria-label="Anasayfa"
          onClick={(e) => handleClick(e, "#/")}
        >
          <img
            src="/ColdwellLogo.png"
            alt="Coldwell Banker Logo"
            className="brand-logo"
            style={{ height: "40px", marginRight: "8px" }}
          />
          <span className="brand-name">Nuray Keser</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className={`nav-link${
                    isActive(item.href, (item as any).noActive) ? " active" : ""
                  }`}
                  aria-current={
                    isActive(item.href, (item as any).noActive) ? "page" : undefined
                  }
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Menüyü aç/kapat"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${isMobileMenuOpen ? "active" : ""}`}>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className={`nav-link${
                    isActive(item.href, (item as any).noActive) ? " active" : ""
                  }`}
                  aria-current={
                    isActive(item.href, (item as any).noActive) ? "page" : undefined
                  }
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
