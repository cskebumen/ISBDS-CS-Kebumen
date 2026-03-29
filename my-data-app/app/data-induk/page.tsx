'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import Link from 'next/link';

// Type sesuai skema SQL asli
type RiwayatSabuk = {
  tingkat: string;
  no_sertifikat: string;
  tahun: string | number;
};

type Anggota = {
  id?: string;
  nia: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat_lengkap: string;
  ranting: string;
  cabang: string;
  no_hp: string;
  status_anggota: string;
  foto_url?: string;
};

export default function DataIndukPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);

  const listSabuk = [
    'Kuning', 'Hijau', 'Biru', 'Cokelat', 
    'Hitam 1', 'Hitam 2', 'Hitam 3', 'Hitam 4',
    'Merah 1', 'Merah 2', 'Merah 3', 'Merah 4'
  ];

  const [formData, setFormData] = useState<Partial<Anggota>>({
    nama_lengkap: '', ranting: '', cabang: 'Kebumen', tempat_lahir: '', tanggal_lahir: '', 
    jenis_kelamin: 'Laki-laki', alamat_lengkap: '', no_hp: '', status_anggota: 'Aktif'
  });
  
  const [riwayatFields, setRiwayatFields] = useState<RiwayatSabuk[]>([{ tingkat: '', no_sertifikat: '', tahun: '' }]);

  const fetchAnggota = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('anggota').select('*').order('created_at', { ascending: false });
    if (!error && data) setAnggota(data);
    setLoading(false);
  };

  useEffect(() => { fetchAnggota(); }, []);

  const generateNextNIA = async () => {
    const { data } = await supabase.from('anggota')
      .select('nia')
      .like('nia', '03.06.02.%')
      .order('nia', { ascending: false })
      .limit(1);
    
    const prefix = "03.06.02.";
    if (data && data.length > 0) {
      const lastNum = parseInt(data[0].nia.split('.').pop() || '0');
      return prefix + (lastNum + 1).toString().padStart(6, '0');
    }
    return prefix + "000001";
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data ${nama}? Semua riwayat sabuk juga akan terhapus.`)) {
      try {
        // Hapus riwayat sabuk terlebih dahulu karena foreign key
        await supabase.from('riwayat_sabuk').delete().eq('anggota_id', id);
        const { error } = await supabase.from('anggota').delete().eq('id', id);
        if (error) throw error;
        fetchAnggota();
      } catch (err: any) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let anggotaId = editingAnggota?.id;

      if (editingAnggota) {
        const { error } = await supabase.from('anggota').update(formData).eq('id', anggotaId);
        if (error) throw error;
      } else {
        const newNia = await generateNextNIA();
        const { data, error } = await supabase.from('anggota')
          .insert([{ ...formData, nia: newNia }])
          .select()
          .single();
        if (error) throw error;
        anggotaId = data.id;
      }

      if (anggotaId) {
        await supabase.from('riwayat_sabuk').delete().eq('anggota_id', anggotaId);
        const riwayatData = riwayatFields
          .filter(r => r.tingkat !== '')
          .map(r => ({
            anggota_id: anggotaId,
            tingkat: r.tingkat,
            no_sertifikat: r.no_sertifikat,
            tahun: parseInt(r.tahun.toString()) || null
          }));

        if (riwayatData.length > 0) {
          const { error: errSabuk } = await supabase.from('riwayat_sabuk').insert(riwayatData);
          if (errSabuk) throw errSabuk;
        }
      }

      setShowTambahModal(false);
      fetchAnggota();
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally { setIsSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col pb-20">
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/90 backdrop-blur-md flex justify-between items-center px-4 py-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="bg-slate-100 rounded-full pl-9 pr-4 py-1.5 text-xs w-36 md:w-64 outline-none border border-transparent focus:border-primary/30" 
                placeholder="Cari nama..." 
              />
            </div>
          </div>
          <ProfilePopup />
        </header>

        <div className="pt-16 px-3 md:px-8 flex-1">
          <div className="flex justify-between items-center my-4">
            <h2 className="text-xl font-black text-primary tracking-tight">Data Induk</h2>
            <button onClick={() => { 
              setEditingAnggota(null); 
              setFormData({ nama_lengkap: '', ranting: '', cabang: 'Kebumen', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', alamat_lengkap: '', no_hp: '', status_anggota: 'Aktif' });
              setRiwayatFields([{ tingkat: '', no_sertifikat: '', tahun: '' }]);
              setShowTambahModal(true); 
            }} className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold text-[10px] md:text-xs shadow-md active:scale-95 transition-transform">
              + ANGGOTA
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed md:table-auto">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="w-1/3 px-3 py-3 text-[10px] font-bold uppercase text-slate-500">Info Anggota</th>
                    <th className="w-1/4 px-2 py-3 text-[10px] font-bold uppercase text-slate-500 hidden md:table-cell text-center">NIA</th>
                    <th className="w-1/3 px-3 py-3 text-[10px] font-bold uppercase text-slate-500 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={3} className="py-10 text-center text-xs text-slate-400">Memuat data...</td></tr>
                  ) : anggota.length === 0 ? (
                    <tr><td colSpan={3} className="py-10 text-center text-xs text-slate-400">Belum ada data anggota.</td></tr>
                  ) : anggota.filter(a => a.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.nama_lengkap}</span>
                          <span className="text-[9px] font-mono text-slate-400 md:hidden">{item.nia}</span>
                          <span className="text-[9px] text-blue-600 font-medium">{item.ranting}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center hidden md:table-cell">
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{item.nia}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center items-center gap-1.5 md:gap-3">
                          <Link href={`/profil/${item.nia}`} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Link>
                          <button onClick={async () => { 
                            setEditingAnggota(item); 
                            setFormData(item);
                            const { data } = await supabase.from('riwayat_sabuk').select('*').eq('anggota_id', item.id);
                            setRiwayatFields(data && data.length > 0 ? data : [{ tingkat: '', no_sertifikat: '', tahun: '' }]);
                            setShowTambahModal(true); 
                          }} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => handleDelete(item.id!, item.nama_lengkap)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Form Tambah/Edit */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 md:p-6">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-20">
              <h3 className="font-black text-primary uppercase text-sm tracking-tight">Formulir Anggota</h3>
              <button onClick={() => setShowTambahModal(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 md:w-full aspect-[3/4] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
                    <span className="material-symbols-outlined text-3xl text-slate-300">add_a_photo</span>
                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Foto 3X4</p>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Lengkap</label>
                    <input required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tempat Lahir</label>
                      <input value={formData.tempat_lahir} onChange={e => setFormData({...formData, tempat_lahir: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tgl Lahir</label>
                      <input type="date" value={formData.tanggal_lahir} onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Alamat Lengkap</label>
                  <textarea value={formData.alamat_lengkap} onChange={e => setFormData({...formData, alamat_lengkap: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ranting</label>
                    <input required value={formData.ranting} onChange={e => setFormData({...formData, ranting: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">WA</label>
                    <input value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs" />
                  </div>
                </div>
              </div>

              {/* Riwayat Sabuk */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-[11px] text-primary uppercase">Riwayat Sabuk</h4>
                  <button type="button" onClick={() => setRiwayatFields([...riwayatFields, { tingkat: '', no_sertifikat: '', tahun: '' }])} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">+ TAMBAH</button>
                </div>
                <div className="space-y-2">
                  {riwayatFields.map((field, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-2 p-3 bg-slate-50 rounded-xl relative">
                      <select 
                        value={field.tingkat} 
                        onChange={e => {
                          const updated = [...riwayatFields];
                          updated[idx].tingkat = e.target.value;
                          setRiwayatFields(updated);
                        }} 
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px]"
                      >
                        <option value="">Pilih Sabuk</option>
                        {listSabuk.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input placeholder="No Sertifikat" value={field.no_sertifikat} onChange={e => {
                          const updated = [...riwayatFields];
                          updated[idx].no_sertifikat = e.target.value;
                          setRiwayatFields(updated);
                        }} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px]" />
                      <input type="number" placeholder="Tahun" value={field.tahun} onChange={e => {
                          const updated = [...riwayatFields];
                          updated[idx].tahun = e.target.value;
                          setRiwayatFields(updated);
                        }} className="w-full md:w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px]" />
                      <button type="button" onClick={() => setRiwayatFields(riwayatFields.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-white text-red-500 shadow-sm border border-slate-100 rounded-full p-1">
                        <span className="material-symbols-outlined text-sm font-bold">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t mt-4">
                <button type="button" onClick={() => setShowTambahModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-[10px] text-slate-500 hover:bg-slate-200 transition-colors">BATAL</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold text-[10px] shadow-lg hover:opacity-90 active:scale-[0.98] transition-all">
                  {isSaving ? 'MEMPROSES...' : 'SIMPAN DATA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
