// src/components/FeaturedGrid.tsx
import { useMemo } from "react";
import { formatTRY } from "../lib/format";
import type { ListingRow } from "../lib/api";
import "./FeaturedGrid.css"; // 👈 CSS'i ekledik

function FeaturedGrid({ items }: { items: ListingRow[] }) {
  const list = useMemo(() => items.slice(0, 8), [items]);

  return (
    <div className="fg-wrap">
      <div className="fg-viewport" aria-label="Öne çıkan ilanlar" role="region">
        <div className="fg-track">
          {list.map((it) => (
            <a key={it.id} href={`#/ilan/${it.id}`} className="fg-card">
              <div className="fg-media">
                {it.cover_url ? (
                  <img src={it.cover_url} alt={it.title} loading="lazy" />
                ) : (
                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      height: "100%",
                      color: "#777",
                      fontSize: 11,
                    }}
                  >
                    Görsel yok
                  </div>
                )}
              </div>

              <div className="fg-body">
                <h3 className="fg-title">{it.title}</h3>
                <div className="fg-price">{formatTRY(it.price_tl)}</div>
                <div className="fg-meta">
                  {it.rooms ?? "—"}
                  {it.sqm_net
                    ? ` · ${it.sqm_net} m²`
                    : it.sqm_brut
                    ? ` · ${it.sqm_brut} m²`
                    : ""}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturedGrid;
