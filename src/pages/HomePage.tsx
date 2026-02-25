import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { loadFeaturedCache, saveFeaturedCache, formatTRY } from "../lib/utils";
import { supabase } from "../lib/supabase"; // Fotoğrafları çekmek için eklendi

const testimonials = [
  {
    text: "İlk görüşmeden satışa kadar her aşamada yanımızdaydı. Profesyonel yaklaşımı ve pazar bilgisi sayesinde beklediğimden daha hızlı ve karlı bir satış gerçekleştirdik.",
    author: "A. Yılmaz",
    role: "Daire Satışı"
  },
  {
    text: "Kiracı seçimindeki titizliği ve süreç yönetimi içimi çok rahatlattı. Düzenli bilgilendirme ve sorunsuz iletişim için kendisine çok teşekkür ederim.",
    author: "B. Aksoy",
    role: "Kiralama"
  },
  {
    text: "Yatırım amaçlı ticari mülk arayışımızda nokta atışı portföyler sundu. Veriye dayalı detaylı analizleri sayesinde çok karlı bir yatırım yaptık.",
    author: "C. Demir",
    role: "Ticari Yatırım"
  },
  {
    text: "Şehir dışından ev alırken tüm süreci o kadar şeffaf ve güvenilir yönetti ki, gözümüz hiç arkada kalmadı. Kesinlikle herkese tavsiye ediyorum.",
    author: "D. Kaya",
    role: "Konut Alımı"
  },
  {
    text: "Bölgeye hakimiyeti ve dijital pazarlama stratejisi tek kelimeyle mükemmel. Aylardır satılamayan mülkümüzü doğru fiyatlama ile çok kısa sürede sattı.",
    author: "E. Şahin",
    role: "Villa Satışı"
  }
];

const HomePage: React.FC = () => {
  // Sayfa İçi Animasyonları (Scroll Reveal)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-12");
            entry.target.classList.add("opacity-100", "translate-y-0");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );

    const els = document.querySelectorAll<HTMLElement>(".js-reveal");
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const revealClass = "js-reveal opacity-0 translate-y-12 transition-all duration-[1200ms] ease-out";
  const headerOffset = "88px";

  // Portföy Verisi
  const [featured, setFeatured] = useState<any[]>([]); // Fotoğraf objelerini içerebilmesi için tip güncellendi
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    setFeaturedError(null);
    try {
      // Fotoğrafların (listing_images) gelmesi için doğrudan supabase sorgusu kullanıldı
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          listing_images (url, idx)
        `)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;

      setFeatured(data || []);
      saveFeaturedCache({ items: data || [] });
    } catch (e: any) {
      console.error(e);
      setFeaturedError(e?.message || String(e));
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  useEffect(() => {
    const cached = loadFeaturedCache<{ items: any[] }>();
    if (cached?.items?.length) setFeatured(cached.items);
    void loadFeatured();
  }, [loadFeatured]);

  const featuredList = useMemo(() => featured.slice(0, 8), [featured]);

  // Sayfa İçi Menü Kaydırma
  useEffect(() => {
    const tryScrollToHash = (retries = 24) => {
      const h = window.location.hash;
      const targetId = h === "#servisler" ? "servisler" : h === "#iletisim" ? "iletisim" : null;
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
  }, []);

  // Yorumlar (Testimonials) Slider Mantığı
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let intervalId: ReturnType<typeof setInterval>;

    const startAutoPlay = () => {
      intervalId = setInterval(() => {
        const { scrollLeft, scrollWidth, clientWidth } = slider;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          slider.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = slider.firstElementChild?.clientWidth || 0;
          slider.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
        }
      }, 5000);
    };

    startAutoPlay();
    const pauseAutoPlay = () => clearInterval(intervalId);

    slider.addEventListener("mouseenter", pauseAutoPlay);
    slider.addEventListener("mouseleave", startAutoPlay);
    slider.addEventListener("touchstart", pauseAutoPlay, { passive: true });
    slider.addEventListener("touchend", startAutoPlay, { passive: true });

    return () => {
      clearInterval(intervalId);
      slider.removeEventListener("mouseenter", pauseAutoPlay);
      slider.removeEventListener("mouseleave", startAutoPlay);
      slider.removeEventListener("touchstart", pauseAutoPlay);
      slider.removeEventListener("touchend", startAutoPlay);
    };
  }, []);

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, firstElementChild } = sliderRef.current;
    const cardWidth = firstElementChild?.clientWidth || 0;
    const index = Math.round(scrollLeft / (cardWidth + 24));
    setActiveSlide(index);
  };

  return (
    <div className="bg-[#FAFAFA]">
      {/* HERO SECTION */}
      <section className={`py-20 md:py-32 bg-white ${revealClass}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
            
            <div className="lg:col-span-7 flex flex-col gap-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-[1px] bg-[#C5A572]"></div>
                <span className="text-[11px] font-medium tracking-[0.2em] text-[#112769] uppercase">Gayrimenkul Danışmanı</span>
              </div>

              <h1 className="text-[clamp(2.75rem,6vw,5rem)] font-extralight leading-[1.05] text-[#0A1628] tracking-tight">
                Yatırımınızın<br />
                <span className="font-light italic text-[#112769]">Değerini</span> Maksimize Edin
              </h1>

              <p className="text-[17px] text-[#4A5568] leading-[1.75] font-light max-w-lg tracking-wide">
                Ankara'nın prestijli bölgelerinde lüks konut ve ticari gayrimenkul portföyü yönetimi. 
                Veriye dayalı stratejiler ile yatırımlarınızı güvence altına alıyoruz.
              </p>

              <div className="flex flex-wrap gap-12 mt-2">
                {[
                  { val: "5+", lbl: "YIL DENEYİM" },
                  { val: "₺250M+", lbl: "PORTFÖY" },
                  { val: "%100", lbl: "MEMNUNİYET" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="text-[2.5rem] font-extralight text-[#112769] tracking-tight">{stat.val}</div>
                    <div className="text-[10px] font-semibold tracking-[0.15em] text-[#8B92A4]">{stat.lbl}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-6 mt-6 items-center">
                <a 
                  href="#ilanlar" 
                  className="group relative text-[13px] font-medium tracking-[0.05em] text-white px-10 py-5 overflow-hidden transition-all duration-500"
                >
                  <span className="absolute inset-0 bg-[#112769] transition-transform duration-500 group-hover:scale-105"></span>
                  <span className="absolute inset-0 bg-[#C5A572] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
                  <span className="relative z-10">PORTFÖYÜ KEŞFET</span>
                </a>
                <a 
                  href="#iletisim" 
                  className="group text-[13px] font-medium tracking-[0.05em] text-[#112769] relative pb-1 transition-colors duration-300"
                >
                  <span className="relative z-10">İletişime Geç</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C5A572] group-hover:w-full transition-all duration-500"></span>
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#112769] group-hover:w-0 transition-all duration-500"></span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#112769]/5 to-[#C5A572]/5 blur-2xl"></div>
                <img
                  src="/NurayKeser.jpg"
                  alt="Nuray Keser"
                  className="relative w-full h-auto aspect-[3/4] object-cover shadow-2xl shadow-[#112769]/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PORTFÖYLER SECTION */}
      <section id="ilanlar" className={`py-24 md:py-32 ${revealClass}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-16 pb-8 border-b border-[#112769]/10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-[#C5A572]"></div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8B92A4] uppercase">Öne Çıkan İlanlar</span>
              </div>
              <h2 className="text-[2.5rem] font-extralight text-[#0A1628] tracking-tight">Seçilmiş Portföy</h2>
            </div>
            <a 
              href="#/portfoyler" 
              className="hidden sm:flex items-center gap-2 text-[12px] font-medium tracking-[0.05em] text-[#112769] group transition-colors duration-300"
            >
              <span className="relative">
                Tümünü Görüntüle
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C5A572] group-hover:w-full transition-all duration-500"></span>
              </span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {loadingFeatured ? (
            <div className="py-32 text-center text-[#8B92A4] font-light text-sm tracking-wide">Portföy yükleniyor...</div>
          ) : featuredError ? (
            <div className="py-32 text-center text-red-400 font-light text-sm">Yüklenemedi: {featuredError}</div>
          ) : featuredList.length === 0 ? (
            <div className="py-32 text-center text-[#8B92A4] font-light text-sm tracking-wide">Şu anda görüntülenecek ilan bulunmamaktadır.</div>
          ) : (
            <div className="relative">
              <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-12 pt-4 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {featuredList.map((it) => (
                  <a 
                    key={it.id} 
                    href={`#/ilan/${it.id}`} 
                    className="group shrink-0 snap-start flex flex-col w-[90%] sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] transition-all duration-700"
                  >
                    <div className="relative aspect-[4/3] bg-[#E8E9EC] overflow-hidden mb-6">
                      <div className="absolute inset-0 bg-[#112769]/0 group-hover:bg-[#112769]/10 transition-all duration-700 z-10"></div>
                      
                      {/* Görsel Mantığı: Cover yoksa ilk fotoğrafı göster */}
                      {(it.cover_url || (it.listing_images && it.listing_images.length > 0)) ? (
                        <img 
                          src={it.cover_url || it.listing_images[0].url} 
                          alt={it.title} 
                          loading="lazy" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#8B92A4] text-xs font-medium tracking-wide">Görsel Bekleniyor</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="text-[1.75rem] font-light text-[#112769] tracking-tight">{formatTRY(it.price_tl)}</div>
                      <h3 className="text-[15px] font-normal text-[#0A1628] line-clamp-1 m-0 tracking-wide">{it.title}</h3>
                      <div className="flex items-center gap-3 text-[11px] text-[#8B92A4] tracking-wider uppercase">
                        <span>{it.district}</span>
                        <span className="text-[#C5A572]">•</span>
                        <span>{it.rooms ?? "—"}</span>
                        {it.sqm_net && (
                          <>
                            <span className="text-[#C5A572]">•</span>
                            <span>{it.sqm_net} m²</span>
                          </>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-12 sm:hidden">
            <a 
              href="#/portfoyler" 
              className="flex items-center justify-center gap-2 text-[13px] font-medium tracking-[0.05em] text-[#112769] border border-[#112769]/20 py-5 hover:bg-[#112769] hover:text-white hover:border-[#112769] transition-all duration-500"
            >
              <span>Tüm Portföyü Görüntüle</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* HİZMETLER SECTION */}
      <section id="servisler" className={`py-24 md:py-40 bg-white ${revealClass}`} style={{ scrollMarginTop: headerOffset }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-[#C5A572]"></div>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8B92A4] uppercase">Hizmetlerimiz</span>
            </div>
            <h2 className="text-[2.5rem] font-extralight text-[#0A1628] tracking-tight max-w-2xl">
              Size Özel Çözümler
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20">
            {[
              { 
                num: "01", 
                title: "Satış & Değerleme", 
                desc: "Karşılaştırmalı pazar analizi ile doğru fiyat tespiti. Hedefe yönelik hızlı satış stratejileri ve profesyonel sunum." 
              },
              { 
                num: "02", 
                title: "Kiralama Yönetimi", 
                desc: "Doğru kiracı profili doğrulama ve referans kontrolü. Hukuki sözleşme süreçleri ve sorunsuz teslim yönetimi." 
              },
              { 
                num: "03", 
                title: "Yatırım Danışmanlığı", 
                desc: "Gelecek vadeden bölgelerde getiri odaklı portföy oluşturma. Detaylı pazar analizleri ve risk yönetimi." 
              }
            ].map((srv, i) => (
              <div key={i} className="group flex flex-col relative">
                <div className="absolute top-0 left-0 w-0 h-[1px] bg-[#C5A572] group-hover:w-16 transition-all duration-700"></div>
                <div className="pt-10 flex flex-col gap-6">
                  <span className="text-[#C5A572] font-light text-7xl opacity-20 leading-none">{srv.num}</span>
                  <h3 className="text-[1.5rem] font-light text-[#0A1628] tracking-tight">{srv.title}</h3>
                  <p className="text-[15px] text-[#4A5568] leading-[1.8] font-light tracking-wide">{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YORUMLAR (TESTIMONIALS) SECTION */}
      <section className={`py-24 md:py-40 bg-[#112769] text-white ${revealClass}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-[#C5A572]"></div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#C5A572] uppercase">Müşteri Görüşleri</span>
              </div>
              <h2 className="text-[2.5rem] font-extralight text-white tracking-tight">Danışanlarımız Ne Diyor?</h2>
            </div>
            
            <div className="hidden md:flex gap-4">
              <button 
                onClick={() => {
                  if(!sliderRef.current) return;
                  const cardWidth = sliderRef.current.firstElementChild?.clientWidth || 0;
                  sliderRef.current.scrollBy({ left: -(cardWidth + 24), behavior: "smooth" });
                }}
                className="w-12 h-12 flex items-center justify-center border border-white/20 hover:border-[#C5A572] hover:bg-white/5 transition-all duration-300 rounded-full"
                aria-label="Önceki Yorum"
              >
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => {
                  if(!sliderRef.current) return;
                  const cardWidth = sliderRef.current.firstElementChild?.clientWidth || 0;
                  sliderRef.current.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
                }}
                className="w-12 h-12 flex items-center justify-center border border-white/20 hover:border-[#C5A572] hover:bg-white/5 transition-all duration-300 rounded-full"
                aria-label="Sonraki Yorum"
              >
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative">
            <div 
              ref={sliderRef}
              onScroll={handleSliderScroll}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {testimonials.map((testimonial, i) => (
                <div 
                  key={i} 
                  className="shrink-0 snap-start flex flex-col justify-between w-[85%] md:w-[calc(50%-12px)] bg-white/5 border border-white/10 p-8 md:p-12 hover:bg-white/10 transition-colors duration-500"
                >
                  <div className="flex flex-col gap-8">
                    <svg className="w-10 h-10 text-[#C5A572] opacity-50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                    <p className="text-[16px] md:text-[17px] font-light leading-[1.9] text-white/90 tracking-wide">
                      "{testimonial.text}"
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 mt-10 pt-8 border-t border-white/10">
                    <p className="text-[13px] font-medium tracking-[0.1em] text-[#C5A572] uppercase m-0">{testimonial.author}</p>
                    <p className="text-[12px] font-light tracking-wide text-white/50 m-0">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center md:justify-start gap-3 mt-10">
              {testimonials.map((_, i) => {
                const isActive = activeSlide === i || (activeSlide > testimonials.length - 2 && i === testimonials.length - 2);
                
                return (
                  <button 
                    key={i}
                    onClick={() => {
                      if(!sliderRef.current) return;
                      const cardWidth = sliderRef.current.firstElementChild?.clientWidth || 0;
                      sliderRef.current.scrollTo({ left: (cardWidth + 24) * i, behavior: 'smooth' });
                    }}
                    className={`h-[3px] transition-all duration-500 rounded-full ${isActive ? 'w-10 bg-[#C5A572]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                    aria-label={`Yorum ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* İLETİŞİM SECTION */}
      <section id="iletisim" className={`py-24 md:py-40 bg-white ${revealClass}`} style={{ scrollMarginTop: headerOffset }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-24">
            
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-[1px] bg-[#C5A572]"></div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8B92A4] uppercase">İletişim</span>
              </div>
              
              <h2 className="text-[2.5rem] font-extralight text-[#0A1628] tracking-tight mb-6 leading-tight">
                Görüşelim
              </h2>
              
              <p className="text-[15px] text-[#4A5568] leading-[1.8] font-light mb-16 max-w-md tracking-wide">
                Gayrimenkul alım, satım veya yatırım danışmanlığı talepleriniz için benimle iletişime geçebilirsiniz.
              </p>
              
              <div className="flex flex-col gap-12">
                {[
                  { label: "E-POSTA", val: "nuray.keser@cb.com.tr", link: "mailto:nuray.keser@cb.com.tr" },
                  { label: "TELEFON", val: "+90 539 744 51 20", link: "tel:+905397445120" },
                  { label: "OFİS", val: "Yukarı Bahçelievler Mah. Kazakistan Cad. (4. Cad.) No:101/A Çankaya / Ankara", link: "https://maps.google.com/?q=Yukarı+Bahçelievler+Kazakistan+Caddesi+No:101/A"}
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-3 group">
                    <div className="text-[10px] font-semibold tracking-[0.2em] text-[#8B92A4]">{item.label}</div>
                    {item.link ? (
                      <a 
                        href={item.link} 
                        className="text-[17px] font-light text-[#112769] hover:text-[#C5A572] transition-colors duration-300 w-fit tracking-wide"
                      >
                        {item.val}
                      </a>
                    ) : (
                      <address className="not-italic text-[17px] font-light text-[#0A1628] max-w-sm leading-relaxed tracking-wide">
                        {item.val}
                      </address>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form 
              action="mailto:nuray.keser@cb.com.tr" 
              method="post" 
              encType="text/plain" 
              className="lg:col-span-7 flex flex-col gap-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="relative group">
                  <input 
                    id="name" 
                    name="Ad Soyad" 
                    placeholder="Adınız Soyadınız" 
                    required 
                    className="w-full pb-4 border-b border-[#112769]/10 bg-transparent outline-none text-[15px] text-[#0A1628] font-light placeholder-[#8B92A4] focus:border-[#C5A572] transition-colors duration-500 tracking-wide" 
                  />
                </div>
                <div className="relative group">
                  <input 
                    id="phone" 
                    name="Telefon" 
                    placeholder="Telefon Numaranız" 
                    inputMode="tel" 
                    className="w-full pb-4 border-b border-[#112769]/10 bg-transparent outline-none text-[15px] text-[#0A1628] font-light placeholder-[#8B92A4] focus:border-[#C5A572] transition-colors duration-500 tracking-wide" 
                  />
                </div>
              </div>
              
              <div className="relative group">
                <input 
                  id="email" 
                  name="E-posta" 
                  type="email" 
                  placeholder="E-posta Adresiniz" 
                  required 
                  className="w-full pb-4 border-b border-[#112769]/10 bg-transparent outline-none text-[15px] text-[#0A1628] font-light placeholder-[#8B92A4] focus:border-[#C5A572] transition-colors duration-500 tracking-wide" 
                />
              </div>
              
              <div className="relative group">
                <textarea 
                  id="msg" 
                  name="Mesaj" 
                  rows={5} 
                  placeholder="Mesajınızı buraya yazabilirsiniz..." 
                  className="w-full py-4 border-b border-[#112769]/10 bg-transparent outline-none text-[15px] text-[#0A1628] font-light placeholder-[#8B92A4] focus:border-[#C5A572] transition-colors duration-500 resize-none tracking-wide" 
                />
              </div>
              
              <button 
                type="submit" 
                className="group relative self-start text-[13px] font-medium tracking-[0.05em] text-white px-12 py-5 overflow-hidden transition-all duration-500 mt-4"
              >
                <span className="absolute inset-0 bg-[#112769] transition-transform duration-500 group-hover:scale-105"></span>
                <span className="absolute inset-0 bg-[#C5A572] translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                <span className="relative z-10 flex items-center gap-2">
                  MESAJ GÖNDER
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </form>

          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;