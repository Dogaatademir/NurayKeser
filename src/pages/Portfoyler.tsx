// src/pages/Portfoyler.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchListings } from "../lib/api";
import type { ListingRow } from "../lib/api";
import { formatTRY } from "../lib/format";
import "./Portfoyler.css";

const PAGE_SIZE = 24;

const Portfoyler: React.FC = () => {
  const [items, setItems] = useState<ListingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { items, total } = await fetchListings({ page, pageSize: PAGE_SIZE });
        setItems(items);
        setTotal(total);
      } catch (e: any) {
        console.error(e);
        alert("İlanlar yüklenirken hata oluştu: " + (e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return (
    <main className="section page">
     

      <div className="container" style={{ display: "grid", gap: 18, maxWidth: 1200 }}>
        <h1 className="ld-heading" style={{ margin: 0 }}>Portföy</h1>

        {/* Liste */}
        {loading ? (
          <div className="card" style={{ padding: 18 }}>Yükleniyor…</div>
        ) : items.length === 0 ? (
          <div className="card" style={{ padding: 18 }}>Kayıt bulunamadı.</div>
        ) : (
          <div className="grid">
            {items.map((it) => {
              const location = [it.city, it.district].filter(Boolean).join(" / ");
              const size = it.sqm_net ? `${it.sqm_net} m²` : it.sqm_brut ? `${it.sqm_brut} m²` : undefined;
              return (
                <article key={it.id} className="card">
                  {/* 🔑 BURASI GÜNCELLENDİ: ilan detay linki hash router uyumlu */}
                  <a href={`#/ilan/${it.id}`}>
                    <div className="cover">
                      {it.cover_url ? (
                        <img src={it.cover_url} alt={it.title} loading="lazy" />
                      ) : (
                        <div style={{ aspectRatio:"16/10", display:"grid", placeItems:"center", color:"#9ca3af" }}>Görsel yok</div>
                      )}
                      <span className="chip">{it.type}</span>
                    </div>
                    <div className="card-body">
                      <h3 className="title">{it.title}</h3>
                      <div className="price">{formatTRY(it.price_tl)}</div>
                      <div className="meta">
                        {it.rooms && <span>{it.rooms}</span>}
                        {size && <span>{size}</span>}
                        {location && <span>{location}</span>}
                      </div>
                    </div>
                  </a>
                </article>
              );
            })}
          </div>
        )}

        {/* Sayfalama */}
        {pages > 1 && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", alignItems:"center" }}>
            <button className="btn btn-ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Önceki
            </button>
            <span>{page} / {pages}</span>
            <button className="btn btn-ghost" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>
              Sonraki
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Portfoyler;
