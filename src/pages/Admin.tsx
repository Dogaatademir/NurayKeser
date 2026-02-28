import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

/* =========================
   Tipler & Sabitler
========================= */
type SpecKey =
  | "İlan Tarihi"
  | "Emlak Tipi"
  | "m² (Brüt)"
  | "m² (Net)"
  | "Oda Sayısı"
  | "Bina Yaşı"
  | "Bulunduğu Kat"
  | "Kat Sayısı"
  | "Isıtma"
  | "Banyo Sayısı"
  | "Mutfak"
  | "Balkon"
  | "Asansör"
  | "Otopark"
  | "Eşyalı"
  | "Kullanım Durumu"
  | "Site İçerisinde"
  | "Site Adı"
  | "Aidat (TL)"
  | "Krediye Uygun"
  | "Tapu Durumu"
  | "Kimden"
  | "Takas";

const SPEC_FIELDS: SpecKey[] = [
  "İlan Tarihi",
  "Emlak Tipi",
  "m² (Brüt)",
  "m² (Net)",
  "Oda Sayısı",
  "Bina Yaşı",
  "Bulunduğu Kat",
  "Kat Sayısı",
  "Isıtma",
  "Banyo Sayısı",
  "Mutfak",
  "Balkon",
  "Asansör",
  "Otopark",
  "Eşyalı",
  "Kullanım Durumu",
  "Site İçerisinde",
  "Site Adı",
  "Aidat (TL)",
  "Krediye Uygun",
  "Tapu Durumu",
  "Kimden",
  "Takas",
];

const BUCKET = "listing-images";
const MAX_FILE_SIZE_MB = 10;

type ListingImage = {
  url: string;
  idx: number | null;
};

type ListingRow = {
  id: string;
  title: string;
  address: string;
  price_tl: number;
  type: "Satılık" | "Kiralık";
  description?: string;
  specs?: Partial<Record<SpecKey | "priceLine", string>>;
  cover_url?: string | null;
  listing_images?: ListingImage[];
};

/* =========================
   Yardımcı Fonksiyonlar
========================= */
const normalizeSpaces = (s: string) => s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
const onlyDigits = (s: string) => (s || "").replace(/[^\d]/g, "");

const mkEmptyDetails = (): Record<SpecKey, string> =>
  SPEC_FIELDS.reduce((acc, k) => {
    acc[k] = "";
    return acc;
  }, {} as Record<SpecKey, string>);

const isBlobUrl = (url: string) => url.startsWith("blob:");
const safeRevokeUrl = (url: string) => {
  if (isBlobUrl(url)) URL.revokeObjectURL(url);
};

const extractStoragePathFromPublicUrl = (url: string) => {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
};

const Admin: React.FC = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"manage" | "create" | "edit">("manage");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");

  const [importText, setImportText] = useState("");
  const [q, setQ] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [priceLine, setPriceLine] = useState("");
  const [type, setType] = useState<"Satılık" | "Kiralık">("Satılık");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState<Record<SpecKey, string>>(mkEmptyDetails());

  // ✅ Edit modunda mevcut (DB/Storage) görseller
  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);

  // Yeni eklenecek görseller
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    return () => {
      newPreviewUrls.forEach(safeRevokeUrl);
    };
  }, [newPreviewUrls]);

  const clearMessages = () => {
    setPageError("");
    setPageSuccess("");
  };

  const loadListings = async () => {
    clearMessages();
    setListLoading(true);

    const { data, error } = await supabase
      .from("listings")
      .select(`*, listing_images (url, idx)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Veri çekme hatası:", error);
      setPageError("İlanlar yüklenirken bir hata oluştu.");
    } else {
      setRows((data as ListingRow[]) || []);
    }

    setListLoading(false);
  };

  const parseFromText = () => {
    clearMessages();

    try {
      const lines = importText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const nextDetails = mkEmptyDetails();

      // Fiyat ve Lokasyon tespiti
      const pr = lines.find((s) => /\bTL\b/i.test(s));
      if (pr) setPriceLine(normalizeSpaces(pr));

      const loc = lines.find((s) => s.includes(" / "));
      if (loc) setAddress(loc);

      // Teknik Özelliklerin tespiti
      SPEC_FIELDS.forEach((key) => {
        const found = lines.find((s) => s.toLowerCase().startsWith(key.toLowerCase()));
        if (found) {
          const val = found.replace(new RegExp(`^${key}`, "i"), "").trim();
          nextDetails[key] = normalizeSpaces(val);
        }
      });

      setDetails(nextDetails);
      setPageSuccess("Metin başarıyla analiz edildi.");
    } catch (e) {
      console.error("Metin analiz hatası:", e);
      setPageError("Metin analiz edilirken hata oluştu.");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();

    const fileList = e.target.files;
    if (!fileList) return;

    const incomingFiles = Array.from(fileList);
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of incomingFiles) {
      const isImage = file.type.startsWith("image/");
      const isWithinLimit = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

      if (!isImage) {
        setPageError("Sadece görsel dosyaları yükleyebilirsiniz.");
        continue;
      }
      if (!isWithinLimit) {
        setPageError(`Her görsel en fazla ${MAX_FILE_SIZE_MB} MB olabilir.`);
        continue;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setNewImages((prev) => [...prev, ...validFiles]);
      setNewPreviewUrls((prev) => [...prev, ...previews]);
      if (!pageError) setPageSuccess("Görsel(ler) seçildi.");
    }

    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    clearMessages();

    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewUrls((prev) => {
      const removed = prev[index];
      if (removed) safeRevokeUrl(removed);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ✅ Mevcut (DB/Storage) görselleri gerçekten sil
  const removeExistingImage = async (imageUrl: string) => {
    clearMessages();
    if (!editingId) return;

    const ok = window.confirm("Bu görseli silmek istediğinize emin misiniz?");
    if (!ok) return;

    try {
      // 1) Storage path çıkar
      const path = extractStoragePathFromPublicUrl(imageUrl);
      if (path) {
        const { error: storageErr } = await supabase.storage.from(BUCKET).remove([path]);
        if (storageErr) throw storageErr;
      }

      // 2) DB kaydı sil
      const { error: dbErr } = await supabase
        .from("listing_images")
        .delete()
        .eq("listing_id", editingId)
        .eq("url", imageUrl);

      if (dbErr) throw dbErr;

      // 3) Local state güncelle
      const next = existingImages.filter((img) => img.url !== imageUrl);

      // 4) idx’leri yeniden sırala
      const reindexed = next
        .slice()
        .sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0))
        .map((img, i) => ({ ...img, idx: i }));

      setExistingImages(reindexed);

      // 5) DB’de idx güncelle (tek tek)
      // (az sayıda görsel olduğu için safe)
      for (const img of reindexed) {
        await supabase
          .from("listing_images")
          .update({ idx: img.idx })
          .eq("listing_id", editingId)
          .eq("url", img.url);
      }

      // 6) cover_url güncelle (silinen cover ise)
      const newCover = reindexed[0]?.url ?? null;
      const { error: coverErr } = await supabase
        .from("listings")
        .update({ cover_url: newCover })
        .eq("id", editingId);
      if (coverErr) throw coverErr;

      setPageSuccess("Görsel silindi ve kapak görseli güncellendi.");
      await loadListings();
    } catch (err: any) {
      console.error("Görsel silme hatası:", err);
      setPageError(err?.message || "Görsel silinirken hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    clearMessages();

    const approved = window.confirm("Bu ilanı ve tüm fotoğraflarını silmek istediğinize emin misiniz?");
    if (!approved) return;

    setDeletingId(id);

    try {
      // 1) Görselleri çek
      const { data: imageRows, error: imageFetchError } = await supabase
        .from("listing_images")
        .select("url")
        .eq("listing_id", id);

      if (imageFetchError) throw imageFetchError;

      // 2) Storage path listesi
      const pathsToDelete = (imageRows || [])
        .map((row: { url: string }) => extractStoragePathFromPublicUrl(row.url))
        .filter(Boolean) as string[];

      // 3) Bucket'tan sil
      if (pathsToDelete.length > 0) {
        const { error: storageDeleteError } = await supabase.storage.from(BUCKET).remove(pathsToDelete);
        if (storageDeleteError) throw storageDeleteError;
      }

      // 4) DB listing_images sil
      const { error: imageDeleteError } = await supabase.from("listing_images").delete().eq("listing_id", id);
      if (imageDeleteError) throw imageDeleteError;

      // 5) Listings sil
      const { error: listingDeleteError } = await supabase.from("listings").delete().eq("id", id);
      if (listingDeleteError) throw listingDeleteError;

      setRows((prev) => prev.filter((r) => r.id !== id));
      setPageSuccess("İlan ve bağlı görseller başarıyla silindi.");
    } catch (err: any) {
      console.error("Silme Hatası:", err);
      setPageError(err?.message || "Silme sırasında bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    clearMessages();

    if (!title.trim() || !priceLine.trim()) {
      setPageError("Başlık ve fiyat zorunludur.");
      return;
    }

    setSaving(true);

    const price_tl = parseInt(onlyDigits(priceLine), 10) || 0;

    const payload: any = {
      title: title.trim(),
      address: address.trim(),
      price_tl,
      type,
      description: description.trim(),
      specs: { ...details, priceLine },
      city: address.split("/")[1]?.trim() || null,
      district: address.split("/")[0]?.trim() || null,
      rooms: details["Oda Sayısı"] || null,
      sqm_net: parseInt(onlyDigits(details["m² (Net)"]), 10) || null,
      sqm_brut: parseInt(onlyDigits(details["m² (Brüt)"]), 10) || null,
    };

    try {
      let listingId = editingId;

      // 1) listings insert/update
      if (viewMode === "edit" && editingId) {
        const { error } = await supabase.from("listings").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("listings").insert(payload).select().single();
        if (error) throw error;
        listingId = data.id;
      }

      // 2) Yeni görseller upload + listing_images insert
      if (newImages.length > 0 && listingId) {
        const currentMaxIdx =
          (existingImages.length > 0
            ? Math.max(...existingImages.map((x) => x.idx ?? 0))
            : -1) || -1;

        let firstPublicUrl = existingImages[0]?.url || "";

        for (let i = 0; i < newImages.length; i++) {
          const file = newImages[i];
          const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const path = `${listingId}/${fileName}`;

          const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || undefined,
          });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from(BUCKET).getPublicUrl(path);

          if (!firstPublicUrl) firstPublicUrl = publicUrl;

          const nextIdx = currentMaxIdx + 1 + i;

          const { error: imageInsertError } = await supabase.from("listing_images").insert({
            listing_id: listingId,
            url: publicUrl,
            idx: nextIdx,
          });

          if (imageInsertError) throw imageInsertError;
        }

        // cover_url set (yoksa)
        if (firstPublicUrl) {
          const { error: coverUpdateError } = await supabase
            .from("listings")
            .update({ cover_url: firstPublicUrl })
            .eq("id", listingId);

          if (coverUpdateError) throw coverUpdateError;
        }
      }

      setPageSuccess(viewMode === "edit" ? "İlan başarıyla güncellendi." : "İlan başarıyla kaydedildi.");
      resetForm(false);
      await loadListings();
    } catch (e: any) {
      console.error("Kaydetme hatası:", e);
      setPageError(e?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: ListingRow) => {
    clearMessages();

    setEditingId(item.id);
    setTitle(item.title || "");
    setAddress(item.address || "");
    setPriceLine(item.specs?.priceLine || item.price_tl?.toString() || "");
    setType(item.type === "Kiralık" ? "Kiralık" : "Satılık");
    setDescription(item.description || "");

    const nextDetails = mkEmptyDetails();
    SPEC_FIELDS.forEach((field) => {
      nextDetails[field] = item.specs?.[field] || "";
    });
    setDetails(nextDetails);

    const ex = (item.listing_images || [])
      .slice()
      .sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0));

    setExistingImages(ex);

    // yeni görsel state’lerini sıfırla
    setNewImages([]);
    setNewPreviewUrls((prev) => {
      prev.forEach(safeRevokeUrl);
      return [];
    });

    setViewMode("edit");
  };

  const resetForm = (clearMessagesToo = true) => {
    if (clearMessagesToo) clearMessages();

    setTitle("");
    setAddress("");
    setPriceLine("");
    setType("Satılık");
    setDescription("");
    setDetails(mkEmptyDetails());

    setExistingImages([]);

    setNewImages([]);
    setNewPreviewUrls((prev) => {
      prev.forEach(safeRevokeUrl);
      return [];
    });

    setEditingId(null);
    setViewMode("manage");
    setImportText("");
  };

  const filteredRows = useMemo(
    () => rows.filter((r) => (r.title || "").toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  const isBusy = saving || !!deletingId;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#112769] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h2 className="text-lg font-light italic">
              Nuray Keser{" "}
              <span className="font-bold not-italic text-[#C5A572] ml-2 text-xs uppercase tracking-widest">Admin</span>
            </h2>

            <nav className="flex gap-2">
              <button
                onClick={() => {
                  clearMessages();
                  setViewMode("manage");
                }}
                className={`px-5 py-2 text-[11px] font-bold tracking-widest uppercase transition-all ${
                  viewMode === "manage" ? "bg-white text-[#112769]" : "text-white/60 hover:text-white"
                }`}
              >
                Portföy
              </button>

              <button
                onClick={() => {
                  clearMessages();
                  setViewMode("create");
                  setEditingId(null);
                  setExistingImages([]);
                  setNewImages([]);
                  setNewPreviewUrls((prev) => {
                    prev.forEach(safeRevokeUrl);
                    return [];
                  });
                }}
                className={`px-5 py-2 text-[11px] font-bold tracking-widest uppercase transition-all ${
                  viewMode === "create" ? "bg-white text-[#112769]" : "text-white/60 hover:text-white"
                }`}
              >
                Yeni Ekle
              </button>
            </nav>
          </div>

          <button
            onClick={async () => {
              clearMessages();
              await supabase.auth.signOut();
              navigate("/admin-login", { replace: true });
            }}
            className="text-[10px] font-bold border border-white/20 px-4 py-2 hover:bg-white hover:text-[#112769] transition-all uppercase"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {(pageError || pageSuccess) && (
          <div className="mb-6">
            {pageError && <div className="mb-3 border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{pageError}</div>}
            {pageSuccess && <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">{pageSuccess}</div>}
          </div>
        )}

        {viewMode === "manage" ? (
          <div className="space-y-8">
            <input
              placeholder="İlanlarda ara..."
              className="w-full md:w-96 p-4 border border-slate-200 outline-none focus:border-[#C5A572]"
              onChange={(e) => setQ(e.target.value)}
              value={q}
            />

            {listLoading ? (
              <div className="bg-white border border-slate-100 p-8 text-sm text-slate-500">İlanlar yükleniyor...</div>
            ) : filteredRows.length === 0 ? (
              <div className="bg-white border border-slate-100 p-8 text-sm text-slate-500">Eşleşen ilan bulunamadı.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredRows.map((r) => {
                  const isDeleting = deletingId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="bg-white border border-slate-100 p-6 shadow-sm hover:border-[#C5A572] transition-all"
                    >
                      <div className="aspect-video bg-gray-50 mb-4 overflow-hidden relative">
                        <span
                          className={`absolute top-2 left-2 z-10 px-2 py-1 text-[9px] font-bold uppercase text-white ${
                            r.type === "Kiralık" ? "bg-orange-500" : "bg-blue-600"
                          }`}
                        >
                          {r.type}
                        </span>

                        {r.cover_url ? (
                          <img src={r.cover_url} className="w-full h-full object-cover" alt="" />
                        ) : r.listing_images?.[0]?.url ? (
                          <img src={r.listing_images[0].url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-300 italic">Resim Yok</div>
                        )}
                      </div>

                      <h3 className="font-medium text-[#112769] mb-4 truncate">{r.title}</h3>
                      <div className="text-sm text-slate-400 mb-6">{r.price_tl?.toLocaleString() || 0} TL</div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(r)}
                          disabled={isBusy}
                          className="flex-1 py-2 text-[10px] font-bold uppercase border border-[#112769] text-[#112769] hover:bg-[#112769] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Düzenle
                        </button>

                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={isBusy}
                          className="flex-1 py-2 text-[10px] font-bold uppercase border border-red-100 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? "Siliniyor..." : "Sil"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-white p-8 border border-[#112769]/5 shadow-sm">
              <h3 className="text-xs font-bold text-[#112769] uppercase tracking-widest mb-4 italic">Metinden İçe Aktar</h3>

              <textarea
                className="w-full h-32 p-4 bg-[#F8FAFC] border border-slate-100 outline-none focus:border-[#C5A572] text-sm font-light italic"
                placeholder="Metni buraya yapıştırın..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />

              <button
                onClick={parseFromText}
                disabled={isBusy}
                className="mt-4 px-6 py-3 bg-[#112769] text-white text-[10px] font-bold uppercase hover:bg-[#C5A572] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Çözümle
              </button>
            </div>

            <div className="bg-white p-10 shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">İlan Başlığı</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#C5A572]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Fiyat (Göründüğü gibi)</label>
                  <input
                    value={priceLine}
                    onChange={(e) => setPriceLine(e.target.value)}
                    className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#C5A572]"
                    placeholder="Örn: 12.500.000 TL"
                  />
                </div>
              </div>

              <div className="mb-12 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">İlan Türü</label>

                <div className="flex gap-4">
                  {["Satılık", "Kiralık"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t as "Satılık" | "Kiralık")}
                      type="button"
                      className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        type === t
                          ? "bg-[#112769] text-white border-[#112769]"
                          : "bg-white text-[#8B92A4] border-slate-100 hover:border-[#112769]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {SPEC_FIELDS.map((f) => (
                  <div key={f} className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-300 uppercase">{f}</label>
                    <input
                      value={details[f] || ""}
                      onChange={(e) => setDetails({ ...details, [f]: e.target.value })}
                      className="w-full border-b border-slate-100 py-1 text-xs outline-none focus:border-[#C5A572]"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-12 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">İlan Açıklaması</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-48 p-4 bg-[#F8FAFC] border border-slate-100 outline-none focus:border-[#C5A572] text-sm"
                  placeholder="İlan detayları..."
                />
              </div>

              {/* ✅ Görseller: mevcut + yeni */}
              <div className="mb-12">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-4">Görseller</label>

                <div className="flex flex-wrap gap-4">
                  {/* Mevcut görseller */}
                  {existingImages.map((img, i) => (
                    <div key={`ex-${img.url}-${i}`} className="relative w-24 h-24 border border-slate-200 shadow-sm">
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => removeExistingImage(img.url)}
                        type="button"
                        disabled={isBusy}
                        title="Görseli sil"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Yeni eklenen görseller */}
                  {newPreviewUrls.map((url, i) => (
                    <div key={`new-${url}-${i}`} className="relative w-24 h-24 border border-slate-200 shadow-sm">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => removeNewImage(i)}
                        type="button"
                        disabled={isBusy}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 cursor-pointer hover:border-[#C5A572] transition-all text-slate-400">
                    <span className="text-xl">+</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </label>
                </div>

                {viewMode === "edit" && existingImages.length === 0 && (
                  <p className="mt-4 text-xs text-slate-400">
                    Not: Bu ilanda mevcut görsel yok. İlk eklediğin görsel otomatik kapak olarak atanır.
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={isBusy}
                  className="flex-1 bg-[#112769] text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C5A572] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Kaydediliyor..." : "Portföyü Kaydet"}
                </button>

                <button
                  onClick={() => resetForm()}
                  disabled={isBusy}
                  className="px-10 border border-slate-200 text-slate-400 text-xs font-bold uppercase hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;