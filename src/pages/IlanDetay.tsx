// src/pages/IlanDetay.tsx
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./IlanDetay.css";

/* ---------- Supabase Client ---------- */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

/* ---------- Opsiyonel ilişkili görsel tablosu ---------- */
const REL_TABLE = import.meta.env.VITE_LISTING_IMAGES_TABLE as string | undefined;
const REL_URL_COL = (import.meta.env.VITE_LISTING_IMAGES_URL_COL as string | undefined) ?? "url";
const REL_FK_COL = (import.meta.env.VITE_LISTING_IMAGES_FK_COL as string | undefined) ?? "listing_id";
const REL_ORDER_COL = (import.meta.env.VITE_LISTING_IMAGES_ORDER_COL as string | undefined) ?? "sort";

/* ---------- Types ---------- */
type ListingRow = {
  id: string | number;
  title?: string | null;
  altText?: string | null;
  type?: string | null;
  price_tl?: number | null;
  cover_url?: string | null;

  rooms?: string | null;
  sqm_net?: number | null;
  sqm_brut?: number | null;
  open_area_sqm?: number | null;
  building_age?: number | null;
  floors?: number | null;
  heating?: string | null;
  bathrooms?: number | null;
  kitchen?: string | null;
  balcony?: string | null;
  furnished?: string | null;
  occupancy?: string | null;
  in_site?: string | null;
  site_name?: string | null;
  dues_tl?: number | null;
  loan_eligible?: string | null;
  deed_status?: string | null;
  from?: string | null;
  barter?: string | null;

  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  address?: string | null;

  listing_no?: string | null;
  listing_date?: string | null;

  images?: string[] | string | null;
  photos?: string[] | string | null;
  gallery?: string[] | string | null;
  image_urls?: string[] | string | null;
  photo_urls?: string[] | string | null;

  description?: string | null;

  [k: string]: any;
};

type Props = { id: string };

/* ---------- Helpers ---------- */
function formatPriceTL(v: number | string | null | undefined) {
  if (typeof v === "number" && Number.isFinite(v)) {
    return v.toLocaleString("tr-TR") + " TL";
  }
  const s = String(v ?? "").trim();
  if (!s) return "";
  const num = Number(s.replace(/\./g, "").replace(/,/g, ".").match(/\d+(\.\d+)?/)?.[0] ?? NaN);
  return Number.isFinite(num) ? num.toLocaleString("tr-TR") + " TL" : s;
}
const nonEmpty = (s?: string | null) => (s && String(s).trim().length ? String(s).trim() : "");

/** Trim + benzersiz */
function normalizeUrlList(list: any[]): string[] {
  return Array.from(
    new Set(
      list
        .map((s) => {
          try {
            return String(s ?? "").trim();
          } catch {
            return "";
          }
        })
        .filter(Boolean)
    )
  );
}

/** Karışık tiplerden URL listesi çıkarır */
function coerceUrlArray(val: unknown): string[] {
  const urls: string[] = [];
  const push = (u: unknown) => {
    if (u == null) return;
    if (typeof u === "object" && !Array.isArray(u)) {
      const o: any = u;
      const cand = o?.url ?? o?.href ?? o?.src ?? o?.path ?? o?.key;
      if (cand != null) urls.push(String(cand).trim());
      return;
    }
    urls.push(String(u ?? "").trim());
  };
  try {
    if (Array.isArray(val)) {
      val.forEach(push);
      return normalizeUrlList(urls);
    }
    if (val && typeof val === "object") {
      push(val);
      return normalizeUrlList(urls);
    }
    if (typeof val === "string") {
      const v = val.trim();
      if (!v) return [];
      if ((v.startsWith("[") && v.endsWith("]")) || (v.startsWith("{") && v.endsWith("}"))) {
        try {
          const parsed = JSON.parse(v);
          return coerceUrlArray(parsed);
        } catch {}
      }
      v.split(/[,;\n\r|]+/).forEach(push);
      return normalizeUrlList(urls);
    }
  } catch {}
  return [];
}

/** İlan satırından muhtemel tüm URL’leri topla */
function extractImageUrlsFromListing(row: ListingRow | null | undefined): string[] {
  if (!row) return [];
  const collected: string[] = [];
  ["images", "photos", "gallery", "image_urls", "photo_urls"].forEach((k) => {
    if (k in row) collected.push(...coerceUrlArray((row as any)[k]));
  });
  for (let i = 1; i <= 20; i++) {
    [`image${i}`, `photo${i}`].forEach((k) => {
      if (k in row) collected.push(...coerceUrlArray((row as any)[k]));
    });
  }
  if (row.cover_url) collected.push(row.cover_url);
  return normalizeUrlList(collected);
}

/* ---------- Component ---------- */
const IlanDetay: React.FC<Props> = ({ id }) => {
  const [ilan, setIlan] = useState<ListingRow | null>(null);
  const [relImages, setRelImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setErr(null);
      setRelImages([]);
      setActiveIdx(0);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .limit(1)
          .maybeSingle<ListingRow>();
        if (error) throw error;
        if (!mounted) return;
        setIlan(data ?? null);

        if (REL_TABLE) {
          try {
            let query = supabase
              .from(REL_TABLE)
              .select(REL_URL_COL)
              .eq(REL_FK_COL, id);
            if (REL_ORDER_COL) {
              query = (query as any).order(REL_ORDER_COL, { ascending: true });
            }
            const { data: imgs, error: imgsErr } = await query;
            if (!mounted) return;
            if (!imgsErr && Array.isArray(imgs)) {
              const list = imgs.map((r: any) => r?.[REL_URL_COL]).filter(Boolean).map((s: any) => String(s ?? "").trim());
              setRelImages(normalizeUrlList(list));
            }
          } catch {}
        }
      } catch (e: any) {
        if (mounted) {
          setErr(e?.message || "İlan yüklenemedi");
          setIlan(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [id]);

  const gallery = useMemo(() => {
    const fromRow = extractImageUrlsFromListing(ilan);
    const merged = normalizeUrlList([...fromRow, ...relImages]);
    if (activeIdx >= merged.length) setActiveIdx(0);
    return merged;
  }, [ilan, relImages, activeIdx]);

  const next = () => setActiveIdx((i) => (i + 1) % Math.max(gallery.length || 1, 1));
  const prev = () => setActiveIdx((i) => (i - 1 + Math.max(gallery.length || 1, 1)) % Math.max(gallery.length || 1, 1));

  const addressLine = nonEmpty(ilan?.address) || [ilan?.city, ilan?.district, ilan?.neighborhood].filter(Boolean).join(", ");
  const odasayisi = nonEmpty(ilan?.rooms);

  /* --------- Açıklama metni --------- */
  const descriptionText = useMemo(() => {
    const top = nonEmpty(ilan?.description);
    if (top) return top;

    const specs = (ilan as any)?.specs;
    if (specs && typeof specs === "object") {
      const keys = ["description", "Description", "aciklama", "Açıklama"];
      for (const k of keys) {
        const v = nonEmpty((specs as any)?.[k]);
        if (v) return v;
      }
    }
    return "";
  }, [ilan]);

  if (loading) return <main className="page"><div className="container">Yükleniyor…</div></main>;
  if (err || !ilan) return <main className="page"><div className="container">Hata: {err}</div></main>;

  return (
    <main className="page listing-detail">
      <section className="section">
        <div className="container">
          <h1 className="ld-heading">{ilan.title || ilan.altText || "Detaylı İlan Bilgisi"}</h1>

          <div className="ld-grid">
            {/* Sol — Galeri */}
            <article className="ld-media">
              <div className="ld-media-main">
                {gallery.length ? (
                  <img src={gallery[activeIdx]} alt={`Foto ${activeIdx + 1}`} className="ld-main-image" />
                ) : <div className="ld-noimage">Görsel yok</div>}
                {gallery.length > 1 && (
                  <>
                    <button className="ld-prev" onClick={prev}>‹</button>
                    <button className="ld-next" onClick={next}>›</button>
                  </>
                )}
                <div className="ld-counter">{activeIdx + 1}/{gallery.length} Fotoğraf</div>
              </div>

              {gallery.length > 1 && (
                <div className="ld-thumbs">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      className={`ld-thumb ${i === activeIdx ? "is-active" : ""}`}
                      onClick={() => setActiveIdx(i)}
                    >
                      <img src={src} alt={`Küçük ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </article>

            {/* Sağ — Bilgiler */}
            <aside className="ld-side">
              <div className="ld-price-row">
                <div className="ld-price">{formatPriceTL(ilan.price_tl)}</div>
                {ilan.type && <div className="tag">{ilan.type}</div>}
              </div>

              {(nonEmpty(ilan.address) || addressLine) && (
                <div className="ld-location">
                  <span>📍</span>{nonEmpty(ilan.address) || addressLine}
                </div>
              )}

              <div className="ld-specs">
                <table className="ld-specs-table"><tbody>
                  {nonEmpty(ilan.listing_no) && <tr><th>İlan No</th><td>{ilan.listing_no}</td></tr>}
                  {nonEmpty(ilan.listing_date) && <tr><th>İlan Tarihi</th><td>{ilan.listing_date}</td></tr>}
                  {nonEmpty(ilan.type) && <tr><th>Emlak Tipi</th><td>{ilan.type}</td></tr>}
                  {ilan.sqm_brut != null && <tr><th>m² (Brüt)</th><td>{ilan.sqm_brut}</td></tr>}
                  {ilan.sqm_net != null && <tr><th>m² (Net)</th><td>{ilan.sqm_net}</td></tr>}
                  {ilan.open_area_sqm != null && <tr><th>Açık Alan m²</th><td>{ilan.open_area_sqm}</td></tr>}
                  {odasayisi && <tr><th>Oda Sayısı</th><td>{odasayisi}</td></tr>}
                  {ilan.building_age != null && <tr><th>Bina Yaşı</th><td>{ilan.building_age}</td></tr>}
                  {ilan.floors != null && <tr><th>Kat Sayısı</th><td>{ilan.floors}</td></tr>}
                  {nonEmpty(ilan.heating) && <tr><th>Isıtma</th><td>{ilan.heating}</td></tr>}
                  {ilan.bathrooms != null && <tr><th>Banyo Sayısı</th><td>{ilan.bathrooms}</td></tr>}
                  {nonEmpty(ilan.kitchen) && <tr><th>Mutfak</th><td>{ilan.kitchen}</td></tr>}
                  {nonEmpty(ilan.balcony) && <tr><th>Balkon</th><td>{ilan.balcony}</td></tr>}
                  {nonEmpty(ilan.furnished) && <tr><th>Eşyalı</th><td>{ilan.furnished}</td></tr>}
                  {nonEmpty(ilan.occupancy) && <tr><th>Kullanım Durumu</th><td>{ilan.occupancy}</td></tr>}
                  {nonEmpty(ilan.in_site) && <tr><th>Site İçerisinde</th><td>{ilan.in_site}</td></tr>}
                  {nonEmpty(ilan.site_name) && <tr><th>Site Adı</th><td>{ilan.site_name}</td></tr>}
                  {ilan.dues_tl != null && <tr><th>Aidat (TL)</th><td>{ilan.dues_tl}</td></tr>}
                  {nonEmpty(ilan.loan_eligible) && <tr><th>Krediye Uygun</th><td>{ilan.loan_eligible}</td></tr>}
                  {nonEmpty(ilan.deed_status) && <tr><th>Tapu Durumu</th><td>{ilan.deed_status}</td></tr>}
                  {nonEmpty(ilan.from) && <tr><th>Kimden</th><td>{ilan.from}</td></tr>}
                  {nonEmpty(ilan.barter) && <tr><th>Takas</th><td>{ilan.barter}</td></tr>}
                </tbody></table>
              </div>

              {/* AÇIKLAMA — butonlardan önce */}
              <article className="ld-desc-card">
                <h3 className="ld-desc-title">Açıklama</h3>
                {descriptionText ? (
                  <p className="ld-desc-text">{descriptionText}</p>
                ) : (
                  <p className="ld-muted">İlan açıklaması eklenmemiş.</p>
                )}
              </article>

              <div className="ld-actions">
                <a className="btn btn-primary" href="#iletisim">Bu ilanla ilgileniyorum</a>
                <a className="btn btn-ghost" href="#/portfoyler">Diğer portföyler</a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default IlanDetay;
