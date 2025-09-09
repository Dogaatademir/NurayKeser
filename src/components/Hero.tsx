// src/components/Hero.tsx
import React from "react";

const Hero: React.FC = () => {
  return (
    <div className="container hero">
      <div>
        <h1>
          Yatırımda Doğru Adres<br />
          <span>Nuray Keser</span>
        </h1>

        <p className="muted">
          Lüks konut ve ticari gayrimenkulde güvenilir danışmanlık. Portföyünüzü
          büyütün, riskinizi azaltın, hedefinize hızla ulaşın.
        </p>

        <div className="pill-row" aria-label="Uzmanlık alanları">
          <span className="pill">Lüks Konut</span>
          <span className="pill">Ticari</span>
          <span className="pill">Yatırım</span>
          <span className="pill">Kiralama</span>
        </div>

        <div className="cta">
          <a className="btn btn-primary" href="#ilanlar">Portföyü Gör</a>
          <a className="btn btn-primary" href="#iletisim">İletişime Geç</a>
        </div>

        <div className="stats" aria-label="Güven göstergeleri">
          <div className="stat">
            <div className="val">+12</div>
            <div className="lbl">Yıllık Deneyim</div>
          </div>
          <div className="stat">
            <div className="val">%98</div>
            <div className="lbl">Memnuniyet</div>
          </div>
          <div className="stat">
            <div className="val">350+</div>
            <div className="lbl">Başarılı İşlem</div>
          </div>
        </div>
      </div>

      <div className="hero-card" aria-hidden="true">
        <img
          src="/NurayKeser.jpg"
          
        />
      </div>
    </div>
  );
};

export default Hero;
