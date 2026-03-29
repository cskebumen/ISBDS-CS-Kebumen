'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
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
  alamat_lengkap: string; // KEMBALI KE ALAMAT_LENGKAP
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
  
  // Modals
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false); // FITUR KEMBALI
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);

  // --- States untuk Foto ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Anggota>>({
    nama_lengkap: '', ranting: '', cabang: 'Kebumen', tempat_lahir: '', tanggal_lahir: '', 
    jenis_kelamin: 'Laki-laki', alamat_lengkap: '', no_hp: '', status_anggota: 'Aktif', foto_url: ''
  });
  
  const [riwayatFields, setRiwayatFields] = useState<RiwayatSabuk[]>([{ tingkat: '', no_sertifikat: '', tahun: '' }]);

  useEffect(() => { fetchAnggota(); }, []);

  const fetchAnggota = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('anggota').select('*').order('nia', { ascending: true });
    if (!error && data) setAnggota(data);
    setLoading(false);
  };

  // --- Fungsi Export Excel ---
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(anggota);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Anggota");
    XLSX.writeFile(wb, `Data_Anggota_ISBDS_${new Date().getFullYear()}.xlsx`);
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi Nama Maks 25 Karakter
    if (formData.nama_lengkap && formData.nama_lengkap.length > 25) {
      alert("Nama terlalu panjang! Maksimal 25 karakter agar muat di sertifikat.");
      return;
    }
    
    setIsSaving(true);
    try {
      let finalFotoUrl = formData.foto_url || '';

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: upErr } = await supabase.storage.from('foto_anggota').upload(fileName, photoFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('foto_anggota').getPublicUrl(fileName);
        finalFotoUrl = urlData.publicUrl;
      }

      let anggotaId = editingAnggota?.id;
      const payload = { ...formData, foto_url: finalFotoUrl };

      if (editingAnggota) {
        await supabase.from('anggota').update(payload).eq('id', anggotaId);
      } else {
        // Logika NIA: 03.06.02.xxxxxx
        const { data: lastData } = await supabase.from('anggota').select('nia').like('nia', '03.06.02.%').order('nia', { ascending: false }).limit(1);
        let newNia = "03.06.02.000001";
        if (lastData && lastData.length > 0) {
          const lastNum = parseInt(lastData[0].nia.split('.').pop() || '0');
          newNia = `03.06.02.${(lastNum + 1).toString().padStart(6, '0')}`;
        }
        const { data, error: insErr } = await supabase.from('anggota').insert([{ ...payload, nia: newNia }]).select().single();
        if (insErr) throw insErr;
        anggotaId = data.id;
      }

      // Riwayat Sabuk: Pakai logic lama agar tidak ganda
      if (anggotaId) {
        const riwayatData = riwayatFields.filter(r => r.tingkat !== '').map(r => ({
          anggota_id: anggotaId, 
          tingkat: r.tingkat, 
          no_sertifikat: r.no_sertifikat || `ISBDS-CS/xxx/SERT-PPD/${new Date().getMonth()+1}/${new Date().getFullYear()}`,
          tahun: parseInt(r.tahun.toString()) || null
        }));
        
        if (riwayatData.length > 0) {
          // Jika kena error RLS di sini, cek izin DELETE & INSERT di tabel riwayat_sabuk
          await supabase.from('riwayat_sabuk').delete().eq('anggota_id', anggotaId);
          await supabase.from('riwayat_sabuk').insert(riwayatData);
        }
      }

      setPhotoFile(null);
      setPhotoPreview(null);
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
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-100 rounded-full pl-4 pr-4 py-1.5 text-[11px] w-40 outline-none border focus:border-blue-400" placeholder="Cari nama..." />
          </div>
          <ProfilePopup />
        </header>

        <div className="pt-16 px-4 flex-1">
          <div className="flex justify-between items-center my-4">
            <div>
              <h2 className="text-lg font-black text-blue-800 uppercase leading-tight">Data Induk</h2>
              <p className="text-[9px] text-slate-400">ISBDS CIPTA SEJATI CABANG KEBUMEN</p>
            </div>
            <div className="flex gap-2">
               {/* TOMBOL EXPORT & IMPORT */}
               <button onClick={handleExportExcel} className="p-2 bg-green-600 text-white rounded-xl shadow-md" title="Export Excel"><span className="material-symbols-outlined text-[18px]">download</span></button>
               <button onClick={() => setShowImportModal(true)} className="p-2 bg-slate-600 text-white rounded-xl shadow-md" title="Import Excel"><span className="material-symbols-outlined text-[18px]">upload_file</span></button>
               
               <button onClick={() => { 
                 setEditingAnggota(null); 
                 setFormData({nama_lengkap:'', ranting:'', cabang:'Kebumen', jenis_kelamin:'Laki-laki', status_anggota:'Aktif', foto_url:'', alamat_lengkap: ''}); 
                 setRiwayatFields([{tingkat:'', no_sertifikat:'', tahun:''}]);
                 setPhotoPreview(null);
                 setShowTambahModal(true); 
               }} className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold text-[10px] shadow-md uppercase tracking-wider">+ Anggota</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase">Info Anggota</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan={2} className="py-10 text-center text-[11px] text-slate-400 font-medium">Memproses data...</td></tr>
                ) : anggota.filter(a => a.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase leading-tight">{item.nama_lengkap}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-mono text-slate-400">{item.nia}</span>
                          <span className="text-[9px] font-bold text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded border border-blue-100">{item.ranting}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={async () => { 
                            setEditingAnggota(item); 
                            setFormData(item); 
                            setPhotoPreview(item.foto_url || null);
                            const { data } = await supabase.from('riwayat_sabuk').select('*').eq('anggota_id', item.id); 
                            setRiwayatFields(data && data.length > 0 ? data : [{ tingkat: '', no_sertifikat: '', tahun: '' }]); 
                            setShowTambahModal(true); 
                        }} className="p-1 text-amber-500 bg-amber-50 rounded-md"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button onClick={async () => { if(confirm('Hapus permanent?')) { await supabase.from('riwayat_sabuk').delete().eq('anggota_id', item.id); await supabase.from('anggota').delete().eq('id', item.id); fetchAnggota(); } }} className="p-1 text-red-500 bg-red-50 rounded-md"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </main>

      {/* --- MODAL IMPORT --- */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="font-black text-blue-800 uppercase text-sm mb-2">Import Data Excel</h3>
            <p className="text-[10px] text-slate-400 mb-6 font-medium">Pilih file .xlsx hasil export sebelumnya untuk mengupdate massal.</p>
            <input type="file" accept=".xlsx, .xls" className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
            <button onClick={() => setShowImportModal(false)} className="mt-8 w-full py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Tutup</button>
          </div>
        </div>
      )}

      {/* --- MODAL FORM (ALAMAT_LENGKAP) --- */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-20">
              <h3 className="font-black text-blue-800 uppercase text-[12px]">{editingAnggota ? 'Edit Data Anggota' : 'Registrasi Anggota Baru'}</h3>
              <button onClick={() => setShowTambahModal(false)} className="material-symbols-outlined text-slate-400">close</button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 text-center">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <div onClick={handlePhotoClick} className="aspect-[3/4] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
                    {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-4xl text-slate-300">add_a_photo</span>}
                  </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                    <input required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none" />
                  </div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Tempat Lahir</label><input value={formData.tempat_lahir} onChange={e => setFormData({...formData, tempat_lahir: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none" /></div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Lahir</label><input type="date" value={formData.tanggal_lahir} onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none" /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Lengkap</label>
                  {/* FIX: Menggunakan alamat_lengkap */}
                  <textarea value={formData.alamat_lengkap} onChange={e => setFormData({...formData, alamat_lengkap: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" rows={2} />
                </div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Ranting</label><input required value={formData.ranting} onChange={e => setFormData({...formData, ranting: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">WA / No HP</label><input value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                  <select value={formData.status_anggota} onChange={e => setFormData({...formData, status_anggota: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none">
                    <option value="Aktif">Aktif</option><option value="Mangkir">Mangkir</option><option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-black text-[10px] uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">military_tech</span> Riwayat Kenaikan Sabuk</h4>
                  <button type="button" onClick={() => setRiwayatFields([...riwayatFields, { tingkat: '', no_sertifikat: '', tahun: '' }])} className="text-[9px] font-bold text-blue-700">+ TAMBAH BARIS</button>
                </div>
                {riwayatFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select value={field.tingkat} onChange={e => { const u = [...riwayatFields]; u[idx].tingkat = e.target.value; setRiwayatFields(u); }} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px]">
                      <option value="">Sabuk</option>
                      {['Kuning','Hijau','Biru','Cokelat','Hitam 1'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="No. Sertifikat" value={field.no_sertifikat} onChange={e => { const u = [...riwayatFields]; u[idx].no_sertifikat = e.target.value; setRiwayatFields(u); }} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px]" />
                    <input placeholder="Tahun" value={field.tahun} onChange={e => { const u = [...riwayatFields]; u[idx].tahun = e.target.value; setRiwayatFields(u); }} className="w-16 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px]" />
                  </div>
                ))}
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                {isSaving ? 'MEMPROSES...' : 'SIMPAN DATA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
