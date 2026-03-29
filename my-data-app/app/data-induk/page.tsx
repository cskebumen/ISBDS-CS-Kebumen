'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

// Tipe data anggota
type Anggota = {
  nia: string;
  nama: string;
  ranting: string;
};

// Data dummy (nanti diganti dengan fetch dari Supabase)
const dummyAnggota: Anggota[] = [
  { nia: '03.06.02.000001', nama: 'Imam Nawawi', ranting: 'Kebumen' },
  { nia: '03.06.02.000002', nama: 'Ahmad Setiawan', ranting: 'Gombong' },
  { nia: '03.06.02.000003', nama: 'Siti Purwanti', ranting: 'Karanganyar' },
  { nia: '03.06.02.000004', nama: 'Bambang Riyadi', ranting: 'Kutowinangun' },
  { nia: '03.06.02.000005', nama: 'Dewi Safitri', ranting: 'Prembun' },
  { nia: '03.06.02.000006', nama: 'Rian Kurniawan', ranting: 'Kebumen' },
  { nia: '03.06.02.000007', nama: 'Eko Nugroho', ranting: 'Petanahan' },
  { nia: '03.06.02.000008', nama: 'Mulyadi Saputra', ranting: 'Klirong' },
  { nia: '03.06.02.000009', nama: 'Ani Nuraini', ranting: 'Ayah' },
  { nia: '03.06.02.000010', nama: 'Tri Pamungkas', ranting: 'Gombong' },
  { nia: '03.06.02.000011', nama: 'Heri Jatmiko', ranting: 'Alian' },
  { nia: '03.06.02.000012', nama: 'Ratna Sari', ranting: 'Kebumen' },
  { nia: '03.06.02.000013', nama: 'Wahyu Adi', ranting: 'Karanggayam' },
  { nia: '03.06.02.000014', nama: 'Lutfi Burhan', ranting: 'Sempor' },
  { nia: '03.06.02.000015', nama: 'Indra Kusuma', ranting: 'Kebumen' },
];

export default function DataIndukPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [anggota, setAnggota] = useState<Anggota[]>(dummyAnggota);

  // Filter data berdasarkan pencarian
  const filteredAnggota = anggota.filter(
    (item) =>
      item.nia.includes(searchTerm) ||
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ranting.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler hapus anggota
  const handleDelete = (nia: string) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      setAnggota(anggota.filter((a) => a.nia !== nia));
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col bg-surface">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-3 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-blue-900">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-sm">search</span>
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-2 text-sm w-48 md:w-64 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="Cari data anggota..."
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-bold text-on-surface">Budi Santoso</p>
                <p className="text-[10px] text-slate-500">Admin Cabang</p>
              </div>
              <img
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/..."
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-20 px-4 md:px-8 pb-12 flex-1">
          {/* Header Halaman */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-primary">Data Induk</h2>
              <p className="text-sm text-on-surface-variant mt-1">Kelola data seluruh anggota aktif dan non-aktif Cabang Kebumen.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-xl font-semibold text-sm hover:brightness-95 transition-all"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Export to Excel
              </button>
              <button
                onClick={() => setShowTambahModal(true)}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm shadow-sm hover:scale-[1.02] transition-all"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Tambah Anggota
              </button>
            </div>
          </div>

          {/* Banner Import */}
          <div className="bg-blue-50 border-none rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-3xl">upload_file</span>
              </div>
              <div>
                <h4 className="font-bold text-primary">Butuh menginput data induk anggota secara masal?</h4>
                <p className="text-sm text-blue-700/70">Gunakan fitur import excel untuk mempercepat proses entri data ribuan anggota sekaligus.</p>
              </div>
            </div>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-6 py-2 bg-white text-primary border border-blue-100 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
            >
              Import Data
            </button>
          </div>

          {/* Tabel Data */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_24px_48px_rgba(0,31,64,0.06)] border border-slate-100/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">NIA</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nama Lengkap</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ranting</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAnggota.map((item) => (
                    <tr key={item.nia} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.nia}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs">
                            {item.nama.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{item.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{item.ranting}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detail">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.nia)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination sederhana */}
            <div className="px-6 py-5 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500">
                Menampilkan 1 - {filteredAnggota.length} dari {anggota.length} data
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
                  Sebelumnya
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-6 mt-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-8 bg-surface border-t border-slate-100">
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            © 2024 ISBDS Cipta Sejati Cabang Kebumen. All rights reserved.
          </p>
          <div className="flex gap-6 mt-2 md:mt-0">
            <a href="#" className="text-[11px] font-medium uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#" className="text-[11px] font-medium uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="#" className="text-[11px] font-medium uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors">
              Hubungi Kami
            </a>
          </div>
        </footer>
      </main>

      {/* Modal Tambah Anggota */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-primary">Form Tambah Anggota Baru</h3>
                <p className="text-sm text-on-surface-variant">Lengkapi data personal dan riwayat bela diri anggota.</p>
              </div>
              <button onClick={() => setShowTambahModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-8">
                {/* Form fields sesuai desain asli (ringkasan) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Foto Anggota</label>
                    <div className="aspect-[3/4] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-4 hover:border-blue-300 transition-colors cursor-pointer group">
                      <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-blue-400 mb-2">add_a_photo</span>
                      <p className="text-xs text-slate-400 font-medium">Klik untuk upload pas foto (Maks 2MB)</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Nama Lengkap</label>
                      <input className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="Masukkan nama lengkap sesuai identitas" type="text" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Tempat Lahir</label>
                      <input className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="Kebumen" type="text" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Tanggal Lahir</label>
                      <input className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" type="date" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Jenis Kelamin</label>
                      <select className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20">
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Nomor HP/WA</label>
                      <input className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="08xxxx" type="tel" />
                    </div>
                  </div>
                </div>
                {/* Alamat, Ranting, Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Alamat Lengkap</label>
                    <textarea className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="Jl. Pahlawan No. 123..." rows={2}></textarea>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Ranting</label>
                    <input className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20" type="text" defaultValue="Kebumen" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Cabang</label>
                    <input className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm cursor-not-allowed" disabled type="text" value="Kebumen" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Status Aktif</label>
                    <select className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20">
                      <option>Aktif</option>
                      <option>Cuti/Mangkir</option>
                      <option>Alumni</option>
                    </select>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowTambahModal(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                    Batal
                  </button>
                  <button type="submit" className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:brightness-110 transition-all">
                    Simpan Data Anggota
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Data */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-primary">Import Data Induk</h3>
              <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-6">
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center flex flex-col items-center justify-center group hover:border-blue-300 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <p className="font-bold text-on-surface mb-1">Pilih File Excel</p>
                <p className="text-xs text-on-surface-variant">Klik atau drag & drop file .xls atau .xlsx</p>
              </div>
              <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  <p className="text-xs font-medium text-blue-800">Belum punya format file import?</p>
                </div>
                <button className="text-xs font-bold text-primary underline underline-offset-4">Download Template</button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowImportModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                  Batal
                </button>
                <button className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:brightness-110 transition-all">
                  Mulai Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
