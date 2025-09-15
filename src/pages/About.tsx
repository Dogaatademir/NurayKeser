import React, { useEffect } from "react";
import Header from "../components/Header";
import "./About.css";

const bullets = [
  { t: "Danışmanlık & Analiz", d: "Portföy, pazar ve rakip analizi; hedef ve yol haritası." },
  { t: "Pazarlama & Konumlandırma", d: "CMA ile doğru fiyat, doğru alıcıya ulaşan kampanyalar." },
  { t: "Süreç Yönetimi", d: "Sözleşme, kredi ve tapu aşamalarında uçtan uca takip." },
];

const About: React.FC = () => {
  useEffect(() => {
    // App.tsx'teki gibi Intersection Observer
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            obs.unobserve(entry.target); // sadece bir kere tetiklenmesi için
          }
        });
      },
      { threshold: 0.5, rootMargin: "0px 0px -5% 0px" }
    );

    const els = document.querySelectorAll<HTMLElement>(".reveal");
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <main className="page">
        {/* Özgeçmiş */}
        <section className="section about-section reveal from-bottom">
          <div className="container">
            <h2 className="title">Özgeçmiş</h2>
            <p className="subtitle">Güvene dayalı, veriye dayalı ve şeffaf danışmanlık.</p>
            <article className="about-card">
              <p className="about-text">
                Gayrimenkul dünyasına adım attığım ilk günden itibaren amacım; insanlara yalnızca bir
                taşınmaz değil, güven veren bir deneyim sunmak oldu. Kurumsal satış ve iletişim
                geçmişim, pazarlık ve süreç yönetimi becerilerimi güçlendirdi. 2014’ten bu yana,
                her portföyün bir sayıdan ibaret olmadığını; her evin ve dükkânın bir hikâyesi
                olduğunu bilerek çalışıyorum. Bugün; konut ve ticari gayrimenkulde uçtan uca süreç
                yönetimi, güçlü müzakere ve doğru alıcı profiline ulaşan pazarlama kampanyaları
                üretiyorum. Bölge analizleri ve karşılaştırmalı pazar analizi (CMA) ile gerçekçi fiyat
                konumlandırması yapıyor, resmi işlemleri titizlikle takip ediyorum. “Doğru bilgi doğru
                zamanda paylaşıldığında güven kendiliğinden oluşur” ilkesini benimsiyor; her yeni
                dosyada aynı özeni gösteriyorum. Bir evin anahtarını teslim etmek, bir yatırımın hedef
                getiriyi yakalaması ya da kiralamanın sorunsuz tamamlanması… Tüm bu anlar, yaptığım işe
                duyduğum motivasyonu her gün tazeliyor.
              </p>
            </article>
          </div>
        </section>

        {/* Profesyonel Yaklaşım */}
        <section className="section about-section reveal from-right">
          <div className="container">
            <h2 className="title">Profesyonel Yaklaşım</h2>
            <p className="subtitle">Her projeye özel, şeffaf ve veri odaklı çözümler.</p>
            <div className="about-grid">
              <article className="about-card">
                <h3 className="about-h3">Misyon</h3>
                <p className="about-text">
                  İhtiyacı doğru okumak, gerçekçi fiyatı belirlemek ve süreci şeffaf yönetmek.
                  Kısa vadeli kazanımlar yerine uzun soluklu güven ilişkisi kurmak; satıcı ve alıcı
                  tarafında huzurlu bir deneyim oluşturmak.
                </p>

                <div className="about-divider" />

                <h3 className="about-h3">Vizyon</h3>
                <p className="about-text">
                  Bölge uzmanlığı ve veriye dayalı stratejilerle, her portföy için ölçülebilir sonuçlar
                  üretmek; doğru alıcı profiline etkili pazarlama ile ulaşarak sürdürülebilir başarıyı
                  standart hâline getirmek.
                </p>

                <div className="about-tags" style={{ marginTop: 12 }}>
                  <span className="about-tag">CMA</span>
                  <span className="about-tag">Değerleme</span>
                  <span className="about-tag">Pazarlama</span>
                  <span className="about-tag">Müzakere</span>
                </div>
              </article>

              <article className="about-card">
                <div className="about-row">
                  <h3 className="about-h3">Çalışma Süreci</h3>
                  <span className="about-tag">Konut + Ticari</span>
                </div>
                <p className="about-muted">Net beklenti, net yol haritası, ölçülebilir sonuç.</p>

                <div className="about-bullets">
                  {bullets.map((s, i) => (
                    <div key={i} className="about-bullet">
                      <span className="about-dot" aria-hidden />
                      <div>
                        <h4 className="about-h4">{s.t}</h4>
                        <p className="about-muted">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Uzmanlık Alanları */}
        <section className="section about-section reveal from-left">
          <div className="container">
            <h2 className="title">Uzmanlık Alanları</h2>
            <div className="about-services">
              <div className="about-service">
                <div className="about-tag">Satış</div>
                <h3 className="about-service-title">Satış & Değerleme</h3>
                <p className="about-muted">Karşılaştırmalı pazar analizi ile doğru fiyat, hızlı ve güvenli satış.</p>
              </div>
              <div className="about-service">
                <div className="about-tag">Kiralama</div>
                <h3 className="about-service-title">Kiralama Yönetimi</h3>
                <p className="about-muted">Kiracı profili doğrulama, sözleşme ve teslim süreçlerinin yönetimi.</p>
              </div>
              <div className="about-service">
                <div className="about-tag">Yatırım</div>
                <h3 className="about-service-title">Yatırım Danışmanlığı</h3>
                <p className="about-muted">Getiri odaklı portföy oluşturma ve bölge analizleri.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Danışan Yorumları */}
        <section className="section about-section reveal from-right">
          <div className="container">
            <h2 className="title">Danışan Yorumları</h2>
            <div className="about-grid">
              <div className="about-card">
                <p className="about-quote">
                  "İlk görüşmeden satışa kadar her aşamada yanımızdaydı. Fiyatlama ve pazarlıkta profesyonelliği fark yaratıyor."
                </p>
                <p className="about-author">— A. Yılmaz</p>
              </div>
              <div className="about-card">
                <p className="about-quote">
                  "Kiracı seçimindeki titizlik ve süreç yönetimi sayesinde işim çok rahat. Teşekkürler!"
                </p>
                <p className="about-author">— B. Aksoy</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sabit Aksiyon Butonları */}
        <div className="fab-wrap">
          <a className="fab phone" href="tel:+905397445120" title="Hemen Ara">📞</a>
          <a className="fab" href="https://wa.me/+905397445120" target="_blank" rel="noopener" title="WhatsApp ile yaz">💬</a>
        </div>
      </main>
    </>
  );
};

export default About;
