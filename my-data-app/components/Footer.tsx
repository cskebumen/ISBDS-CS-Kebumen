'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="w-full py-4 mt-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-8 bg-surface border-t border-slate-80 fixed bottom-0 left-0 right-0 md:left-64 z-30">
      <p className="text-[7px] font-small uppercase tracking-widest text-slate-400">
        © {currentYear} ISBDS Cipta Sejati Cabang Kebumen. All rights reserved.
      </p>
    </footer>
  );
}
