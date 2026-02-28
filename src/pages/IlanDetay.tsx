import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatTRY } from "../lib/utils";
import { supabase } from "../lib/supabase";

interface IlanDetayProps {
  id: string;
}

type ListingImage = { url: string; idx: number | null };

const IlanDetay: React.FC<IlanDetayProps> = ({ id }) => {
  const [listing, setListing] = useState<any | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select(
            `
            *,
            listing_images (url, idx)
          `
          )
          .eq("id", id)
          .single();

        if (error) throw error;

        if (!alive) return;

        if (data) {
          setListing(data);

          const li: ListingImage[] = Array.isArray(data.listing_images) ? data.listing_images : [];
          const sorted = [...li].sort((a, b) => (a?.idx ?? 0) - (b?.idx ?? 0));
          setImages(sorted);
        } else {
          setListing(null);
          setImages([]);
        }
      } catch (e) {
        console.error("Yükleme hatası:", e);
        if (!alive) return;
        setListing(null);
        setImages([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadData();

    return () => {
      alive = false;
    };
  }, [id]);

  // Teknik özellikler
  const specList = useMemo(() => {
    if (!listing?.specs) return [];
    return Object.entries(listing.specs)
      .filter(([key, value]) => value !== null && value !== undefined && String(value).trim() !== "" && key !== "priceLine")
      .map(([key, value]) => ({
        label: key
          .replace(/[_-]+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toUpperCase(),
        val: String(value),
      }));
  }, [listing]);

  // İlan detay sayfası SEO yönetimi
  useEffect(() => {
    const setMeta = (selector: string, attr: "content" | "href", value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    const removeSchema = () => {
      const old = document.getElementById("listing-jsonld");
      if (old) old.remove();
    };

    // yüklenirken / ilan yokken fallback
    if (loading || !listing) {
      const fallbackTitle = "İlan Detayı | Nuray Keser Gayrimenkul Danışmanı";
      const fallbackDescription =
        "Gayrimenkul ilan detaylarını inceleyin. Fiyat, konum, teknik özellikler ve iletişim bilgileri için detay sayfasını görüntüleyin.";
      const fallbackUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;

      document.title = fallbackTitle;
      setMeta('meta[name="description"]', "content", fallbackDescription);
      setMeta('meta[property="og:title"]', "content", fallbackTitle);
      setMeta('meta[property="og:description"]', "content", fallbackDescription);
      setMeta('meta[property="og:url"]', "content", fallbackUrl);
      setMeta('meta[name="twitter:title"]', "content", fallbackTitle);
      setMeta('meta[name="twitter:description"]', "content", fallbackDescription);

      // canonical fallback: root
      setMeta('link[rel="canonical"]', "href", `${window.location.origin}/`);

      removeSchema();
      return;
    }

    const locationText = [listing.district, listing.city].filter(Boolean).join(" / ");
    const imageUrl = images[0]?.url || listing.cover_url || `${window.location.origin}/og-image.jpg`;

    const shortDescriptionBase =
      listing.description?.trim() || "Detaylı bilgi ve randevu için lütfen iletişime geçiniz.";

    const metaDescription = [
      listing.title,
      locationText ? `${locationText} konumunda` : "",
      listing.type ? `${String(listing.type).toLowerCase()} ilan` : "gayrimenkul ilanı",
      listing.rooms ? `${listing.rooms}` : "",
      listing.sqm_net ? `${listing.sqm_net} m² net` : "",
      shortDescriptionBase,
    ]
      .filter(Boolean)
      .join(". ")
      .replace(/\s+/g, " ")
      .slice(0, 300);

    const pageTitle = [listing.title, locationText || null, "Nuray Keser"].filter(Boolean).join(" | ");

    // ✅ Hashsiz gerçek path canonical
    const canonicalUrl = `${window.location.origin}/ilan/${id}`;
    const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;

    document.title = pageTitle;

    setMeta('meta[name="description"]', "content", metaDescription);
    setMeta('meta[property="og:title"]', "content", pageTitle);
    setMeta('meta[property="og:description"]', "content", metaDescription);
    setMeta('meta[property="og:url"]', "content", currentUrl);
    setMeta('meta[property="og:image"]', "content", imageUrl);
    setMeta('meta[name="twitter:title"]', "content", pageTitle);
    setMeta('meta[name="twitter:description"]', "content", metaDescription);
    setMeta('meta[name="twitter:image"]', "content", imageUrl);
    setMeta('link[rel="canonical"]', "href", canonicalUrl);

    // schema temizle
    removeSchema();

    // ✅ Gayrimenkul için daha uygun schema: RealEstateListing
    const schemaData: any = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: listing.title,
      description: metaDescription,
      url: canonicalUrl,
      image: [imageUrl],
      datePosted: listing.created_at || undefined,
      offers: {
        "@type": "Offer",
        priceCurrency: "TRY",
        price: listing.price_tl || 0,
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
      },
      areaServed: listing.city || "Türkiye",
      // Emlakçı bilgisi (basit)
      provider: {
        "@type": "RealEstateAgent",
        name: "Nuray Keser",
        telephone: "+90 539 744 51 20",
        email: "nuray.keser@cb.com.tr",
      },
      additionalProperty: specList.map((spec) => ({
        "@type": "PropertyValue",
        name: spec.label,
        value: spec.val,
      })),
    };

    const script = document.createElement("script");
    script.id = "listing-jsonld";
    script.type = "application/ld+json";
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => removeSchema();
  }, [id, listing, images, specList, loading]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== activeImage) setActiveImage(newIndex);
  };

  const scrollToImage = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
    setActiveImage(index);
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-[#8B92A4] font-light tracking-widest uppercase italic">
        İlan Detayları Hazırlanıyor...
      </div>
    );
  }

  if (!listing) {
    return <div className="py-32 text-center text-[#8B92A4]">İlan bulunamadı.</div>;
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* ÜST BİLGİ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <Link
              to="/portfoyler"
              className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[#8B92A4] hover:text-[#112769] transition-colors mb-4 group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Portföye Dön
            </Link>

            <h1 className="text-[2rem] md:text-[2.5rem] font-extralight text-[#0A1628] tracking-tight leading-tight italic">
              {listing.title}
            </h1>

            <div className="text-[12px] text-[#8B92A4] tracking-widest uppercase font-medium">
              {listing.district} / {listing.city}
            </div>
          </div>

          <div className="text-[2rem] font-light text-[#112769] tracking-tighter">{formatTRY(listing.price_tl)}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 flex flex-col gap-12">
            {/* GALERİ */}
            <div className="flex flex-col gap-4 group/gallery">
              <div className="relative aspect-[16/10] md:aspect-[16/9] bg-[#E8E9EC] overflow-hidden shadow-sm">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
                >
                  {images.length > 0 ? (
                    images.map((img, i) => (
                      <div key={i} className="w-full h-full shrink-0 snap-center">
                        <img
                          src={img.url}
                          alt={`${listing.title} - Görsel ${i + 1}`}
                          className="w-full h-full object-cover select-none"
                          loading="lazy"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full shrink-0">
                      <img
                        src={listing.cover_url || ""}
                        className="w-full h-full object-cover"
                        alt={listing.title || "Kapak Görseli"}
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1 tracking-widest uppercase z-10">
                  {activeImage + 1} / {images.length || 1}
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1 shrink-0">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToImage(i)}
                      className={`relative shrink-0 w-24 md:w-32 aspect-[4/3] transition-all duration-500 border-2 ${
                        activeImage === i ? "border-[#C5A572] opacity-100 scale-95" : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                      aria-label={`Görsel ${i + 1}`}
                      type="button"
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt={`${listing.title} küçük görsel ${i + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TEKNİK ÖZELLİKLER */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[1.25rem] font-light text-[#0A1628] tracking-tight border-b border-[#112769]/10 pb-4 uppercase tracking-[0.1em]">
                Teknik Özellikler
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
                {specList.map((spec, i) => (
                  <div key={i} className="flex flex-col gap-1 pb-2 border-b border-slate-50">
                    <span className="text-[9px] font-bold tracking-widest text-[#8B92A4] uppercase">{spec.label}</span>
                    <span className="text-[14px] font-medium text-[#112769]">{spec.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AÇIKLAMA */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[1.25rem] font-light text-[#0A1628] tracking-tight border-b border-[#112769]/10 pb-4 uppercase tracking-[0.1em]">
                İlan Açıklaması
              </h3>

              <p className="text-[16px] text-[#4A5568] leading-[1.9] font-light tracking-wide whitespace-pre-line italic">
                {listing.description || "Detaylı bilgi ve randevu için lütfen iletişime geçiniz."}
              </p>
            </div>
          </div>

          {/* SAĞ TARAF */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-8">
            <div className="bg-[#112769] p-10 text-white flex flex-col gap-8 shadow-2xl shadow-[#112769]/10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C5A572] rounded-full blur-[100px] opacity-10"></div>

              <div className="relative z-10 flex flex-col items-center text-center gap-5">
                <div className="w-28 h-28 rounded-full border border-[#C5A572]/30 p-1.5 bg-white/5 shadow-inner">
                  <img src="/NurayKeser.jpg" className="w-full h-full object-cover rounded-full shadow-lg" alt="Nuray Keser" />
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-[1.5rem] font-light tracking-tight">Nuray Keser</h4>
                  <span className="text-[11px] font-medium tracking-[0.25em] text-[#C5A572] uppercase">
                    Gayrimenkul Danışmanı
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                <a
                  href="tel:+905397445120"
                  className="group relative w-full py-4 bg-white text-[#112769] text-[12px] font-bold tracking-widest uppercase flex items-center justify-center gap-3 overflow-hidden transition-all duration-500 hover:text-white"
                >
                  <span className="absolute inset-0 bg-[#C5A572] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
                  <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="relative z-10">Hemen Ara</span>
                </a>

                <a
                  href="https://wa.me/905397445120"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 border border-white/20 text-white text-[12px] font-bold tracking-widest uppercase flex items-center justify-center gap-3 hover:border-[#C5A572] hover:text-[#C5A572] transition-all duration-500"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.135-1.348a9.944 9.944 0 004.877 1.28h.005c5.507 0 9.99-4.478 9.99-9.985 0-2.667-1.037-5.176-2.925-7.062a9.94 9.94 0 00-7.07-2.923z" />
                  </svg>
                  WhatsApp İle Yaz
                </a>
              </div>
            </div>

            <div className="bg-white p-8 border border-[#112769]/5 shadow-sm">
              <h5 className="text-[11px] font-bold tracking-[0.2em] text-[#112769] uppercase mb-6">Mülk Konumu</h5>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#C5A572]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>

                <span className="text-[14px] text-[#4A5568] font-light leading-relaxed">
                  {listing.district} / {listing.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IlanDetay;