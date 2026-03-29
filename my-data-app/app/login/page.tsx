'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementasi autentikasi dengan Supabase nanti
    router.push('/dashboard');
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 md:py-6 bg-transparent">
        <div className="text-lg md:text-xl font-extrabold text-blue-900 tracking-tighter font-headline">
          ISBDS Cipta Sejati
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-blue-900 cursor-pointer hover:text-blue-700 transition-colors">
            help_outline
          </span>
          <span className="material-symbols-outlined text-blue-900 cursor-pointer hover:text-blue-700 transition-colors">
            info
          </span>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row items-stretch min-h-screen">
        {/* Kolom Kiri: Slider informasi (disembunyikan di mobile) */}
        <section className="hidden md:flex flex-col lg:w-3/5 relative overflow-hidden items-center justify-center py-20 lg:py-0 min-h-[400px] lg:min-h-screen">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-tertiary-container/60 backdrop-blur-sm"></div>
          </div>
          <div className="relative z-10 px-6 md:px-16 max-w-2xl text-white text-center lg:text-left">
            <span className="inline-block px-3 py-1 bg-primary/30 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6 border border-white/10">
              Sistem Informasi Manajemen
            </span>
            <h1 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight">
              Membangun Fondasi Digital <br className="hidden lg:block"/> <span className="text-primary-fixed">Keluarga Besar ISBDS.</span>
            </h1>
            <p className="text-base md:text-lg text-white/90 leading-relaxed font-light mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0">
              Kelola administrasi, keanggotaan, dan kegiatan operasional ISBDS Cipta Sejati Cabang Kebumen dalam satu platform yang terintegrasi dan aman.
            </p>
            <div className="flex gap-2 justify-center lg:justify-start">
              <div className="h-1.5 w-12 bg-primary-fixed rounded-full"></div>
              <div className="h-1.5 w-3 bg-primary-fixed-dim rounded-full"></div>
              <div className="h-1.5 w-3 bg-primary-fixed-dim rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Kolom Kanan: Form Login */}
        <section className="w-full lg:w-2/5 flex flex-col items-center justify-center bg-surface-container-low px-4 sm:px-8 lg:px-12 relative py-20 lg:py-0 min-h-screen lg:min-h-full">
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="w-full max-w-md">
            <div className="bg-surface-container-lowest p-6 sm:p-10 lg:p-12 rounded-xl custom-shadow border border-outline-variant/20">
              <div className="flex flex-col items-center mb-8 md:mb-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <img
                    src="/images/isbds.png"
                    alt="Logo ISBDS"
                    className="w-10 h-10 md:w-14 md:h-14 object-contain brightness-50"
                  />
                </div>
                <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface tracking-tight">Selamat Datang</h2>
                <p className="text-on-surface-variant font-body text-xs md:text-sm mt-1 md:mt-2">Silakan masuk ke akun Anda</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] md:text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                    Username
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                      person
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-surface-tint/40 transition-all text-on-surface placeholder:text-on-surface-variant/50"
                      placeholder="Masukkan username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] md:text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 md:py-4 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-surface-tint/40 transition-all text-on-surface placeholder:text-on-surface-variant/50"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input type="checkbox" className="peer h-5 w-5 rounded border-outline-variant bg-surface-container-highest text-primary focus:ring-primary/20 transition-all" />
                    </div>
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Ingat saya</span>
                  </label>
                  <a href="#" className="text-sm font-semibold text-tertiary hover:text-primary transition-colors">Lupa Password?</a>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 md:py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  Masuk Ke Sistem
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </form>

              <div className="mt-8 md:mt-12 text-center">
                <p className="text-[10px] md:text-xs text-on-surface-variant/70 italic">
                  Butuh bantuan akses? Hubungi Admin Cabang Kebumen.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
<Footer />

    </div>
  );
}
