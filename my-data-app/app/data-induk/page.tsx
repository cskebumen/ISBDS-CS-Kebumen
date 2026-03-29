'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import Link from 'next/link';
import * as XLSX from 'xlsx';

// --- Types ---
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);

  const [formData, setFormData] = useState<Partial<Anggota>>({
    nama_lengkap: '', ranting: '', cabang: 'Kebumen', tempat_lahir: '', tanggal_lahir: '', 
    jenis_kelamin: 'Laki-laki', alamat_lengkap: '', no_hp: '', status_anggota: 'Aktif'
  });
  
  const [riwayatFields, setRiwayatFields] = useState<RiwayatSabuk[]>([{ tingkat: '', no_sertifikat: '', tahun: '' }]);

  useEffect(() => { fetchAnggota(); }, []);

  const fetchAnggota = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('anggota').select('*').order('created_at', { ascending: false });
    if (!error && data) setAnggota(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let anggotaId = editingAnggota?.id;
      if (editingAnggota) {
        await supabase.from('anggota').update(formData).eq('id', anggotaId);
      } else {
        const { data: lastData } = await supabase.from('anggota').select('nia').like('nia', '03.06.02.%').order('nia', { ascending: false }).limit(1);
        let newNia = "03.06.02.000001";
        if (lastData && lastData.length > 0) {
          const lastNum = parseInt(lastData[0].nia.split('.').pop() || '0');
          newNia = `03.06.02.${(lastNum + 1).toString().padStart(6, '0')}`;
        }
        const { data, error: insErr } = await supabase.from('anggota').insert([{ ...formData, nia: newNia }]).select().single();
        if (insErr) throw insErr;
        anggotaId = data.id;
      }

      if (anggotaId) {
        await supabase.from('riwayat_sabuk').delete().eq('anggota_id', anggotaId);
        const riwayatData = riwayatFields.filter(r => r.tingkat !== '').map(r => ({
          anggota_id: anggotaId, tingkat: r.tingkat, no_sertifikat: r.no_sertifikat, tahun: parseInt(r.tahun.toString()) || null
        }));
        if (riwayatData.length > 0) await supabase.from('riwayat_sabuk').insert(riwayatData);
      }
      setShowTambahModal(false);
      fetchAnggota();
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally { setIsSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-poppins text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col pb-20">
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/90 backdrop-blur-md flex justify-between items-center px-4 py-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2"><span className="material-symbols-outlined">menu</span></button>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-100 rounded-full pl-4 pr-4 py-1.5 text-[11px] w-40 outline-none border focus:border-blue-400" placeholder="Cari..." />
          </div>
          <ProfilePopup />
        </header>

        <div className="pt-16 px-4 flex-1">
          <div className="flex justify-between items-center my-4">
            <h2 className="text-lg font-black text-primary uppercase">Data Induk</h2>
            <button onClick={() => { setEditingAnggota(null); setFormData({nama_lengkap:'', ranting:'', cabang:'Kebumen', jenis_kelamin:'Laki-laki', status_anggota:'Aktif'}); setRiwayatFields([{tingkat:'', no_sertifikat:'', tahun:''}]); setShowTambahModal(true); }} className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold text-[10px] shadow-md">+ ANGGOTA</button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase">Info Anggota</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan={2} className="py-10 text-center text-[11px] text-slate-400">Memuat...</td></tr>
                ) : anggota.filter(a => a.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                  <tr key={item.id}>
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase">{item.nama_lengkap}</span>
                        <span className="text-[9px] text-slate-400">{item.nia} | <span className="text-blue-600 font-bold">{item.ranting}</span></span>
                      </div>
                    </td>
                    <td className="px-3 py-3 flex justify-center gap-2">
                        <Link href={`/profil/${item.nia}`} className="p-1 text-blue-500"><span className="material-symbols-outlined text-[20px]">visibility</span></Link>
                        <button onClick={async () => { 
                            setEditingAnggota(item); 
                            setFormData(item); 
                            const { data } = await supabase.from('riwayat_sabuk').select('*').eq('anggota_id', item.id); 
                            setRiwayatFields(data && data.length > 0 ? data : [{ tingkat: '', no_sertifikat: '', tahun: '' }]); 
                            setShowTambahModal(true); 
                        }} className="p-1 text-amber-500"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </main>

      {/* Modal Form - KEMBALI LENGKAP */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-20">
              <h3 className="font-black text-primary uppercase text-[12px]">{editingAnggota ? 'Edit Anggota' : 'Tambah Anggota'}</h3>
              <button onClick={() => setShowTambahModal(false)} className="material-symbols-outlined text-slate-400">close</button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-6">
              
              {/* SECTION 1: FOTO & IDENTITAS UTAMA */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Upload Foto */}
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Foto Anggota</label>
                  <div className="aspect-[3/4] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                    <p className="text-[9px] mt-1 font-bold">UPLOAD</p>
                  </div>
                </div>

                {/* Input Data Diri */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                    <input required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tempat Lahir</label>
                    <input value={formData.tempat_lahir} onChange={e => setFormData({...formData, tempat_lahir: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Lahir</label>
                    <input type="date" value={formData.tanggal_lahir} onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</label>
                    <select value={formData.jenis_kelamin} onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs outline-none">
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp / No HP</label>
                    <input value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ALAMAT & ORGANISASI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Lengkap</label>
                  <textarea value={formData.alamat_lengkap} onChange={e => setFormData({...formData, alamat_lengkap: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs outline-none" rows={2} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ranting</label>
                  <input required value={formData.ranting} onChange={e => setFormData({...formData, ranting: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status Keanggotaan</label>
                  <select value={formData.status_anggota} onChange={e => setFormData({...formData, status_anggota: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs outline-none">
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Mangkir">Mangkir</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cabang</label>
                  <input value="Kebumen" disabled className="w-full bg-slate-200 border rounded-xl px-3 py-2 text-xs text-slate-500" />
                </div>
              </div>

              {/* SECTION 3: RIWAYAT SABUK */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-black text-primary text-[10px] uppercase">Riwayat Sabuk</h4>
                  <button type="button" onClick={() => setRiwayatFields([...riwayatFields, { tingkat: '', no_sertifikat: '', tahun: '' }])} className="text-[9px] font-bold text-blue-600">+ TAMBAH BARIS</button>
                </div>
                {riwayatFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select value={field.tingkat} onChange={e => { const u = [...riwayatFields]; u[idx].tingkat = e.target.value; setRiwayatFields(u); }} className="flex-1 bg-slate-50 border rounded-lg px-2 py-2 text-[10px]">
                      <option value="">Pilih Sabuk</option>
                      {['Kuning','Hijau','Biru','Cokelat','Hitam'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="No Sert" value={field.no_sertifikat} onChange={e => { const u = [...riwayatFields]; u[idx].no_sertifikat = e.target.value; setRiwayatFields(u); }} className="flex-1 bg-slate-50 border rounded-lg px-2 py-2 text-[10px]" />
                    <input placeholder="Tahun" value={field.tahun} onChange={e => { const u = [...riwayatFields]; u[idx].tahun = e.target.value; setRiwayatFields(u); }} className="w-16 bg-slate-50 border rounded-lg px-2 py-2 text-[10px]" />
                    <button type="button" onClick={() => setRiwayatFields(riwayatFields.filter((_, i) => i !== idx))} className="text-red-500 material-symbols-outlined">delete</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowTambahModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-[10px] uppercase">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold text-[10px] uppercase shadow-lg active:scale-95 transition-all">
                  {isSaving ? 'MEMPROSES...' : 'SIMPAN DATA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
