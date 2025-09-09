// src/pages/Admin.tsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./Admin.css";

/* =========================
   DEBUG
========================= */
const DEBUG = true;
const log = (...a: any[]) => { if (DEBUG) console.log("[ADMIN]", ...a); };
const logErr = (...a: any[]) => console.error("[ADMIN:ERROR]", ...a);

/* =========================
   Tipler & Sabitler
========================= */
type SpecKey =
  | "İlan Tarihi" | "Emlak Tipi" | "m² (Brüt)" | "m² (Net)" | "Oda Sayısı"
  | "Bina Yaşı" | "Bulunduğu Kat" | "Kat Sayısı" | "Isıtma" | "Banyo Sayısı"
  | "Mutfak" | "Balkon" | "Asansör" | "Otopark" | "Eşyalı" | "Kullanım Durumu"
  | "Site İçerisinde" | "Site Adı" | "Aidat (TL)" | "Krediye Uygun"
  | "Tapu Durumu" | "Kimden" | "Takas";

const SPEC_FIELDS: SpecKey[] = [
  "İlan Tarihi","Emlak Tipi","m² (Brüt)","m² (Net)","Oda Sayısı",
  "Bina Yaşı","Bulunduğu Kat","Kat Sayısı","Isıtma","Banyo Sayısı",
  "Mutfak","Balkon","Asansör","Otopark","Eşyalı","Kullanım Durumu",
  "Site İçerisinde","Site Adı","Aidat (TL)","Krediye Uygun",
  "Tapu Durumu","Kimden","Takas",
];

type ListingType = "" | "Satılık" | "Kiralık";

type ListingRow = {
  id: string;
  title: string;
  address: string;
  type: "Satılık" | "Kiralık";
  price_tl: number;
  cover_url: string | null;
  specs: any;
  city?: string; district?: string; neighborhood?: string;
};

type ImageRow = { id: string; url: string; idx: number };
type ListingWithImages = ListingRow & { images: ImageRow[] };
type ViewMode = "create" | "manage";

const MAX_PERSIST_IMAGES = 20;
const BUCKET = "listing-images";

/* =========================
   Yardımcılar
========================= */
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeSpaces = (s: string) => s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
const onlyDigits = (s: string) => (s || "").replace(/[^\d]/g, "");
const mkEmptyDetails = (): Record<SpecKey, string> =>
  SPEC_FIELDS.reduce((acc, k) => { (acc as any)[k] = ""; return acc; }, {} as Record<SpecKey, string>);

/** Public URL -> storage path (bucket içindeki yol) */
function extractPathFromPublicUrl(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/object\/public\/[^/]+\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

/* Görsel yardımcıları */
function loadImage(src: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (typeof src === "string") {
      img.crossOrigin = "anonymous";
      img.src = src;
    } else {
      const fr = new FileReader();
      fr.onload = () => { img.src = String(fr.result); };
      fr.onerror = reject;
      fr.readAsDataURL(src);
    }
  });
}

async function compressToDataURL(
  file: File,
  opts: { maxW?: number; maxH?: number; quality?: number } = {}
): Promise<string> {
  const maxW = opts.maxW ?? 1600;
  const maxH = opts.maxH ?? 1600;
  const quality = opts.quality ?? 0.8;
  const img = await loadImage(file);
  const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context alınamadı");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

function dataURLtoBlob(dataURL: string): Blob {
  const [meta, base64] = dataURL.split(",");
  const mime = (meta.match(/data:(.*?);base64/) || [])[1] || "image/jpeg";
  const bin = atob(base64 || "");
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

function getPublicUrl(path: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/* Supabase helpers */
async function fetchListings(): Promise<ListingRow[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("id,title,address,type,price_tl,cover_url,specs,city,district,neighborhood")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as ListingRow[];
}

async function fetchListingById(id: string): Promise<ListingWithImages> {
  const { data, error } = await supabase
    .from("listings")
    .select("id,title,address,type,price_tl,cover_url,specs,city,district,neighborhood, listing_images:listing_images(id,url,idx)")
    .eq("id", id)
    .single();
  if (error) throw error;
  const row = data as any;
  return { ...row, images: (row.listing_images || []) as ImageRow[] };
}

async function deleteListingCompletely(id: string) {
  // 1) Görselleri al
  const { data: imgs, error: imgErr } = await supabase
    .from("listing_images")
    .select("id,url")
    .eq("listing_id", id);
  if (imgErr) throw imgErr;

  // 2) Storage'dan sil
  const paths = (imgs || [])
    .map((r) => extractPathFromPublicUrl(r.url))
    .filter((p): p is string => !!p);
  if (paths.length > 0) {
    const { error: stErr } = await supabase.storage.from(BUCKET).remove(paths);
    if (stErr) throw stErr;
  }

  // 3) DB ilişkileri ve ilan
  if ((imgs || []).length > 0) {
    const ids = (imgs || []).map((r) => r.id);
    const { error: delImgErr } = await supabase.from("listing_images").delete().in("id", ids);
    if (delImgErr) throw delImgErr;
  }
  const { error: delListErr } = await supabase.from("listings").delete().eq("id", id);
  if (delListErr) throw delListErr;
}

/* =========================
   Bileşen
========================= */
const Admin: React.FC = () => {
  /* Auth */
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  /* Görünüm */
  const [viewMode, setViewMode] = useState<ViewMode>("create");

  /* Edit durumu */
  const [editingId, setEditingId] = useState<string | null>(null);
  const cancelEdit = () => {
    setEditingId(null);
    setRemovedExistingImageIds(new Set());
    setNewImages([]);
    setCurrentStep(1);
  };

  /* Form */
  const [importText, setImportText] = useState("");
  const [details, setDetails] = useState<Record<SpecKey, string>>(mkEmptyDetails());
  const [title, setTitle] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [priceLine, setPriceLine] = useState<string>("");
  const [type, setType] = useState<ListingType>("");
  const [description, setDescription] = useState<string>("");
  const [existingImages, setExistingImages] = useState<ImageRow[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const cover = images[0] || "";

  /* Progress */
  const [currentStep, setCurrentStep] = useState(1);

  /* Yönetim listesi */
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [q, setQ] = useState("");
  const [filterType, setFilterType] = useState<ListingType>("");

  /* Auth init */
  useEffect(() => {
    (async () => {
      try {
        const { data: s } = await supabase.auth.getSession();
        const email = s.session?.user?.email?.toLowerCase() ?? null;
        setSessionEmail(email);
        if (email) {
          const { data: adm } = await supabase
            .from("admins").select("email").eq("email", email).maybeSingle();
          setIsAdmin(!!adm);
        }
      } catch (e) {
        logErr("auth init", e);
      }
      supabase.auth.onAuthStateChange(async (_evt, sess) => {
        const email = sess?.user?.email?.toLowerCase() ?? null;
        setSessionEmail(email);
        if (email) {
          const { data: adm } = await supabase
            .from("admins").select("email").eq("email", email).maybeSingle();
          setIsAdmin(!!adm);
        } else {
          setIsAdmin(false);
        }
      });
    })();
  }, []);

  /* Listeyi çek */
  const loadList = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await fetchListings();
      setRows(data);
    } catch (e: any) {
      setListError(e?.message || "Liste alınamadı");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "manage") loadList().catch(() => {});
  }, [viewMode]);

  /* Auth Actions */
  const doLogin = async () => {
    try {
      setAuthBusy(true);
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPass });
      if (error) throw error;
      alert("Giriş başarılı.");
      setAuthEmail(""); setAuthPass("");
    } catch (e: any) {
      alert(`Giriş hatası: ${e?.message || e}`);
    } finally {
      setAuthBusy(false);
    }
  };
  const doLogout = async () => {
    try {
      await supabase.auth.signOut();
      alert("Çıkış yapıldı.");
    } catch (e) {
      logErr("logout", e);
    }
  };

  /* Form yardımcıları */
  const setDetail = (key: SpecKey, value: string) => setDetails((s) => ({ ...s, [key]: value }));

  function parseFromText() {
    try {
      const raw = (importText || "").replace(/\r/g, "\n");
      const lines = raw
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !/^Kredi Teklifleri$/i.test(s));

      if (lines.length === 0) { alert("Metin boş görünüyor."); return; }

      const pr = lines.find((s) => /\bTL\b/i.test(s));
      if (pr) setPriceLine(normalizeSpaces(pr));

      const loc = lines.find((s) => s.includes(" / "));
      if (loc) setAddress(loc);

      const nextDetails = mkEmptyDetails();
      SPEC_FIELDS.forEach((key) => {
        const re = new RegExp(`^${escapeRegex(key)}\\s+(.*)$`, "i");
        const found = lines.find((s) => re.test(s));
        if (found) {
          const m = found.match(re);
          if (m && m[1]) (nextDetails as any)[key] = normalizeSpaces(m[1]);
        }
      });

      setDetails(nextDetails);
      setCurrentStep(2);
      alert("Metin işlendi.");
    } catch (e: any) {
      alert("Metin işlenirken hata oluştu.");
    }
  }

  const sizeLabel = useMemo(() => {
    const rooms = (details["Oda Sayısı"] || "").trim();
    const sqm = (details["m² (Net)"] || details["m² (Brüt)"] || "").replace(/[^\d]/g, "");
    if (rooms && sqm) return `${rooms} • ${Number(sqm)} m²`;
    if (rooms) return rooms;
    if (sqm) return `${Number(sqm)} m²`;
    return "";
  }, [details]);

  const onImagesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setCurrentStep(3);
    (async () => {
      const list = Array.from(files);
      const dataURLs: string[] = [];
      for (const f of list) {
        try {
          const d = await compressToDataURL(f, { maxW: 1600, maxH: 1600, quality: 0.8 });
          dataURLs.push(d);
        } catch {
          const r = await new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result));
            fr.onerror = reject;
            fr.readAsDataURL(f);
          });
          dataURLs.push(r);
        }
      }
      setNewImages((prev) => [...prev, ...dataURLs]);
      setImages((prev) => {
        const merged = prev.length ? [...prev, ...dataURLs] : [...dataURLs];
        if (prev.length === 0 && existingImages.length) {
          const exUrls = existingImages.slice().sort((a,b)=>a.idx-b.idx).map(x=>x.url);
          return [...exUrls, ...dataURLs];
        }
        return merged;
      });
    })().catch((e) => logErr("onImagesSelect", e));
  };

  const removeImageAt = (idx: number) => {
    const url = images[idx];
    const found = existingImages.find((x) => x.url === url);
    if (found) {
      const next = new Set(removedExistingImageIds);
      next.add(found.id);
      setRemovedExistingImageIds(next);
      setExistingImages((arr) => arr.filter((x) => x.id !== found.id));
    } else {
      setNewImages((arr) => arr.filter((u) => u !== url));
    }
    setImages((arr) => arr.filter((_, i) => i !== idx));
  };

  const makeCover = (idx: number) => {
    setImages((prev) => {
      const arr = prev.slice();
      const [sel] = arr.splice(idx, 1);
      arr.unshift(sel);
      return arr;
    });
  };

  const getStepStatus = (step: number) => (step < currentStep ? "completed" : step === currentStep ? "active" : "pending");

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2: return priceLine.trim() || address.trim() || Object.values(details).some(v => v.trim());
      case 3: return title.trim() && type && priceLine.trim() && address.trim();
      case 4: return images.length > 0;
      default: return true;
    }
  };

  /* Insert / Update ortak yardımcılar */
  function parsePriceToTL(p: string): number {
    const digits = onlyDigits(p);
    return digits ? parseInt(digits, 10) : 0;
  }
  function parseLocation(addr: string) {
    const parts = addr.split("/").map((s) => s.trim());
    const [city = "", district = "", neighborhood = ""] = parts;
    return { city, district, neighborhood };
  }
  async function uploadAllImages(listingId: string, dataUrls: string[]) {
    const urls: string[] = [];
    let idx = 0;
    for (const dataUrl of dataUrls.slice(0, MAX_PERSIST_IMAGES)) {
      const blob = dataURLtoBlob(dataUrl);
      const ext = (blob.type || "image/jpeg").split("/")[1] || "jpeg";
      const path = `${listingId}/${Date.now()}_${idx}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
        upsert: false,
        contentType: blob.type || "image/jpeg",
      });
      if (error) throw error;
      urls.push(getPublicUrl(path));
      idx++;
    }
    return urls;
  }
  async function insertListing(row: any) {
    const { data, error } = await supabase.from("listings").insert(row).select("id").single();
    if (error) throw error;
    return data!.id as string;
  }
  async function insertListingImages(listingId: string, urls: string[]) {
    if (urls.length === 0) return;
    const rows = urls.map((url, i) => ({ listing_id: listingId, url, idx: i }));
    const { error } = await supabase.from("listing_images").insert(rows);
    if (error) throw error;
  }
  async function updateCover(listingId: string, coverUrl: string) {
    const { error } = await supabase.from("listings").update({ cover_url: coverUrl }).eq("id", listingId);
    if (error) throw error;
  }

  /* Kayıt */
  const onAdd = async () => {
    if (!isAdmin) { alert("İlan eklemek için admin girişi gerekir."); return; }
    const errs: string[] = [];
    if (!title.trim()) errs.push("İlan başlığı boş olamaz.");
    if (!address.trim()) errs.push("Adres boş olamaz.");
    if (!priceLine.trim()) errs.push("Fiyat satırı boş veya okunamadı.");
    if (!sizeLabel.trim()) errs.push("Oda/m² bilgisi eksik.");
    if (images.length === 0) errs.push("En az 1 fotoğraf yükleyin.");
    if (!type) errs.push("Tür (Satılık/Kiralık) seçin.");
    if (errs.length) { alert("Lütfen düzeltin:\n- " + errs.join("\n- ")); return; }

    setSubmitting(true);
    setCurrentStep(4);
    try {
      const price_tl = parsePriceToTL(priceLine);
      const { city, district, neighborhood } = parseLocation(address);
      const yesNo = (v: string) => /^(evet|var)$/i.test((v || "").trim());

      const listingId = await insertListing({
        title: title.trim(),
        address: address.trim(),
        city, district, neighborhood,
        type: type as "Satılık" | "Kiralık",
        price_tl,
        sqm_brut: Number(onlyDigits(details["m² (Brüt)"])) || null,
        sqm_net: Number(onlyDigits(details["m² (Net)"])) || null,
        rooms: (details["Oda Sayısı"] || "").trim() || null,
        bathrooms: Number(onlyDigits(details["Banyo Sayısı"])) || null,
        building_age: (details["Bina Yaşı"] || "") || null,
        floor: (details["Bulunduğu Kat"] || "") || null,
        floor_count: (details["Kat Sayısı"] || "") || null,
        heating: (details["Isıtma"] || "") || null,
        kitchen_type: (details["Mutfak"] || "") || null,
        balcony: (details["Balkon"] || "") || null,
        elevator: (details["Asansör"] || "") || null,
        parking: (details["Otopark"] || "") || null,
        furnished: (details["Eşyalı"] || "") || null,
        usage_status: (details["Kullanım Durumu"] || "") || null,
        in_site: yesNo(details["Site İçerisinde"]),
        site_name: (details["Site Adı"] || "") || null,
        dues: (details["Aidat (TL)"] || "") || null,
        loan_eligible: yesNo(details["Krediye Uygun"]),
        deed_status: (details["Tapu Durumu"] || "") || null,
        from_whom: (details["Kimden"] || "") || null,
        exchange: yesNo(details["Takas"]),
        specs: { ...details, description: description?.trim() || "", priceLine: priceLine?.trim() || "" },
        cover_url: null,
      });

      const uploadedUrls = await uploadAllImages(listingId, newImages.length ? newImages : images);
      await insertListingImages(listingId, uploadedUrls);
      await updateCover(listingId, uploadedUrls[0]);

      alert("İlan kaydedildi ✅");
      resetForm();
      setViewMode("manage");
      await loadList();
    } catch (e: any) {
      alert(`Kayıt hatası: ${e?.message || e}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setImportText("");
    setDetails(mkEmptyDetails());
    setTitle(""); setAddress(""); setPriceLine(""); setType(""); setDescription("");
    setExistingImages([]); setImages([]); setNewImages([]);
    setRemovedExistingImageIds(new Set());
    setEditingId(null);
    setCurrentStep(1);
  };

  /* Düzenleme */
  const startEdit = async (id: string) => {
    try {
      const row = await fetchListingById(id);
      setEditingId(id);
      setViewMode("create");

      setTitle(row.title || "");
      setAddress(row.address || "");
      setType((row.type as ListingType) || "");
      setPriceLine(row.specs?.priceLine || (row.price_tl ? `${row.price_tl.toLocaleString("tr-TR")} TL` : ""));
      setDescription(row.specs?.description || "");

      const next = mkEmptyDetails();
      for (const k of SPEC_FIELDS) (next as any)[k] = row.specs?.[k] || "";
      setDetails(next);

      const ordered = (row.images || []).slice().sort((a, b) => a.idx - b.idx);
      setExistingImages(ordered);
      setImages(ordered.map((x) => x.url));
      setNewImages([]);
      setRemovedExistingImageIds(new Set());
      setCurrentStep(2);
    } catch (e: any) {
      alert("Düzenleme verileri alınamadı: " + (e?.message || e));
    }
  };

  const onUpdate = async () => {
    if (!editingId) return;
    if (!isAdmin) { alert("Güncellemek için admin girişi gerekir."); return; }
    const errs: string[] = [];
    if (!title.trim()) errs.push("İlan başlığı boş olamaz.");
    if (!address.trim()) errs.push("Adres boş olamaz.");
    if (!priceLine.trim()) errs.push("Fiyat satırı boş veya okunamadı.");
    if (images.length === 0) errs.push("En az 1 fotoğraf bulunmalı.");
    if (!type) errs.push("Tür (Satılık/Kiralık) seçin.");
    if (errs.length) { alert("Lütfen düzeltin:\n- " + errs.join("\n- ")); return; }

    setSubmitting(true);
    try {
      const price_tl = parsePriceToTL(priceLine);
      const { city, district, neighborhood } = parseLocation(address);
      const yesNo = (v: string) => /^(evet|var)$/i.test((v || "").trim());

      const { error: updErr } = await supabase.from("listings").update({
        title: title.trim(),
        address: address.trim(),
        city, district, neighborhood,
        type: type as "Satılık" | "Kiralık",
        price_tl,
        sqm_brut: Number(onlyDigits(details["m² (Brüt)"])) || null,
        sqm_net: Number(onlyDigits(details["m² (Net)"])) || null,
        rooms: (details["Oda Sayısı"] || "").trim() || null,
        bathrooms: Number(onlyDigits(details["Banyo Sayısı"])) || null,
        building_age: (details["Bina Yaşı"] || "") || null,
        floor: (details["Bulunduğu Kat"] || "") || null,
        floor_count: (details["Kat Sayısı"] || "") || null,
        heating: (details["Isıtma"] || "") || null,
        kitchen_type: (details["Mutfak"] || "") || null,
        balcony: (details["Balkon"] || "") || null,
        elevator: (details["Asansör"] || "") || null,
        parking: (details["Otopark"] || "") || null,
        furnished: (details["Eşyalı"] || "") || null,
        usage_status: (details["Kullanım Durumu"] || "") || null,
        in_site: yesNo(details["Site İçerisinde"]),
        site_name: (details["Site Adı"] || "") || null,
        dues: (details["Aidat (TL)"] || "") || null,
        loan_eligible: yesNo(details["Krediye Uygun"]),
        deed_status: (details["Tapu Durumu"] || "") || null,
        from_whom: (details["Kimden"] || "") || null,
        exchange: yesNo(details["Takas"]),
        specs: { ...details, description: description?.trim() || "", priceLine: priceLine?.trim() || "" },
      }).eq("id", editingId);
      if (updErr) throw updErr;

      // Silinecek mevcut görseller
      if (removedExistingImageIds.size > 0) {
        const toDeleteIds = Array.from(removedExistingImageIds);
        const { data: delImgs, error: selErr } = await supabase
          .from("listing_images")
          .select("id,url")
          .in("id", toDeleteIds);
        if (selErr) throw selErr;
        const delPaths = (delImgs || [])
          .map((r) => extractPathFromPublicUrl(r.url))
          .filter((p): p is string => !!p);
        if (delPaths.length > 0) {
          const { error: stErr } = await supabase.storage.from(BUCKET).remove(delPaths);
          if (stErr) throw stErr;
        }
        const { error: delErr } = await supabase.from("listing_images").delete().in("id", toDeleteIds);
        if (delErr) throw delErr;
      }

      // Yeni görselleri yükle ve ekle
      let newUrls: string[] = [];
      if (newImages.length > 0) {
        newUrls = await uploadAllImages(editingId, newImages);
        await insertListingImages(editingId, newUrls);
      }

      // Sıraları güncelle
      const all = await fetchListingById(editingId);
      const mapUrlToId: Record<string, string> = {};
      all.images.forEach((im) => { mapUrlToId[im.url] = im.id; });
      for (let i = 0; i < images.length; i++) {
        const url = images[i];
        const imgId = mapUrlToId[url];
        if (!imgId) continue;
        const { error: idxErr } = await supabase.from("listing_images").update({ idx: i }).eq("id", imgId);
        if (idxErr) throw idxErr;
      }

      await updateCover(editingId, images[0]);

      alert("İlan güncellendi ✅");
      resetForm();
      setViewMode("manage");
      await loadList();
    } catch (e: any) {
      alert("Güncelleme hatası: " + (e?.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  /* Silme */
  const onDeleteListing = async (id: string) => {
    if (!isAdmin) { alert("Silmek için admin girişi gerekir."); return; }
    const ok = confirm("Bu ilanı ve ilişkili görselleri silmek istediğinize emin misiniz?");
    if (!ok) return;
    try {
      await deleteListingCompletely(id);
      if (editingId === id) resetForm();
      await loadList();
      alert("İlan ve görseller silindi ✅");
    } catch (e: any) {
      alert("Silme hatası: " + (e?.message || e));
    }
  };

  /* Yönetim filtresi */
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterType && r.type !== filterType) return false;
      if (!term) return true;
      const hay = `${r.title} ${r.address} ${r.city} ${r.district} ${r.neighborhood}`.toLowerCase();
      return hay.includes(term);
    });
  }, [rows, q, filterType]);

  /* Basit sekme butonu (CSS'deki görselle uyumlu) */
  const NavTab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`btn ${active ? "btn-secondary" : ""}`}
      style={{
        borderRadius: 12,
        background: active ? "var(--hover-bg-soft)" : "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </button>
  );

  /* ====== UI ====== */
  if (!sessionEmail || !isAdmin) {
  return (
    <div className="admin-gate">
      <div className="gate-card">
        <h1 className="gate-title">🔐 Admin Girişi</h1>
        <p className="gate-sub">Lütfen admin hesabınızla giriş yapın.</p>

        <div className="auth-form">
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input
              type="email"
              className="form-input"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-input"
              value={authPass}
              onChange={(e) => setAuthPass(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            disabled={authBusy || !authEmail || !authPass}
            onClick={doLogin}
          >
            {authBusy ? (<><span className="spinner" /> Giriş…</>) : "Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-container" style={{ gap: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }} className="header-nav">
            <h1 className="admin-title" style={{ margin: 0 }}>🏠 Admin</h1>
            <div className="nav-buttons" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <NavTab active={viewMode === "create"} onClick={() => setViewMode("create")}>İlan Oluştur</NavTab>
              <NavTab active={viewMode === "manage"} onClick={() => setViewMode("manage")}>İlanları Yönet</NavTab>
            </div>
          </div>
          <div className="auth-status">
            {sessionEmail ? (
              <>
                <span className="user-email">{sessionEmail}</span>
                <div className={`status-badge ${isAdmin ? 'success' : 'warning'}`}>{isAdmin ? '✓ Admin' : '⚠ Admin değil'}</div>
                <button className="btn btn-ghost btn-sm" onClick={doLogout}>Çıkış</button>
              </>
            ) : (
              <div className="status-badge warning">Giriş Yok</div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className={`admin-main ${viewMode === "manage" ? "admin-main-full" : ""}`}>
        {viewMode === "create" ? (
          <>
            {/* SIDEBAR */}
            <aside className="sidebar">
              {!sessionEmail && (
                <div className="sidebar-card">
                  <div className="sidebar-header"><h3>🔐 Giriş Yap</h3></div>
                  <div className="sidebar-content">
                    <div className="auth-form">
                      <div className="form-group">
                        <label className="form-label">E-posta</label>
                        <input type="email" className="form-input" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Şifre</label>
                        <input type="password" className="form-input" value={authPass} onChange={(e) => setAuthPass(e.target.value)} />
                      </div>
                      <button className="btn btn-primary btn-full" disabled={authBusy || !authEmail || !authPass} onClick={doLogin}>
                        {authBusy ? (<><span className="spinner"></span>Giriş…</>) : "Giriş Yap"}
                      </button>
                      <small className="form-help">Admin tablosunda kayıtlı e-posta gerekli</small>
                    </div>
                  </div>
                </div>
              )}

              <div className="sidebar-card">
                <div className="sidebar-header"><h3>📋 İlerleme</h3></div>
                <div className="sidebar-content">
                  {editingId && (
                    <div className="edit-mode-notice">
                      <div className="alert alert-info"><strong>✏️ Düzenleme Modu</strong>Bu ilan üzerinde değişiklik yapıyorsunuz.</div>
                      <button className="btn btn-secondary btn-sm btn-full" onClick={cancelEdit} style={{ marginTop: 8 }}>🔙 İptal Et</button>
                    </div>
                  )}
                  <div className="progress-steps">
                    {[1,2,3,4].map((s)=>(
                      <div key={s} className={`progress-step ${getStepStatus(s)}`}>
                        <div className="step-number">{s}</div>
                        <div className="step-content">
                          <div className="step-title">
                            {s===1?"Metin İşleme":s===2?"Detaylar":s===3?"Görseller":"Kaydet"}
                          </div>
                          <div className="step-desc">
                            {s===1?"İlan metnini yapıştır":s===2?"Bilgileri düzenle":s===3?"Fotoğraf yükle":"Yayınla"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {(title || sizeLabel) && (
                <div className="sidebar-card">
                  <div className="sidebar-header"><h3>👁️ Önizleme</h3></div>
                  <div className="sidebar-content">
                    <div className="listing-preview">
                      {cover && <div className="preview-image"><img src={cover} alt="Kapak" /></div>}
                      <div className="preview-content">
                        <div className="preview-type">{type}</div>
                        <div className="preview-title">{title || "İlan Başlığı"}</div>
                        <div className="preview-size">{sizeLabel}</div>
                        <div className="preview-price">{priceLine}</div>
                        <div className="preview-address">{address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>

            {/* FORM */}
            <div className="content-area">
              {!editingId && (
                <div className="section-card">
                  <div className="section-header"><h2 className="section-title"><span className="step-icon">📝</span>İlan Metni İçe Aktarma</h2></div>
                  <div className="section-content">
                    <div className="form-group">
                      <label className="form-label">İlan metnini yapıştırın</label>
                      <textarea className="form-textarea" rows={7} value={importText} onChange={(e) => setImportText(e.target.value)} />
                      <div className="btn-group">
                        <button className="btn btn-primary" onClick={parseFromText} disabled={!importText.trim()}>🔄 Metni İşle</button>
                        <button className="btn btn-secondary" onClick={() => setImportText("")} disabled={!importText.trim()}>🗑️ Temizle</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="section-card">
                <div className="section-header"><h2 className="section-title"><span className="step-icon">ℹ️</span>Temel Bilgiler</h2></div>
                <div className="section-content">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">İlan Başlığı</label>
                      <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">İlan Türü</label>
                      <select className="form-select" value={type} onChange={(e) => setType(e.target.value as ListingType)}>
                        <option value="">Tür…</option>
                        <option value="Satılık">Satılık</option>
                        <option value="Kiralık">Kiralık</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fiyat</label>
                      <input className="form-input" value={priceLine} onChange={(e) => setPriceLine(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Adres</label>
                      <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Açıklama</label>
                    <textarea className="form-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-header"><h2 className="section-title"><span className="step-icon">🔧</span>Teknik Özellikler</h2></div>
                <div className="section-content">
                  <div className="specs-grid">
                    {SPEC_FIELDS.map((label) => (
                      <div key={label} className="spec-item">
                        <div className="form-group">
                          <label className="form-label">{label}</label>
                          <input className="form-input" value={details[label]} onChange={(e) => setDetail(label, e.target.value)} placeholder={label} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title"><span className="step-icon">📷</span>Fotoğraflar {images.length>0 && <span className="image-count">({images.length})</span>}</h2>
                </div>
                <div className="section-content">
                  <div className="upload-area" onClick={() => document.getElementById('image-upload')?.click()}>
                    <div className="upload-icon">📁</div>
                    <div className="upload-content">
                      <h3>Fotoğraf Yükle</h3>
                      <p>Dosyaları sürükleyip bırakın veya tıklayın</p>
                      <div className="upload-formats">JPG, PNG, HEIC desteklenir</div>
                    </div>
                    <input id="image-upload" type="file" multiple accept=".jpg,.jpeg,.png,.heic" style={{ display: 'none' }} onChange={(e) => onImagesSelect(e.target.files)} />
                  </div>

                  {images.length > 0 && (
                    <div className="image-grid">
                      {images.map((src, idx) => (
                        <div key={src + idx} className="image-item">
                          <img src={src} alt={`Görsel ${idx + 1}`} />
                          {idx === 0 && <div className="cover-badge">Kapak</div>}
                          <div className="image-overlay">
                            {idx !== 0 && <button className="btn btn-success btn-sm" onClick={() => makeCover(idx)} title="Kapak yap">⭐</button>}
                            <button className="btn btn-danger btn-sm" onClick={() => removeImageAt(idx)} title="Sil">🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="section-card submit-section">
                <div className="section-content">
                  <div className="submit-area">
                    <div className="submit-info">
                      <h3>{editingId ? "Güncellemeye Hazır" : "İlan Hazır!"}</h3>
                      <p>{editingId ? "Değişiklikleri kaydetmek için güncelle." : "Tüm bilgiler doldurulduysa yayınla."}</p>
                    </div>
                    <div className="submit-actions">
                      {!editingId ? (
                        <button className="btn btn-primary btn-lg" onClick={onAdd} disabled={!isAdmin || submitting || !canProceedToStep(4)}>
                          {submitting ? (<><span className="spinner"></span>Kaydediliyor…</>) : "🚀 İlanı Yayınla"}
                        </button>
                      ) : (
                        <>
                          <button className="btn btn-primary btn-lg" onClick={onUpdate} disabled={!isAdmin || submitting || !canProceedToStep(4)}>
                            {submitting ? (<><span className="spinner"></span>Güncelleniyor…</>) : "💾 Güncelle"}
                          </button>
                          <button className="btn btn-secondary btn-lg" onClick={cancelEdit} disabled={submitting}>İptal</button>
                        </>
                      )}
                      {!isAdmin && <div className="form-help error">Admin yetkisi gerekli</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* İLAN YÖNETİMİ */
          <div className="content-area manage-listings">
            <div className="section-card">
              <div className="section-header" style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h2 className="section-title">📄 İlanları Yönet</h2>
                  <span className="listings-count">({filtered.length} sonuç)</span>
                </div>
                <div className="filters-row">
                  <div className="form-group">
                    <label className="form-label">Başlık/Adres</label>
                    <input className="form-input" placeholder="Ara…" value={q} onChange={(e) => setQ(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tür</label>
                    <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value as ListingType)}>
                      <option value="">Hepsi</option>
                      <option value="Satılık">Satılık</option>
                      <option value="Kiralık">Kiralık</option>
                    </select>
                  </div>
                  <div className="btn-group" style={{ alignSelf: "end" }}>
                    <button className="btn" onClick={() => { setQ(""); setFilterType(""); }}>Temizle</button>
                    <button className="btn btn-secondary" onClick={loadList}>↻ Yenile</button>
                    <button className="btn btn-primary" onClick={() => setViewMode("create")}>+ Yeni</button>
                  </div>
                </div>
              </div>

              <div className="section-content">
                {listLoading && (
                  <div className="loading-placeholder">
                    <div className="spinner-large" />
                    Yükleniyor…
                  </div>
                )}
                {listError && <div className="card" style={{ padding: 16, color: "#b91c1c" }}>Hata: {listError}</div>}
                {!listLoading && !listError && filtered.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">🗂️</div>
                    <h3>Kayıt bulunamadı</h3>
                    <p>Filtreleri temizleyerek tekrar deneyebilirsiniz.</p>
                  </div>
                )}

                {!listLoading && !listError && filtered.length > 0 && (
                  <div className="listings-grid">
                    {filtered.map((r) => (
                      <div key={r.id} className="listing-card">
                        <div className="listing-image">
                          {r.cover_url ? (
                            <img src={r.cover_url} alt={r.title} />
                          ) : (
                            <div className="no-image">🖼️</div>
                          )}
                          <div className="listing-type-badge">
                            {r.type} • {r.price_tl.toLocaleString("tr-TR")} TL
                          </div>
                        </div>
                        <div className="listing-content">
                          <h3 className="listing-title">{r.title}</h3>
                          <div className="listing-details">
                            <div className="listing-specs">
                              {r.specs?.["Oda Sayısı"] && <span>{r.specs["Oda Sayısı"]}</span>}
                              {(r.specs?.["m² (Net)"] || r.specs?.["m² (Brüt)"]) && (
                                <span>{(r.specs["m² (Net)"] || r.specs["m² (Brüt)"]).toString().replace(/[^\d]/g,"")} m²</span>
                              )}
                            </div>
                            <div className="listing-address">{r.address}</div>
                          </div>
                        </div>
                        <div className="listing-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(r.id)}>Düzenle</button>
                          <button className="btn btn-danger btn-sm" onClick={() => onDeleteListing(r.id)}>Sil</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
