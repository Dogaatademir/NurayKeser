import { supabase } from "./supabase";

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

/**
 * Tüm ilanları filtreleme ve sayfalama seçenekleriyle getirir.
 */
export async function fetchListings(opts?: {
  page?: number;
  pageSize?: number;
  order?: "new" | "priceAsc" | "priceDesc";
  type?: "Satılık" | "Kiralık" | "All";
}) {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .range(from, to);

  // Filtreleme: Satılık / Kiralık
  if (opts?.type && opts.type !== "All") {
    query = query.eq("type", opts.type);
  }

  // Sıralama
  const order = opts?.order ?? "new";
  if (order === "new")       query = query.order("created_at", { ascending: false });
  if (order === "priceAsc")  query = query.order("price_tl",   { ascending: true });
  if (order === "priceDesc") query = query.order("price_tl",   { ascending: false });

  const { data, error, count } = await query;
  
  if (error) {
    console.error("İlanlar getirilirken hata oluştu:", error.message);
    throw new Error(error.message);
  }

  return {
    items: (data ?? []) as ListingRow[],
    total: (count ?? 0) as number,
  };
}

/**
 * Belirli bir ilana ait tüm görselleri getirir.
 */
export async function fetchListingImages(listingId: string) {
  const { data, error } = await supabase
    .from("listing_images")
    .select("url, idx")
    .eq("listing_id", listingId)
    .order("idx", { ascending: true });

  if (error) {
    console.error("Görseller getirilirken hata oluştu:", error.message);
    throw new Error(error.message);
  }

  return (data ?? []) as { url: string; idx: number }[];
}