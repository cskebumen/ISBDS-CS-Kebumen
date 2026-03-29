'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import Link from 'next/link';

type RiwayatSabuk = {
  tingkat: string;
  no_sertifikat: string;
  tahun: string;
};

type Anggota = {
  nia: string;
  nama: string;
  ranting: string;
  cabang: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  no_hp: string;
  status_anggota: string;
  foto_url?: string;
  riwayat_sabuk?: RiwayatSabuk[];
};

export default function DataIndukPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Anggota>>({
    nama: '', ranting: '', cabang: 'Kebumen', tempat_lahir: '', tanggal_lahir: '', 
    jenis_kelamin: 'Laki-laki', alamat: '', no_hp: '', status_anggota: 'Aktif'
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
    const { data } = await supabase.from('anggota').select('nia').like('nia', '03.06.02.%').order('nia', { ascending: false }).limit(1);
    const prefix = "03.06.02.";
    if (data && data.length > 0) {
      const lastNum = parseInt(data[0].nia.split('.').pop() || '0');
      return prefix + (lastNum + 1).toString().padStart(6, '0');
    }
    return prefix + "000001";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData, riwayat_sabuk: riwayatFields };
      if (editingAnggota) {
        const { error } = await supabase.from('anggota').update(payload).eq('nia', editingAnggota.nia);
        if (error) throw error;
      } else {
        const newNia = await generateNextNIA();
        const { error } = await supabase.from('anggota').insert([{ ...payload, nia: newNia }]);
        if (error) throw error;
      }
      setShowTambahModal(false);
      fetchAnggota();
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally { setIsSaving(false); }
  };

  // Riwayat Handlers
  const addRiwayat = () => setRiwayatFields([...riwayatFields, { tingkat: '', no_sertifikat: '', tahun: '' }]);
  const updateRiwayat = (idx: number, field: keyof RiwayatSabuk, val: string) => {
    const updated = [...riwayatFields];
    updated[idx][field] = val;
    setRiwayatFields(updated);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col bg-surface pb-24">
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-3 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-blue-900"><span className="material-symbols-outlined">menu</span></button>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-gray-100 rounded-xl px-4 py-2 text-sm w-40 md:w-64 outline-none" placeholder="Cari anggota..." />
          </div>
          <ProfilePopup />
        </header>

        <div className="pt-20 px-4 md:px-8 pb-12 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-primary">Data Induk</h2>
            <button onClick={() => { 
              setEditingAnggota(null); 
              setFormData({ nama: '', ranting: '', cabang: 'Kebumen', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', alamat: '', no_hp: '', status_anggota: 'Aktif' });
              setRiwayatFields([{ tingkat: '', no_sertifikat: '', tahun: '' }]);
              setShowTambahModal(true); 
            }} className="px-5 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg">Tambah Anggota</button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">NIA</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Nama & Ranting</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (<tr><td colSpan={3} className="py-10 text-center">Memuat...</td></tr>) : 
                    anggota.filter(a => a.nama?.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                    <tr key={item.nia} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-sm font-bold">{item.nia}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">{item.nama}</p>
                        <p className="text-xs text-slate-500">{item.ranting}</p>
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <Link href={`/profil/${item.nia}`} className="p-2 text-blue-600"><span className="material-symbols-outlined">visibility</span></Link>
                        <button onClick={() => { setEditingAnggota(item); setFormData(item); setRiwayatFields(item.riwayat_sabuk || []); setShowTambahModal(true); }} className="p-2 text-amber-600"><span className="material-symbols-outlined">edit</span></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showTambahModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
              <h3 className="font-black text-primary uppercase">Formulir Anggota</h3>
              <button onClick={() => setShowTambahModal(false)} className="p-2 rounded-full hover:bg-slate-100"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Bagian Foto */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full aspect-[3/4] rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden">
                    <span className="material-symbols-outlined text-4xl text-slate-400">add_a_photo</span>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">UPLOAD FOTO 3X4</p>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                    <input required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tempat Lahir</label>
                    <input value={formData.tempat_lahir} onChange={e => setFormData({...formData, tempat_lahir: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Lahir</label>
                    <input type="date" value={formData.tanggal_lahir} onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp</label>
                    <input value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                    <select value={formData.status_anggota} onChange={e => setFormData({...formData, status_anggota: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm">
                      <option value="Aktif">Aktif</option><option value="Istirahat">Istirahat</option><option value="Keluar">Keluar</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat</label>
                  <textarea value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm" rows={2} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ranting</label>
                  <input required value={formData.ranting} onChange={e => setFormData({...formData, ranting: e.target.value})} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cabang</label>
                  <input value={formData.cabang} disabled className="w-full bg-slate-200 rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>

              {/* Riwayat Sabuk Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-sm text-primary uppercase">Riwayat Sabuk</h4>
                  <button type="button" onClick={addRiwayat} className="text-xs font-bold text-blue-600">+ TAMBAH</button>
                </div>
                {riwayatFields.map((field, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 mb-3">
                    <input placeholder="Tingkat" value={field.tingkat} onChange={e => updateRiwayat(idx, 'tingkat', e.target.value)} className="bg-slate-50 rounded-lg px-3 py-2 text-xs" />
                    <input placeholder="No Sertifikat" value={field.no_sertifikat} onChange={e => updateRiwayat(idx, 'no_sertifikat', e.target.value)} className="bg-slate-50 rounded-lg px-3 py-2 text-xs" />
                    <input placeholder="Tahun" value={field.tahun} onChange={e => updateRiwayat(idx, 'tahun', e.target.value)} className="bg-slate-50 rounded-lg px-3 py-2 text-xs" />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 sticky bottom-0 bg-white pt-4">
                <button type="button" onClick={() => setShowTambahModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">BATAL</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold shadow-lg">
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
