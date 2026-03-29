'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="w-full py-6 mt-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-8 bg-surface border-t border-slate-100 fixed bottom-0 left-0 right-0 md:left-64 z-30">
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
        © {currentYear} ISBDS Cipta Sejati Cabang Kebumen. All rights reserved.
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
  );
}
