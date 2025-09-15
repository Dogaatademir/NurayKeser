import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { fetchListings } from "../lib/api";
import type { ListingRow } from "../lib/api";
import { formatTRY } from "../lib/format";
import styles from "./Portfoyler.module.css"; // ← yalnızca bu modülü kullanır

const PAGE_SIZE = 24;

const FabPortal: React.FC = () => {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className={styles.fabWrap} role="group" aria-label="Hızlı eylemler">
      <a className={`${styles.fab} ${styles.phone}`} href="tel:+905397445120" title="Hemen Ara" aria-label="Telefon ile ara">📞</a>
      <a className={styles.fab} href="https://wa.me/+905397445120" target="_blank" rel="noopener" title="WhatsApp ile yaz" aria-label="WhatsApp ile yaz">💬</a>
    </div>,
    document.body
  );
};

const Portfoyler: React.FC = () => {
  const [items, setItems] = useState<ListingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { items: fetched, total: t } = await fetchListings({ page, pageSize: PAGE_SIZE });
        if (!alive) return;
        setItems(fetched);
        setTotal(t);
      } catch (e: any) {
        console.error(e);
        alert("İlanlar yüklenirken hata oluştu: " + (e?.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [page]);

  return (
    <>
      <main className={`${styles.tokens} ${styles.page}`} role="main" aria-labelledby="portfoy-heading">
        <div className={styles.container}>
          <h1 id="portfoy-heading" className={styles.heading}>Portföy</h1>

          {loading ? (
            <div className={styles.infoCard} aria-live="polite">Yükleniyor…</div>
          ) : items.length === 0 ? (
            <div className={styles.infoCard} aria-live="polite">Kayıt bulunamadı.</div>
          ) : (
            <div className={styles.grid} role="list" aria-label="İlan listesi">
              {items.map((it) => {
                const location = [it.city, it.district].filter(Boolean).join(" / ");
                const size =
                  it.sqm_net ? `${it.sqm_net} m²` :
                  it.sqm_brut ? `${it.sqm_brut} m²` : undefined;

                return (
                  <article key={it.id} className={styles.card} role="listitem">
                    <a href={`#/ilan/${it.id}`} className={styles.link} aria-label={`${it.title} ilan detayına git`}>
                      <div className={styles.cover}>
                        {it.cover_url ? (
                          <img src={it.cover_url} alt={it.title} loading="lazy" className={styles.img} />
                        ) : (
                          <div className={styles.placeholder} style={{ aspectRatio: "4/3" }}>🖼️ Görsel yok</div>
                        )}
                        {it.type && <span className={styles.chip}>{it.type}</span>}
                      </div>

                      <div className={styles.body}>
                        <h3 className={styles.title}>{it.title}</h3>
                        <div className={styles.price}>{formatTRY(it.price_tl)}</div>
                        <div className={styles.meta}>
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

          {pages > 1 && (
            <nav className={styles.pager} aria-label="Sayfalama">
              <button
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Önceki
              </button>
              <span aria-live="polite">{page} / {pages}</span>
              <button
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
              >
                Sonraki
              </button>
            </nav>
          )}
        </div>
      </main>

      <FabPortal />
    </>
  );
};

export default Portfoyler;
