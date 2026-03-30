'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  // Cek apakah role memiliki akses ke menu tertentu
  const canAccessKeanggotaan = ['admin', 'sekretaris', 'ketua cabang', 'ketua ranting'].includes(role);
  const canAccessDokumen = ['admin', 'sekretaris', 'bendahara', 'ketua cabang', 'ketua ranting', 'anggota'].includes(role);
  const canAccessKeuangan = ['admin', 'bendahara', 'ketua cabang'].includes(role);
  const canAccessKelolaUser = role === 'admin';
  const canAccessSurat = ['admin', 'sekretaris', 'ketua cabang', 'ketua ranting'].includes(role);

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-50 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full py-8">
          <div className="px-8 mb-8 flex justify-between items-center">
            <h1 className="text-lg font-bold text-blue-900">ISBDS Cipta Sejati</h1>
            <button onClick={onClose} className="md:hidden p-2 text-slate-500">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-4 ${isActive('/dashboard') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>

            {/* Kelola User (hanya admin) */}
            {canAccessKelolaUser && (
              <Link
                href="/kelola-user"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-4 ${isActive('/kelola-user') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <span className="material-symbols-outlined">group</span>
                <span>Kelola User</span>
              </Link>
            )}

            {/* Kategori Keanggotaan */}
            {canAccessKeanggotaan && (
              <>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-2 px-4">
                  Keanggotaan
                </div>
                <Link
                  href="/data-induk"
                  onClick={onClose}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/data-induk') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="material-symbols-outlined text-base">database</span>
                  <span>Data Induk</span>
                </Link>
                <Link
                  href="/profil"
                  onClick={onClose}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/profil') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  <span>Profil Anggota</span>
                </Link>
              </>
            )}

            {/* Kategori Dokumen */}
            {canAccessDokumen && (
              <>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-2 px-4">
                  Dokumen
                </div>
                <Link
                  href="/sertifikat"
                  onClick={onClose}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/sertifikat') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="material-symbols-outlined text-base">card_membership</span>
                  <span>E-Sertifikat</span>
                </Link>
                <Link
                  href="/kta"
                  onClick={onClose}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/kta') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="material-symbols-outlined text-base">contact_mail</span>
                  <span>E-KTA</span>
                </Link>
                {canAccessSurat && (
                  <Link
                    href="/surat"
                    onClick={onClose}
                    className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/surat') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                  >
                    <span className="material-symbols-outlined text-base">mail</span>
                    <span>E-Surat</span>
                  </Link>
                )}
              </>
            )}

            {/* Kategori Keuangan */}
            {canAccessKeuangan && (
              <>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-2 px-4">
                  Keuangan
                </div>
                <Link
                  href="/keuangan"
                  onClick={onClose}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/keuangan') && !pathname.includes('/keuangan/transaksi') && !pathname.includes('/keuangan/laporan') && !pathname.includes('/keuangan/master') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="material-symbols-outlined text-base">account_balance</span>
                  <span>Dashboard Keuangan</span>
                </Link>
                <Link
                  href="/keuangan/transaksi/pemasukan"
                  onClick={onClose}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/keuangan/transaksi/pemasukan') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="material-symbols-outlined text-base">arrow_downward</span>
                  <span>Pemasukan</span>
                </Link>
                <Link
                  href="/keuangan/transaksi/pengeluaran"
                  onClick={onClose}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/keuangan/transaksi/pengeluaran') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="material-symbols-outlined text-base">arrow_upward</span>
                  <span>Pengeluaran</span>
                </Link>
                <Link
                  href="/keuangan/laporan"
                  onClick={onClose}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/keuangan/laporan') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  <span>Laporan Keuangan</span>
                </Link>
                <Link
                  href="/keuangan/master"
                  onClick={onClose}
                  className={`flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg transition-all ${isActive('/keuangan/master') ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="material-symbols-outlined text-base">settings</span>
                  <span>Master Keuangan</span>
                </Link>
              </>
            )}
          </nav>

          <div className="px-6 pt-6 border-t border-slate-200 mt-auto">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
