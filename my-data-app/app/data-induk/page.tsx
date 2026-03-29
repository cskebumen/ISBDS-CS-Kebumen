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
  
  // Modals
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Modal Detail Baru
  
  const [isSaving, setIsSaving] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null); // State Data Detail

  const [formData, setFormData] = useState<Partial<Anggota>>({
    nama_lengkap: '', ranting: '', cabang: 'Kebumen', tempat_lahir: '', tanggal_lahir: '', 
    jenis_kelamin: 'Laki-laki', alamat_lengkap: '', no_hp: '', status_anggota: 'Aktif'
  });
  
  const [riwayatFields, setRiwayatFields] = useState<RiwayatSabuk[]>([{ tingkat: '', no_sertifikat: '', tahun: '' }]);
  const [detailRiwayat, setDetailRiwayat] = useState<RiwayatSabuk[]>([]); // Riwayat untuk modal detail

  useEffect(() => { fetchAnggota(); }, []);

  const fetchAnggota = async () => {
    setLoading(true);
    // Diubah menjadi ascending: true agar NIA terkecil (000001) di atas
    const { data, error } = await supabase.from('anggota').select('*').order('nia', { ascending: true });
    if (!error && data) setAnggota(data);
    setLoading(false);
  };

  // --- Fungsi Buka Detail Modal ---
  const handleOpenDetail = async (item: Anggota) => {
    setSelectedAnggota(item);
    setShowDetailModal(true);
    // Ambil data riwayat sabuk dari Supabase
    const { data } = await supabase.from('riwayat_sabuk').select('*').eq('anggota_id', item.id).order('tahun', { ascending: true });
    setDetailRiwayat(data || []);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(anggota.map(a => ({
      NIA: a.nia, 'Nama Lengkap': a.nama_lengkap, Ranting: a.ranting, Status: a.status_anggota, 'No HP': a.no_hp
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Induk');
    XLSX.writeFile(workbook, `data_induk_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const downloadTemplate = () => {
    const template = [{
      'Nama Lengkap': 'Contoh Nama', Ranting: 'Kebumen', 'Tempat Lahir': 'Kebumen', 'Tanggal Lahir': '1990-01-01', 'Jenis Kelamin': 'Laki-laki', 'Alamat Lengkap': 'Jl. Merdeka No.1', 'No HP': '0812...', 'Status Anggota': 'Aktif'
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_import_isbds.xlsx');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      
      const formattedData = data.map(row => ({
        nama_lengkap: row['Nama Lengkap'] || '',
        ranting: row.Ranting || '',
        tempat_lahir: row['Tempat Lahir'] || '',
        tanggal_lahir: row['Tanggal Lahir'] || '',
        jenis_kelamin: row['Jenis Kelamin'] || 'Laki-laki',
        alamat_lengkap: row['Alamat Lengkap'] || '',
        no_hp: row['No HP'] || '',
        status_anggota: row['Status Anggota'] || 'Aktif',
        cabang: 'Kebumen'
      }));

      const { error } = await supabase.from('anggota').insert(formattedData);
      if (error) alert("Gagal import: " + error.message);
      else {
        alert(`Berhasil import ${data.length} data`);
        fetchAnggota();
      }
      setShowImportModal(false);
    };
    reader.readAsBinaryString(file);
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
      alert("Error: " + err.message);
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
            <div>
              <h2 className="text-lg font-black text-primary uppercase leading-tight">Data Induk</h2>
              <p className="text-[9px] text-slate-400">ISBDS CIPTA SEJATI CABANG KEBUMEN</p>
            </div>
            <div className="flex gap-2">
               <button onClick={exportToExcel} className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-200"><span className="material-symbols-outlined text-sm">download</span></button>
               <button onClick={() => setShowImportModal(true)} className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200"><span className="material-symbols-outlined text-sm">upload_file</span></button>
               <button onClick={() => { setEditingAnggota(null); setFormData({nama_lengkap:'', ranting:'', cabang:'Kebumen', jenis_kelamin:'Laki-laki', status_anggota:'Aktif'}); setRiwayatFields([{tingkat:'', no_sertifikat:'', tahun:''}]); setShowTambahModal(true); }} className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold text-[10px] shadow-md uppercase">+ Anggota</button>
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
                    <td className="px-3 py-3">
                      <div className="flex justify-center items-center gap-2">
                        {/* Diubah jadi Modal Detail */}
                        <button onClick={() => handleOpenDetail(item)} className="p-1 text-blue-500 bg-blue-50 rounded-md">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        
                        <button onClick={async () => { 
                            setEditingAnggota(item); 
                            setFormData(item); 
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

      {/* --- MODAL DETAIL ANGGOTA (SESUAI GAMBAR) --- */}
      {showDetailModal && selectedAnggota && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-white">
              <h3 className="font-black text-primary uppercase text-[12px]">Detail Anggota</h3>
              <button onClick={() => setShowDetailModal(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-600 transition-colors">close</button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {/* Header Profile */}
              <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                <div className="w-32 h-40 bg-slate-100 rounded-2xl border-2 border-slate-100 flex-shrink-0 overflow-hidden">
                  {selectedAnggota.foto_url ? (
                    <img src={selectedAnggota.foto_url} className="w-full h-full object-cover" alt="Foto" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-black text-slate-800 uppercase leading-none">{selectedAnggota.nama_lengkap}</h2>
                  <p className="text-sm font-mono text-slate-400 mt-1">{selectedAnggota.nia}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded uppercase">{selectedAnggota.cabang}</span>
                    <span className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded uppercase">{selectedAnggota.status_anggota}</span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Tempat, Tanggal Lahir</p>
                      <p className="text-[11px] font-bold text-slate-700 uppercase">{selectedAnggota.tempat_lahir}, {selectedAnggota.tanggal_lahir}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Alamat Lengkap</p>
                      <p className="text-[11px] font-bold text-slate-700 uppercase">{selectedAnggota.alamat_lengkap}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">No. HP / WhatsApp</p>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                        <span className="material-symbols-outlined text-[16px] text-green-500">call</span>
                        {selectedAnggota.no_hp}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabel Riwayat Sabuk */}
              <div>
                <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-800 uppercase mb-3">
                  <span className="material-symbols-outlined text-[18px]">military_tech</span> Riwayat Sabuk
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <tr>
                        <th className="px-4 py-2">Sabuk</th>
                        <th className="px-4 py-2">Tahun</th>
                        <th className="px-4 py-2">Sertifikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detailRiwayat.length > 0 ? detailRiwayat.map((r, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 font-medium">{r.tingkat}</td>
                          <td className="px-4 py-2">{r.tahun}</td>
                          <td className="px-4 py-2 text-slate-400">{r.no_sertifikat || '-'}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-400">Belum ada riwayat kenaikan sabuk.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-slate-50 flex justify-end">
               <button onClick={() => setShowDetailModal(false)} className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-wider">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-20">
              <h3 className="font-black text-primary uppercase text-[12px]">{editingAnggota ? 'Edit Data Anggota' : 'Registrasi Anggota Baru'}</h3>
              <button onClick={() => setShowTambahModal(false)} className="material-symbols-outlined text-slate-400">close</button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block italic">Pas Foto 3x4</label>
                  <div className="aspect-[3/4] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                    <p className="text-[9px] mt-2 font-black uppercase">Upload Foto</p>
                  </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                    <input required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none" placeholder="Masukkan nama lengkap sesuai KTP..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tempat Lahir</label>
                    <input value={formData.tempat_lahir} onChange={e => setFormData({...formData, tempat_lahir: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Lahir</label>
                    <input type="date" value={formData.tanggal_lahir} onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</label>
                    <select value={formData.jenis_kelamin} onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none">
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor WhatsApp</label>
                    <input type="tel" value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none" placeholder="08..." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Lengkap</label>
                  <textarea value={formData.alamat_lengkap} onChange={e => setFormData({...formData, alamat_lengkap: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" rows={2} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ranting / Tempat Latihan</label>
                  <input required value={formData.ranting} onChange={e => setFormData({...formData, ranting: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status Anggota</label>
                  <select value={formData.status_anggota} onChange={e => setFormData({...formData, status_anggota: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none">
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Mangkir">Mangkir</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cabang Organisasi</label>
                  <input value="Kebumen" disabled className="w-full bg-slate-200 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-500 font-bold" />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-black text-primary text-[10px] uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">military_tech</span> Riwayat Kenaikan Sabuk</h4>
                  <button type="button" onClick={() => setRiwayatFields([...riwayatFields, { tingkat: '', no_sertifikat: '', tahun: '' }])} className="text-[9px] font-bold text-blue-700 bg-white border border-blue-200 px-3 py-1 rounded-full">+ TAMBAH BARIS</button>
                </div>
                {riwayatFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select value={field.tingkat} onChange={e => { const u = [...riwayatFields]; u[idx].tingkat = e.target.value; setRiwayatFields(u); }} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] outline-none">
                      <option value="">Pilih Sabuk</option>
                      {['Kuning','Hijau','Biru','Cokelat','Hitam 1','Hitam 2','Hitam 3'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="No. Sertifikat" value={field.no_sertifikat} onChange={e => { const u = [...riwayatFields]; u[idx].no_sertifikat = e.target.value; setRiwayatFields(u); }} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] outline-none" />
                    <input type="number" placeholder="Thn" value={field.tahun} onChange={e => { const u = [...riwayatFields]; u[idx].tahun = e.target.value; setRiwayatFields(u); }} className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] outline-none" />
                    <button type="button" onClick={() => setRiwayatFields(riwayatFields.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"><span className="material-symbols-outlined">close</span></button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTambahModal(false)} className="flex-1 py-3.5 bg-slate-100 rounded-2xl font-black text-[10px] text-slate-500 uppercase tracking-widest active:scale-95 transition-all">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-3.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                  {isSaving ? 'MEMPROSES DATA...' : 'SIMPAN ANGGOTA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-primary text-[12px] uppercase mb-5 text-center">Import Data Masal</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group" onClick={() => document.getElementById('fileImport')?.click()}>
                <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-blue-500">cloud_upload</span>
                <p className="text-[11px] font-bold text-slate-500 mt-3 uppercase">Pilih File Excel</p>
                <input id="fileImport" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
              </div>
              <button onClick={downloadTemplate} className="w-full text-center text-[10px] font-bold text-blue-600 bg-blue-50 py-2 rounded-lg border border-blue-100 italic">Download format Excel di sini</button>
              <button onClick={() => setShowImportModal(false)} className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
