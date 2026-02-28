import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const doLogin = async () => {
    setErrorMsg("");
    setAuthBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPass,
    });

    if (error) {
      setErrorMsg(error.message || "Giriş yapılamadı.");
      setAuthBusy(false);
      return;
    }

    setAuthBusy(false);
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 shadow-2xl shadow-[#112769]/5 border border-[#112769]/5">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-light tracking-tight text-[#112769] mb-2 uppercase italic">Yönetim Girişi</h1>
          <p className="text-sm text-slate-400 font-light tracking-wide">Nuray Keser Gayrimenkul Portföy Yönetimi</p>
        </div>

        {errorMsg && (
          <div className="mb-6 border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase ml-1">E-posta</label>
            <input
              type="email"
              className="w-full bg-[#FAFAFA] border border-slate-200 px-4 py-3 outline-none focus:border-[#112769] transition-colors font-light"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase ml-1">Şifre</label>
            <input
              type="password"
              className="w-full bg-[#FAFAFA] border border-slate-200 px-4 py-3 outline-none focus:border-[#112769] transition-colors font-light"
              value={authPass}
              onChange={(e) => setAuthPass(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") doLogin();
              }}
            />
          </div>

          <button
            onClick={doLogin}
            disabled={authBusy || !authEmail.trim() || !authPass}
            className="w-full bg-[#112769] text-white py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#C5A572] transition-all duration-500 shadow-lg shadow-[#112769]/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authBusy ? "Giriş Yapılıyor..." : "Sisteme Eriş"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;