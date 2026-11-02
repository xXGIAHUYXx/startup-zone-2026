import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const apply = (d: boolean) => {
    const r = document.documentElement;
    r.classList.add('theme-transition'); // chuyển sáng↔tối êm, không nhảy độ sáng đột ngột
    r.classList.toggle('dark', d);
    setDark(d);
    setTimeout(() => r.classList.remove('theme-transition'), 550);
  };
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = () => { try { if (!localStorage.getItem('theme')) apply(mq.matches); } catch { /* ignore */ } };
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const toggle = () => {
    const next = !dark;
    apply(next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* ignore */ }
  };
  const icon = 'absolute transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]';
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      className="fixed bottom-5 left-5 z-50 w-11 h-11 rounded-full glass-thick grid place-items-center cursor-pointer text-[#1d1d1f]"
    >
      <Sun size={18} className={`${icon} ${dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
      <Moon size={18} className={`${icon} ${dark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
    </button>
  );
};
