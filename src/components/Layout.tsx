import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { name: "Ana Sayfa", to: "/" },
  { name: "Portföyler", to: "/portfoyler" },
  { name: "Hakkımda", to: "/hakkimda" },
  { name: "İletişim", to: "/iletisim" },
];

const socialLinks = [
  {
    name: "Instagram",
    href: null as string | null, // gerçek link gelince buraya koy
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "LinkedIn",
    href: null as string | null,
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    name: "YouTube",
    href: null as string | null,
    icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `group relative text-[16px] font-medium tracking-[0.01em] transition-colors duration-300 ${
    isActive ? "text-[#112769]" : "text-[#4A5568] hover:text-[#112769]"
  }`;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAFA] text-[#0A1628]">
      {/* HEADER */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_0_0_rgba(17,39,105,0.08)] py-4"
            : "bg-white py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link to="/" className="group flex items-center" aria-label="Ana sayfa">
            <img
              src="/logo.png"
              alt="Nuray Keser Gayrimenkul"
              className="h-18 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.to} className={navLinkClass}>
                <span>{link.name}</span>
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-[#C5A572] group-hover:w-full transition-all duration-500"></span>
              </NavLink>
            ))}

            <a
              href="tel:+905397445120"
              className="group relative text-[15px] font-medium tracking-[0.05em] text-white px-9 py-3.5 overflow-hidden transition-all duration-500 shadow-sm hover:shadow-md"
            >
              <span className="absolute inset-0 bg-[#112769] transition-transform duration-500 group-hover:scale-105"></span>
              <span className="absolute inset-0 bg-[#C5A572] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
              <span className="relative z-10">Hemen Ara</span>
            </a>
          </nav>

          <button
            className="lg:hidden p-2 text-[#112769] hover:text-[#C5A572] transition-colors duration-300"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menüyü aç"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-500 lg:hidden ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-[#0A1628]/60 backdrop-blur-md"
          onClick={closeMobileMenu}
        />

        <div
          className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 flex justify-between items-center border-b border-[#112769]/5">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center" aria-label="Ana sayfa">
              <img src="/logo.png" alt="Nuray Keser Gayrimenkul" className="h-12 w-auto object-contain" />
            </Link>

            <button
              className="p-2 text-[#4A5568] hover:text-[#112769] transition-colors duration-300"
              onClick={closeMobileMenu}
              aria-label="Menüyü kapat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 flex flex-col px-6 py-8 gap-2">
            {navLinks.map((link, index) => (
              <NavLink
                key={link.name}
                to={link.to}
                onClick={closeMobileMenu}
                className="group relative py-4 border-b border-[#112769]/5 transition-colors duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[17px] font-light tracking-wide text-[#0A1628] group-hover:text-[#112769] transition-colors duration-300">
                    {link.name}
                  </span>
                  <svg
                    className="w-5 h-5 text-[#C5A572] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </NavLink>
            ))}
          </nav>

          <div className="p-6 border-t border-[#112769]/5 space-y-4">
            <a
              href="tel:+905397445120"
              className="group relative flex items-center justify-center w-full text-[15px] font-medium tracking-[0.05em] text-white px-8 py-4 overflow-hidden transition-all duration-500 shadow-sm"
            >
              <span className="absolute inset-0 bg-[#112769]"></span>
              <span className="absolute inset-0 bg-[#C5A572] translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +90 539 744 51 20
              </span>
            </a>

            <div className="text-center">
              <a
                href="mailto:nuray.keser@cb.com.tr"
                className="text-[14px] text-[#4A5568] hover:text-[#C5A572] transition-colors duration-300 tracking-wide"
              >
                nuray.keser@cb.com.tr
              </a>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 pt-[110px]">{children}</main>

      {/* FOOTER */}
      <footer className="bg-[#112769] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col">
                  <span className="text-[2rem] font-light text-white tracking-tight leading-none">
                    Nuray <span className="font-normal">Keser</span>
                  </span>
                  <span className="text-[10px] font-medium tracking-[0.25em] text-[#C5A572] uppercase mt-2">
                    Gayrimenkul Danışmanı
                  </span>
                </div>

                <p className="text-[15px] text-white/70 leading-relaxed font-light tracking-wide max-w-md">
                  Ankara&apos;nın prestijli bölgelerinde veriye dayalı, güvenilir ve şeffaf gayrimenkul danışmanlığı.
                  Yatırımlarınızı maksimize etmek için yanınızdayız.
                </p>

                <div className="flex gap-4 mt-2">
                  {socialLinks.map((social) =>
                    social.href ? (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group w-10 h-10 flex items-center justify-center border border-white/15 hover:border-[#C5A572] hover:bg-white/5 transition-all duration-300"
                        aria-label={social.name}
                      >
                        <svg
                          className="w-4 h-4 text-white/70 group-hover:text-[#C5A572] transition-colors duration-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d={social.icon} />
                        </svg>
                      </a>
                    ) : (
                      <span
                        key={social.name}
                        className="w-10 h-10 flex items-center justify-center border border-white/10 opacity-50 cursor-not-allowed"
                        aria-label={`${social.name} bağlantısı henüz eklenmedi`}
                        title={`${social.name} bağlantısı henüz eklenmedi`}
                      >
                        <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                          <path d={social.icon} />
                        </svg>
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-[12px] font-semibold tracking-[0.2em] text-[#C5A572] uppercase mb-6">
                Hızlı Bağlantılar
              </h3>
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <NavLink
                    key={`footer-${link.name}`}
                    to={link.to}
                    className="group text-[15px] font-light text-white/70 hover:text-white transition-colors duration-300 w-fit flex items-center gap-2"
                  >
                    <span className="w-0 h-[1px] bg-[#C5A572] group-hover:w-4 transition-all duration-300"></span>
                    {link.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-[12px] font-semibold tracking-[0.2em] text-[#C5A572] uppercase mb-6">
                İletişim
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">Telefon</span>
                  <a
                    href="tel:+905397445120"
                    className="text-[16px] font-light text-white/90 hover:text-[#C5A572] transition-colors duration-300 tracking-wide"
                  >
                    +90 539 744 51 20
                  </a>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">E-posta</span>
                  <a
                    href="mailto:nuray.keser@cb.com.tr"
                    className="text-[16px] font-light text-white/90 hover:text-[#C5A572] transition-colors duration-300 tracking-wide"
                  >
                    nuray.keser@cb.com.tr
                  </a>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">Adres</span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Yukarı+Bahçelievler+Mah.+Kazakistan+Cad.+No:101/A+Çankaya+Ankara"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <address className="not-italic text-[15px] font-light text-white/90 leading-relaxed tracking-wide group-hover:text-[#C5A572] transition-colors duration-300">
                      Yukarı Bahçelievler Mah.
                      <br />
                      Kazakistan Cad. (4. Cad.) No:101/A
                      <br />
                      Çankaya / Ankara
                    </address>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[13px] text-white/50 tracking-wide">
              © {currentYear} Nuray Keser. Tüm hakları saklıdır.
            </p>

            <div className="flex items-center gap-2 text-[13px] text-white/50">
              <span>Developed by</span>
              <span className="text-[#C5A572] font-medium">Doğa Ata Demir</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;