import React, { useEffect } from "react";

const Contact: React.FC = () => {
  // Sayfa İçi Animasyonlar (HomePage ile aynı tema)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-12");
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    const els = document.querySelectorAll(".js-reveal");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const revealClass = "js-reveal opacity-0 translate-y-12 transition-all duration-[1000ms] ease-out";

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* ÜST BAŞLIK (Hero-lite) */}
      <section className="bg-white py-20 border-b border-[#112769]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className={`flex flex-col gap-4 ${revealClass}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-[#C5A572]"></div>
              <span className="text-[11px] font-medium tracking-[0.2em] text-[#112769] uppercase">Bize Ulaşın</span>
            </div>
            <h1 className="text-[3rem] md:text-[4rem] font-extralight text-[#0A1628] tracking-tight leading-tight">
              İletişim & <span className="italic font-light text-[#C5A572]">Danışmanlık</span>
            </h1>
          </div>
        </div>
      </section>

      {/* İLETİŞİM İÇERİĞİ */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32">
            
            {/* SOL TARAF: İLETİŞİM BİLGİLERİ */}
            <div className={`lg:col-span-5 flex flex-col ${revealClass}`}>
              <h2 className="text-[1.5rem] font-light text-[#112769] tracking-tight mb-12 uppercase tracking-[0.1em]">
                İletişim Kanalları
              </h2>
              
              <div className="flex flex-col gap-12">
                {[
                  { 
                    label: "E-POSTA", 
                    val: "nuray.keser@cb.com.tr", 
                    link: "mailto:nuray.keser@cb.com.tr",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  },
                  { 
                    label: "TELEFON", 
                    val: "+90 539 744 51 20", 
                    link: "tel:+905397445120",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  },
                  { 
                    label: "OFİS ADRESİ", 
                    val: "Yukarı Bahçelievler Mah. Kazakistan Cad. (4. Cad.) No:101/A Çankaya / Ankara", 
                    link: "https://maps.google.com/?q=Yukarı+Bahçelievler+Kazakistan+Caddesi+No:101/A",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 shrink-0 border border-[#112769]/10 flex items-center justify-center text-[#C5A572] group-hover:bg-[#112769] group-hover:text-white transition-all duration-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold tracking-[0.2em] text-[#8B92A4] uppercase">{item.label}</span>
                      <a 
                        href={item.link} 
                        target={item.label === "OFİS ADRESİ" ? "_blank" : "_self"}
                        rel="noreferrer"
                        className="text-[16px] font-light text-[#0A1628] hover:text-[#C5A572] transition-colors duration-300 leading-relaxed tracking-wide"
                      >
                        {item.val}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SAĞ TARAF: FORM */}
            <div className={`lg:col-span-7 bg-white p-8 md:p-16 shadow-xl shadow-[#112769]/5 border border-[#112769]/5 ${revealClass}`}>
              <h3 className="text-[1.5rem] font-light text-[#0A1628] tracking-tight mb-10">Talep Formu</h3>
              
              <form 
                action="mailto:nuray.keser@cb.com.tr" 
                method="post" 
                encType="text/plain" 
                className="flex flex-col gap-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-[#8B92A4] tracking-widest uppercase">Ad Soyad</label>
                    <input 
                      name="Ad Soyad" 
                      required 
                      className="w-full pb-3 border-b border-[#112769]/10 outline-none text-[15px] font-light focus:border-[#C5A572] transition-colors bg-transparent"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-[#8B92A4] tracking-widest uppercase">Telefon</label>
                    <input 
                      name="Telefon" 
                      type="tel"
                      className="w-full pb-3 border-b border-[#112769]/10 outline-none text-[15px] font-light focus:border-[#C5A572] transition-colors bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8B92A4] tracking-widest uppercase">E-posta</label>
                  <input 
                    name="E-posta" 
                    type="email"
                    required 
                    className="w-full pb-3 border-b border-[#112769]/10 outline-none text-[15px] font-light focus:border-[#C5A572] transition-colors bg-transparent"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8B92A4] tracking-widest uppercase">Mesajınız</label>
                  <textarea 
                    name="Mesaj" 
                    rows={4}
                    className="w-full py-3 border-b border-[#112769]/10 outline-none text-[15px] font-light focus:border-[#C5A572] transition-colors resize-none bg-transparent"
                  />
                </div>

                <button 
                  type="submit" 
                  className="group relative self-start text-[12px] font-bold tracking-[0.1em] text-white px-12 py-5 overflow-hidden transition-all duration-500"
                >
                  <span className="absolute inset-0 bg-[#112769]"></span>
                  <span className="absolute inset-0 bg-[#C5A572] translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                  <span className="relative z-10">MESAJI GÖNDER</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* HARİTA BÖLÜMÜ */}
<section className="h-[500px] w-full bg-[#E8E9EC] relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
  <iframe
    title="Nuray Keser Ofis Konumu"
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3060.123456789!2d32.8315!3d39.9195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d34f0000000000%3a0x0!2zWXVrYXLEsSBCYWjDp2VsaWV2bGVyLCBLYXpha2lzdGFuIENhZC4gTm86MTAxLCBDYW5rYXlhL0Fua2FyYQ!5e0!3m2!1str!2str!4v1710000000000!5m2!1str!2str"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen={true}
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    className="absolute inset-0"
  ></iframe>
</section>
    </div>
  );
};

export default Contact;