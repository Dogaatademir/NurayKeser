import { supabase, isMocking } from "./supabase"; // supabaseClient yerine güncel yol

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

// --- SAHTE (MOCK) VERİLER ---
const MOCK_LISTINGS: ListingRow[] = [
  {
    id: "1",
    title: "Çankaya'da Manzaralı Lüks 4+1 Daire",
    address: "Turan Güneş Blv.",
    city: "Ankara",
    district: "Çankaya",
    neighborhood: "Yıldız",
    type: "Satılık",
    price_tl: 12500000,
    sqm_brut: 220,
    sqm_net: 190,
    rooms: "4+1",
    cover_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Tunalı'da Yüksek Getirili Yatırımlık Dükkan",
    address: "Tunalı Hilmi Cad.",
    city: "Ankara",
    district: "Çankaya",
    neighborhood: "Kavaklıdere",
    type: "Satılık",
    price_tl: 25000000,
    sqm_brut: 150,
    sqm_net: 135,
    rooms: "Dükkan",
    cover_url: "https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString(),
  }
];

// Her ilan için sahte resimler üreten yardımcı fonksiyon
const getMockImages = (listingId: string) => [
  { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", idx: 0 },
  { url: "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=1200&q=80", idx: 1 },
  { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", idx: 2 },
  { url: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80", idx: 3 },
];

export async function fetchListings(opts?: {
  page?: number;
  pageSize?: number;
  order?: "new" | "priceAsc" | "priceDesc";
  type?: "Satılık" | "Kiralık" | "All";
}) {
  if (isMocking) {
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return {
      items: MOCK_LISTINGS,
      total: MOCK_LISTINGS.length,
    };
  }

  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("listings").select("*", { count: "exact" }).range(from, to);

  if (opts?.type && opts.type !== "All") {
    query = query.eq("type", opts.type);
  }

  const order = opts?.order ?? "new";
  if (order === "new")       query = query.order("created_at", { ascending: false });
  if (order === "priceAsc")  query = query.order("price_tl",   { ascending: true });
  if (order === "priceDesc") query = query.order("price_tl",   { ascending: false });

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    items: (data ?? []) as ListingRow[],
    total: (count ?? 0) as number,
  };
}

// EKSİK OLAN VE HATA VEREN FONKSİYON BURASI:
export async function fetchListingImages(listingId: string) {
  if (isMocking) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return getMockImages(listingId);
  }

  const { data, error } = await supabase
    .from("listing_images")
    .select("url, idx")
    .eq("listing_id", listingId)
    .order("idx", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as { url: string; idx: number }[];
}