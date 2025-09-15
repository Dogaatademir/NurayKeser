// src/lib/api.ts
import { supabase } from "./supabaseClient";
import { retry } from "./http";

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

  return await retry(async (signal) => {
    const abortSig: AbortSignal = signal ?? new AbortController().signal; // ⬅️ eklendi

    let q = supabase
      .from("listings")
      .select("*", { count: "exact" })
      .range(from, to);

    if (opts?.type && opts.type !== "All") {
      q = q.eq("type", opts.type);
    }

    const order = opts?.order ?? "new";
    if (order === "new")       q = q.order("created_at", { ascending: false, nullsFirst: false });
    if (order === "priceAsc")  q = q.order("price_tl",   { ascending: true,  nullsFirst: false });
    if (order === "priceDesc") q = q.order("price_tl",   { ascending: false, nullsFirst: false });

    const { data, error, count } = await q.throwOnError().abortSignal(abortSig); // ⬅️ güncellendi
    if (error) throw error;

    return {
      items: (data ?? []) as ListingRow[],
      total: (count ?? 0) as number,
    };
  });
}

export async function fetchListingImages(listingId: string) {
  return await retry(async (signal) => {
    const abortSig: AbortSignal = signal ?? new AbortController().signal; // ⬅️ eklendi

    const { data, error } = await supabase
      .from("listing_images")
      .select("url, idx")
      .eq("listing_id", listingId)
      .order("idx", { ascending: true })
      .throwOnError()
      .abortSignal(abortSig); // ⬅️ güncellendi

    if (error) throw error;
    return (data ?? []) as { url: string; idx: number }[];
  });
}
