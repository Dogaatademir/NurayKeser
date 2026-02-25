import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

const BUCKET = "listing-images";

/* =========================
   Yardımcı Fonksiyonlar
========================= */
const normalizeSpaces = (s: string) => s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
const onlyDigits = (s: string) => (s || "").replace(/[^\d]/g, "");
const mkEmptyDetails = (): Record<SpecKey, string> =>
  SPEC_FIELDS.reduce((acc, k) => { (acc as any)[k] = ""; return acc; }, {} as Record<SpecKey, string>);

const Admin: React.FC = () => {
  const [viewMode, setViewMode] = useState<"manage" | "create" | "edit">("manage");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importText, setImportText] = useState("");
  const [q, setQ] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [priceLine, setPriceLine] = useState("");
  const [type, setType] = useState<"Satılık" | "Kiralık">("Satılık");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState<Record<SpecKey, string>>(mkEmptyDetails());
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => { loadListings(); }, []);

  const loadListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select(`*, listing_images (url, idx)`)
      .order("created_at", { ascending: false });
    
    if (error) console.error("Veri çekme hatası:", error);
    else setRows(data || []);
  };

  // Metinden İçe Aktar Fonksiyonu (Geri Getirildi)
  const parseFromText = () => {
    try {
      const lines = importText.split("\n").map(s => s.trim()).filter(s => s.length > 0);
      const nextDetails = mkEmptyDetails();

      // Fiyat ve Lokasyon tespiti
      const pr = lines.find(s => /\bTL\b/i.test(s));
      if (pr) setPriceLine(normalizeSpaces(pr));
      
      const loc = lines.find(s => s.includes(" / "));
      if (loc) setAddress(loc);

      // Teknik Özelliklerin tespiti
      SPEC_FIELDS.forEach(key => {
        const found = lines.find(s => s.toLowerCase().startsWith(key.toLowerCase()));
        if (found) {
          const val = found.replace(new RegExp(`^${key}`, "i"), "").trim();
          (nextDetails as any)[key] = normalizeSpaces(val);
        }
      });

      setDetails(nextDetails);
      alert("Metin başarıyla analiz edildi.");
    } catch (e) {
      alert("Metin analiz edilirken hata oluştu.");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      const urls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...urls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Silme Fonksiyonu (Düzeltildi)
  const handleDelete = async (id: string) => {
    if (!confirm("Bu ilanı ve tüm fotoğraflarını silmek istediğinize emin misiniz?")) return;
    
    setLoading(true);
    try {
      // 1. Önce ilanı siliyoruz (Cascade ayarı SQL tarafında yapıldıysa resimler otomatik silinir)
      const { error } = await supabase.from("listings").delete().eq("id", id);
      
      if (error) throw error;
      
      alert("İlan silindi.");
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      console.error("Silme Hatası:", err);
      alert("Silme hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !priceLine) return alert("Başlık ve fiyat zorunludur.");
    setLoading(true);

    const price_tl = parseInt(onlyDigits(priceLine)) || 0;

    const payload = {
      title,
      address,
      price_tl,
      type,
      description,
      specs: { ...details, priceLine },
      city: address.split("/")[1]?.trim() || null,
      district: address.split("/")[0]?.trim() || null,
      rooms: details["Oda Sayısı"] || null,
      sqm_net: parseInt(onlyDigits(details["m² (Net)"])) || null,
      sqm_brut: parseInt(onlyDigits(details["m² (Brüt)"])) || null
    };

    try {
      let listingId = editingId;
      
      if (viewMode === "edit" && editingId) {
        const { error } = await supabase.from("listings").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("listings").insert(payload).select().single();
        if (error) throw error;
        listingId = data.id;
      }

      if (images.length > 0 && listingId) {
        let firstPublicUrl = "";
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop()?.toLowerCase();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const path = `${listingId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
            if (i === 0) firstPublicUrl = publicUrl;
            await supabase.from("listing_images").insert({ listing_id: listingId, url: publicUrl, idx: i });
          }
        }
        if (firstPublicUrl) {
          await supabase.from("listings").update({ cover_url: firstPublicUrl }).eq("id", listingId);
        }
      }

      alert("Başarıyla kaydedildi.");
      resetForm();
      loadListings();
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setAddress(item.address);
    setPriceLine(item.specs?.priceLine || item.price_tl.toString());
    setType(item.type === "Kiralık" ? "Kiralık" : "Satılık");
    setDescription(item.description || "");
    setDetails(item.specs || mkEmptyDetails());
    
    if (item.listing_images && item.listing_images.length > 0) {
      const sortedUrls = item.listing_images.sort((a: any, b: any) => (a.idx || 0) - (b.idx || 0)).map((img: any) => img.url);
      setPreviewUrls(sortedUrls);
    } else {
      setPreviewUrls([]);
    }
    setViewMode("edit");
  };

  const resetForm = () => {
    setTitle(""); setAddress(""); setPriceLine(""); setType("Satılık");
    setDescription(""); setDetails(mkEmptyDetails()); setImages([]); setPreviewUrls([]);
    setEditingId(null); setViewMode("manage"); setImportText("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#112769] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h2 className="text-lg font-light italic">Nuray Keser <span className="font-bold not-italic text-[#C5A572] ml-2 text-xs uppercase tracking-widest">Admin</span></h2>
            <nav className="flex gap-2">
              <button onClick={() => setViewMode("manage")} className={`px-5 py-2 text-[11px] font-bold tracking-widest uppercase transition-all ${viewMode === "manage" ? "bg-white text-[#112769]" : "text-white/60 hover:text-white"}`}>Portföy</button>
              <button onClick={() => setViewMode("create")} className={`px-5 py-2 text-[11px] font-bold tracking-widest uppercase transition-all ${viewMode === "create" ? "bg-white text-[#112769]" : "text-white/60 hover:text-white"}`}>Yeni Ekle</button>
            </nav>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-[10px] font-bold border border-white/20 px-4 py-2 hover:bg-white hover:text-[#112769] transition-all uppercase">Çıkış Yap</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {viewMode === "manage" ? (
          <div className="space-y-8">
            <input placeholder="İlanlarda ara..." className="w-full md:w-96 p-4 border border-slate-200 outline-none focus:border-[#C5A572]" onChange={e => setQ(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rows.filter(r => r.title.toLowerCase().includes(q.toLowerCase())).map(r => (
                <div key={r.id} className="bg-white border border-slate-100 p-6 shadow-sm hover:border-[#C5A572] transition-all">
                  <div className="aspect-video bg-gray-50 mb-4 overflow-hidden relative">
                    <span className={`absolute top-2 left-2 z-10 px-2 py-1 text-[9px] font-bold uppercase text-white ${r.type === 'Kiralık' ? 'bg-orange-500' : 'bg-blue-600'}`}>{r.type}</span>
                    {r.cover_url ? <img src={r.cover_url} className="w-full h-full object-cover" alt="" /> : r.listing_images?.[0]?.url ? <img src={r.listing_images[0].url} className="w-full h-full object-cover" alt="" /> : <div className="flex h-full items-center justify-center text-xs text-gray-300 italic">Resim Yok</div>}
                  </div>
                  <h3 className="font-medium text-[#112769] mb-4 truncate">{r.title}</h3>
                  <div className="text-sm text-slate-400 mb-6">{r.price_tl?.toLocaleString() || 0} TL</div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(r)} className="flex-1 py-2 text-[10px] font-bold uppercase border border-[#112769] text-[#112769] hover:bg-[#112769] hover:text-white transition-all">Düzenle</button>
                    <button onClick={() => handleDelete(r.id)} className="flex-1 py-2 text-[10px] font-bold uppercase border border-red-100 text-red-400 hover:bg-red-500 hover:text-white transition-all">Sil</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-white p-8 border border-[#112769]/5 shadow-sm">
              <h3 className="text-xs font-bold text-[#112769] uppercase tracking-widest mb-4 italic">Metinden İçe Aktar</h3>
              <textarea className="w-full h-32 p-4 bg-[#F8FAFC] border border-slate-100 outline-none focus:border-[#C5A572] text-sm font-light italic" placeholder="Metni buraya yapıştırın..." value={importText} onChange={e => setImportText(e.target.value)} />
              <button onClick={parseFromText} className="mt-4 px-6 py-3 bg-[#112769] text-white text-[10px] font-bold uppercase hover:bg-[#C5A572]">Çözümle</button>
            </div>

            <div className="bg-white p-10 shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">İlan Başlığı</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#C5A572]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Fiyat (Göründüğü gibi)</label>
                  <input value={priceLine} onChange={e => setPriceLine(e.target.value)} className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#C5A572]" placeholder="Örn: 12.500.000 TL" />
                </div>
              </div>

              <div className="mb-12 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">İlan Türü</label>
                <div className="flex gap-4">
                  {["Satılık", "Kiralık"].map(t => (
                    <button key={t} onClick={() => setType(t as any)} className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border ${type === t ? 'bg-[#112769] text-white border-[#112769]' : 'bg-white text-[#8B92A4] border-slate-100 hover:border-[#112769]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {SPEC_FIELDS.map(f => (
                  <div key={f} className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-300 uppercase">{f}</label>
                    <input value={details[f] || ""} onChange={e => setDetails({...details, [f]: e.target.value})} className="w-full border-b border-slate-100 py-1 text-xs outline-none focus:border-[#C5A572]" />
                  </div>
                ))}
              </div>

              <div className="mb-12 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">İlan Açıklaması</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full h-48 p-4 bg-[#F8FAFC] border border-slate-100 outline-none focus:border-[#C5A572] text-sm" placeholder="İlan detayları..." />
              </div>

              <div className="mb-12">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-4">Görseller</label>
                <div className="flex flex-wrap gap-4">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative w-24 h-24 border border-slate-200 shadow-sm">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center">×</button>
                    </div>
                  ))}
                  <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 cursor-pointer hover:border-[#C5A572] transition-all text-slate-400">
                    <span className="text-xl">+</span>
                    <input type="file" multiple className="hidden" onChange={handleImageSelect} />
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleSave} disabled={loading} className="flex-1 bg-[#112769] text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C5A572] transition-all">
                  {loading ? "Kaydediliyor..." : "Portföyü Kaydet"}
                </button>
                <button onClick={resetForm} className="px-10 border border-slate-200 text-slate-400 text-xs font-bold uppercase hover:bg-slate-50 transition-all">Vazgeç</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;