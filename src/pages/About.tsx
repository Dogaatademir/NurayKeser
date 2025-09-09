// src/pages/About.tsx
import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero"; // ✅ Eklendi
import "./About.css";

const bullets = [
  { t: "Danışmanlık & Analiz", d: "Portföy, pazar ve rakip analizi; hedef ve yol haritası." },
  { t: "Pazarlama & Konumlandırma", d: "CMA ile doğru fiyat, doğru alıcıya ulaşan kampanyalar." },
  { t: "Süreç Yönetimi", d: "Sözleşme, kredi ve tapu aşamalarında uçtan uca takip." },
];

const About: React.FC = () => {
  return (
    <>
      <Header />

      <main className="page">
        {/* HERO — App.tsx ile aynı kullanım */}
        <section className="section">
          <Hero />
        </section>

        {/* Özgeçmiş */}
        <section className="section about-section">
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
        <section className="section about-section">
          <div className="container">
            <h2 className="title">Profesyonel Yaklaşım</h2>
            <p className="subtitle">Her projeye özel, şeffaf ve veri odaklı çözümler.</p>

            <div className="about-grid">
              {/* Misyon + Vizyon (tek kart, iki başlık) */}
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

              {/* Çalışma Süreci */}
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
        <section className="section about-section">
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
        <section className="section about-section">
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

        {/* İletişim — App.css’teki `.contact` yapısıyla birebir */}
        <section id="iletisim" className="section about-section">
          <div className="container contact">
            <div className="info">
              <h2 className="title" style={{ marginBottom: 6 }}>İletişime Geçin</h2>
              <p className="subtitle">Soru, randevu veya ekspertiz talebi için formu doldurun ya da doğrudan arayın.</p>

              <div className="item">
                <div>
                  <div>E-posta</div>
                  <a href="mailto:nuray.keser@cb.com.tr">nuray.keser@cb.com.tr</a>
                </div>
              </div>

              <div className="item">
                <div>
                  <div>Telefon</div>
                  <a href="tel:+905397445120">+90 539 744 51 20</a>
                </div>
              </div>

              <div className="item">
                <div>
                  <div>Ofis</div>
                  <address style={{ fontStyle: "normal" }}>
                    Yukarı Bahçelievler Mah. Kazakistan Cad. (4. Cad.) No:101/A Çankaya / Ankara
                  </address>
                </div>
              </div>
            </div>

            <form action="mailto:nuray.keser@cb.com.tr" method="post" encType="text/plain">
              <div className="form-row">
                <div>
                  <label htmlFor="name">Ad Soyad</label>
                  <input id="name" name="Ad Soyad" placeholder="Adınız Soyadınız" required />
                </div>
                <div>
                  <label htmlFor="phone">Telefon</label>
                  <input
                    id="phone"
                    name="Telefon"
                    placeholder="05xx xxx xx xx"
                    inputMode="tel"
                    pattern="[0-9+\\s]{10,}"
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label htmlFor="email">E-posta</label>
                  <input id="email" name="E-posta" type="email" placeholder="ornek@mail.com" required />
                </div>
                <div>
                  <label htmlFor="subject">Konu</label>
                  <input id="subject" name="Konu" placeholder="Talebinizin konusu" />
                </div>
              </div>

              <div>
                <label htmlFor="msg">Mesajınız</label>
                <textarea id="msg" name="Mesaj" rows={5} placeholder="Kısa bir mesaj bırakın" />
              </div>

              <div>
                <button className="btn btn-primary" type="submit">Gönder</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
