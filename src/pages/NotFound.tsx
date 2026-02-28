import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <section className="min-h-[calc(100vh-110px)] bg-[#FAFAFA] flex items-center">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-20 w-full">
        <div className="text-center">
          <span className="inline-block text-[12px] md:text-[13px] font-semibold tracking-[0.25em] text-[#C5A572] uppercase mb-6">
            Hata 404
          </span>

          <h1 className="text-[42px] md:text-[64px] leading-tight font-light text-[#0A1628] tracking-tight">
            Aradığınız sayfa <span className="font-normal text-[#112769]">bulunamadı</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-[16px] md:text-[18px] leading-relaxed text-[#4A5568] font-light">
            Ulaşmaya çalıştığınız bağlantı kaldırılmış, taşınmış veya hatalı yazılmış olabilir.
            Ana sayfaya dönebilir ya da portföyleri incelemeye devam edebilirsiniz.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="group relative inline-flex items-center justify-center min-w-[220px] px-8 py-4 text-[15px] font-medium tracking-[0.05em] text-white overflow-hidden transition-all duration-500 shadow-sm hover:shadow-md"
            >
              <span className="absolute inset-0 bg-[#112769] transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-[#C5A572] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10">Ana Sayfaya Dön</span>
            </Link>

            <Link
              to="/portfoyler"
              className="inline-flex items-center justify-center min-w-[220px] px-8 py-4 text-[15px] font-medium tracking-[0.05em] text-[#112769] border border-[#112769]/15 hover:border-[#C5A572] hover:text-[#C5A572] bg-white transition-all duration-300"
            >
              Portföyleri Gör
            </Link>
          </div>

          <div className="mt-14 flex items-center justify-center">
            <div className="w-full max-w-md border-t border-[#112769]/10 pt-8">
              <p className="text-[14px] text-[#8B92A4] tracking-wide">
                Yardıma mı ihtiyacınız var?
              </p>
              <a
                href="tel:+905397445120"
                className="mt-2 inline-block text-[18px] font-light text-[#112769] hover:text-[#C5A572] transition-colors duration-300 tracking-wide"
              >
                +90 539 744 51 20
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;