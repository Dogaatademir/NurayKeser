import React, { useEffect } from "react";

const bullets = [
  { t: "Danışmanlık & Analiz", d: "Portföy, pazar ve rakip analizi; hedef ve yol haritası belirleme." },
  { t: "Pazarlama & Konumlandırma", d: "CMA ile doğru fiyat tespiti, doğru alıcıya ulaşan özel kampanyalar." },
  { t: "Süreç Yönetimi", d: "Sözleşme, kredi ve tapu aşamalarında uçtan uca şeffaf takip." },
];

const About: React.FC = () => {
  // Hakkımda sayfası SEO yönetimi (hashsiz)
  useEffect(() => {
    const title = "Hakkımda | Nuray Keser Gayrimenkul Danışmanı";
    const description =
      "Nuray Keser’in profesyonel geçmişi, çalışma yaklaşımı ve gayrimenkul danışmanlığındaki uzmanlık alanlarını inceleyin. Güvene ve veriye dayalı danışmanlık yaklaşımını keşfedin.";

    const canonicalUrl = `${window.location.origin}/hakkimda`;
    const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const imageUrl = `${window.location.origin}/og-image.jpg`;

    document.title = title;

    const setMeta = (selector: string, attr: "content" | "href", value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", currentUrl);
    setMeta('meta[property="og:image"]', "content", imageUrl);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", imageUrl);
    setMeta('link[rel="canonical"]', "href", canonicalUrl);
  }, []);

  // Kaydırma animasyonları
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-12");
            entry.target.classList.add("opacity-100", "translate-y-0");
            obs.unobserve(entry.target); // ✅ performans
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

  return (
    <div className="bg-[#FAFAFA]">
      {/* 1. BÖLÜM: ÖZGEÇMİŞ */}
      <section className={`py-20 md:py-32 bg-white ${revealClass}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-[1px] bg-[#C5A572]"></div>
                <span className="text-[11px] font-medium tracking-[0.2em] text-[#112769] uppercase">Özgeçmiş</span>
              </div>
              <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extralight leading-[1.1] text-[#0A1628] tracking-tight">
                Güvene ve Veriye Dayalı <br />
                <span className="font-light italic text-[#112769]">Danışmanlık</span>
              </h1>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6 text-[16px] text-[#4A5568] leading-[1.9] font-light tracking-wide">
              <p>
                1971 yılında Ankara’da doğdum. Anadolu Üniversitesi Halkla İlişkiler bölümünden mezunum. 20 yıl boyunca çok
                uluslu ilaç firmalarında görev aldım; bunun 15 yılını satış temsilcisi, 5 yılını ise ürün müdürü olarak
                tamamladım. Bu süreçte iletişim, pazarlama, stratejik planlama ve insan ilişkilerinde güven inşa etme
                konularında değerli deneyimler kazandım.
              </p>
              <p>
                2020 yılında gayrimenkul sektörüne RE/MAX bünyesinde adım attım. 2023 yılından bu yana ise Coldwell Banker
                bünyesinde profesyonel gayrimenkul danışmanı olarak hizmet veriyorum.
              </p>
              <p>
                Ayrıca profesyonel fotoğraf sanatçısı kimliğim, gayrimenkul sektöründeki çalışmalarımı farklı bir bakış
                açısıyla zenginleştiriyor. Estetik anlayışımı, sunum ve tanıtımlarda kullanarak, danışmanlık sürecine hem
                görsel hem de duygusal değer katıyorum.
              </p>
              <p className="font-medium text-[#112769] mt-2 border-l-2 border-[#C5A572] pl-6 py-2">
                Amacım, müşterilerime yalnızca bir gayrimenkul sunmak değil; aynı zamanda onların ihtiyaçlarına en uygun
                çözümü bulmak, güvenli bir süreç ve doğru yatırım fırsatları sağlamaktır. Şeffaf, çözüm odaklı ve profesyonel
                yaklaşımımla her müşterimin yanında olmaktan mutluluk duyuyorum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BÖLÜM */}
      <section className={`py-24 md:py-32 bg-[#FAFAFA] ${revealClass}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-[#C5A572]"></div>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8B92A4] uppercase">Profesyonel Yaklaşım</span>
            </div>
            <h2 className="text-[2.5rem] font-extralight text-[#0A1628] tracking-tight">Her Projeye Özel Şeffaf Çözümler</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-10 md:p-14 border border-[#112769]/5 shadow-sm flex flex-col justify-between transition-all duration-500 hover:shadow-xl hover:shadow-[#112769]/[0.03]">
              <div className="flex flex-col gap-12">
                <div>
                  <h3 className="text-[1.25rem] font-light text-[#112769] tracking-tight mb-4 uppercase tracking-[0.1em]">Misyon</h3>
                  <p className="text-[15px] text-[#4A5568] leading-[1.8] font-light tracking-wide m-0">
                    İhtiyacı doğru okumak, gerçekçi fiyatı belirlemek ve süreci şeffaf yönetmek. Kısa vadeli kazanımlar yerine
                    uzun soluklu güven ilişkisi kurmak; satıcı ve alıcı tarafında huzurlu bir deneyim oluşturmak.
                  </p>
                </div>

                <div className="w-full h-[1px] bg-[#112769]/10"></div>

                <div>
                  <h3 className="text-[1.25rem] font-light text-[#112769] tracking-tight mb-4 uppercase tracking-[0.1em]">Vizyon</h3>
                  <p className="text-[15px] text-[#4A5568] leading-[1.8] font-light tracking-wide m-0">
                    Bölge uzmanlığı ve veriye dayalı stratejilerle, her portföy için ölçülebilir sonuçlar üretmek; doğru alıcı
                    profiline etkili pazarlama ile ulaşarak sürdürülebilir başarıyı standart hâline getirmek.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#112769] p-10 md:p-14 shadow-xl shadow-[#112769]/10 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C5A572] rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>

              <div className="relative z-10 flex justify-between items-start mb-12">
                <h3 className="text-[1.75rem] font-light text-white tracking-tight">Çalışma Süreci</h3>
                <span className="px-4 py-2 border border-[#C5A572]/30 text-[#C5A572] text-[10px] uppercase tracking-widest font-medium">
                  Konut + Ticari
                </span>
              </div>

              <div className="relative z-10 flex flex-col gap-8">
                {bullets.map((s, i) => (
                  <div key={i} className="flex gap-5 group/item">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#C5A572] group-hover/item:scale-150 transition-transform duration-500"></div>
                      {i !== bullets.length - 1 && <div className="w-[1px] h-full bg-white/10 mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <h4 className="text-[16px] font-medium text-white tracking-wide mb-2 uppercase text-[13px] tracking-[0.1em]">
                        {s.t}
                      </h4>
                      <p className="text-[14px] font-light text-white/70 leading-[1.8]">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. BÖLÜM */}
      <section className={`py-24 md:py-32 bg-white ${revealClass}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-20 text-center flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-[#C5A572]"></div>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8B92A4] uppercase">Uzmanlık Alanları</span>
              <div className="w-8 h-[1px] bg-[#C5A572]"></div>
            </div>
            <h2 className="text-[2.5rem] font-extralight text-[#0A1628] tracking-tight">Odak Noktalarımız</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20">
            {[
              { tag: "Satış", title: "Satış & Değerleme", desc: "Karşılaştırmalı pazar analizi ile doğru fiyat, hızlı ve güvenli satış süreçleri." },
              { tag: "Kiralama", title: "Kiralama Yönetimi", desc: "Kiracı profili doğrulama, sözleşme takibi ve mülk teslim süreçlerinin profesyonel yönetimi." },
              { tag: "Yatırım", title: "Yatırım Danışmanlığı", desc: "Yüksek getiri potansiyelli bölgelerde veriye dayalı portföy oluşturma ve bölge analizleri." },
            ].map((srv, i) => (
              <div key={i} className="group flex flex-col items-center text-center">
                <span className="mb-8 px-5 py-2 border border-[#C5A572]/40 text-[#C5A572] text-[10px] uppercase tracking-widest font-medium bg-[#C5A572]/5 group-hover:bg-[#C5A572] group-hover:text-white transition-all duration-500">
                  {srv.tag}
                </span>
                <h3 className="text-[1.5rem] font-light text-[#0A1628] tracking-tight mb-4">{srv.title}</h3>
                <p className="text-[15px] text-[#4A5568] leading-[1.8] font-light tracking-wide">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;