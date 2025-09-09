import { supabase } from "./supabaseClient";

export type ListingRow = {
  id: string;
  title: string;
  address: string;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  type: "Satılık" | "Kiralık";
  price_tl: number;
  sqm_brut: number | null;
  sqm_net: number | null;
  rooms: string | null;
  cover_url: string | null;
  created_at: string;
};

export async function fetchListings(opts?: { page?: number; pageSize?: number; order?: "new" | "priceAsc" | "priceDesc"; type?: "Satılık" | "Kiralık" | "All" }) {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from("listings").select("*", { count: "exact" });

  // Filtre
  if (opts?.type && opts.type !== "All") {
    q = q.eq("type", opts.type);
  }

  // Sıralama
  const order = opts?.order ?? "new";
  if (order === "new") q = q.order("created_at", { ascending: false });
  if (order === "priceAsc") q = q.order("price_tl", { ascending: true, nullsFirst: true });
  if (order === "priceDesc") q = q.order("price_tl", { ascending: false, nullsFirst: true });

  // Sayfalama
  q = q.range(from, to);

  const { data, error, count } = await q as any;
  if (error) throw error;
  return { items: data as ListingRow[], total: count as number };
}

export async function fetchListingImages(listingId: string) {
  const { data, error } = await supabase
    .from("listing_images")
    .select("url, idx")
    .eq("listing_id", listingId)
    .order("idx", { ascending: true });
  if (error) throw error;
  return data as { url: string; idx: number }[];
}
