import React, { useEffect, useMemo, useState } from "react";
import { formatTRY } from "../lib/utils";
import { supabase } from "../lib/supabase"; // Fotoğraflar için eklendi

const PAGE_SIZE = 12;

const Portfoyler: React.FC = () => {
  const [items, setItems] = useState<any[]>([]); // İlişkili veriler için tip esnetildi
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  // Sayfa değişiminde en üste yumuşak kaydırma
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        // Fotoğrafların (listing_images) gelmesi için doğrudan supabase sorgusu kullanıldı
        const { data, count, error } = await supabase
          .from("listings")
          .select(`
            *,
            listing_images (url, idx)
          `, { count: 'exact' })
          .order("created_at", { ascending: false })
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        if (error) throw error;

        if (!alive) return;
        setItems(data || []);
        setTotal(count || 0);
      } catch (e: any) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [page]);

  // Scroll Reveal Animasyonu
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-8");
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".js-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24">
      
      {/* HEADER SECTION */}
      <section className="py-16 md:py-24 bg-white border-b border-[#112769]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#C5A572]"></div>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8B92A4] uppercase">Emlak Portföyü</span>
            <div className="w-8 h-[1px] bg-[#C5A572]"></div>
          </div>
          <h1 className="text-[2.5rem] md:text-[3.5rem] font-extralight text-[#0A1628] tracking-tight mb-6">
            Tüm <span className="font-light italic text-[#112769]">İlanlar</span>
          </h1>
          <p className="text-[16px] text-[#4A5568] font-light max-w-xl mx-auto tracking-wide leading-relaxed">
            Seçkin konutlar, stratejik ticari mülkler ve yüksek getiri potansiyeline sahip yatırım fırsatları.
          </p>
        </div>
      </section>

      {/* LISTING GRID */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {loading ? (
            <div className="py-32 text-center text-[#8B92A4] font-light text-sm tracking-widest uppercase">
              İlanlar Hazırlanıyor...
            </div>
          ) : items.length === 0 ? (
            <div className="py-32 text-center text-[#8B92A4] font-light text-sm">
              Aranan kriterlere uygun kayıt bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {items.map((it) => (
                <article 
                  key={it.id} 
                  className="js-reveal opacity-0 translate-y-8 transition-all duration-[1000ms] ease-out flex flex-col group"
                >
                  <a href={`#/ilan/${it.id}`} className="flex flex-col gap-6">
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] bg-[#E8E9EC] overflow-hidden">
                      <div className="absolute inset-0 bg-[#112769]/0 group-hover:bg-[#112769]/10 transition-all duration-700 z-10"></div>
                      
                      {/* Type Badge */}
                      {it.type && (
                        <div className="absolute top-4 left-4 z-20">
                          <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-[#112769] text-[10px] font-bold tracking-widest uppercase shadow-sm">
                            {it.type}
                          </span>
                        </div>
                      )}

                      {/* GÜNCELLEME: Fotoğraf gösterme mantığı */}
                      {(it.cover_url || (it.listing_images && it.listing_images.length > 0)) ? (
                        <img 
                          src={it.cover_url || it.listing_images[0].url} 
                          alt={it.title} 
                          loading="lazy" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms] ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#8B92A4] text-xs font-medium tracking-wide">Görsel Bekleniyor</div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col gap-3">
                      <div className="text-[1.75rem] font-light text-[#112769] tracking-tight">
                        {formatTRY(it.price_tl)}
                      </div>
                      <h3 className="text-[16px] font-normal text-[#0A1628] line-clamp-1 m-0 tracking-wide">
                        {it.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-[11px] text-[#8B92A4] tracking-wider uppercase border-t border-[#112769]/5 pt-4">
                        <span>{it.district} / {it.city}</span>
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
                </article>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {pages > 1 && (
            <nav className="mt-24 flex items-center justify-center gap-8 border-t border-[#112769]/5 pt-12" aria-label="Sayfalama">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="group flex items-center gap-2 text-[12px] font-semibold tracking-widest uppercase text-[#112769] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Geri
              </button>
              
              <div className="flex items-center gap-4 text-[13px] font-light text-[#4A5568]">
                <span className="text-[#112769] font-medium">{page}</span>
                <span className="text-[#112769]/20">/</span>
                <span>{pages}</span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="group flex items-center gap-2 text-[12px] font-semibold tracking-widest uppercase text-[#112769] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                İleri
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
};

export default Portfoyler;