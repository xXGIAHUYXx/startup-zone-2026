import { useEffect, useRef } from 'react';

// [id của khối trên trang, tab tương ứng trên thanh điều hướng] — theo thứ tự xuất hiện
const ANCHORS: [string, string][] = [
  ['home', 'home'], ['service-workshop', 'workshop'], ['service-gifts', 'gifts'],
  ['coordination-model', 'model'], ['artisans', 'about'],
];

/** Khi cuộn, tab của khối đang chiếm "đường ngắm" (~30% chiều cao màn hình) sẽ sáng lên. */
export function useScrollSpy(enabled: boolean, onChange: (tab: string) => void) {
  const locked = useRef(false);
  const timer = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0, cur = '';
    const update = () => {
      raf = 0;
      const line = 56 + window.innerHeight * 0.3;
      let tab = 'home';
      for (const [id, t] of ANCHORS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) tab = t;
      }
      if (tab !== cur) { cur = tab; onChange(tab); }
    };
    const onScroll = () => {
      if (locked.current) { // đang cuộn do bấm menu: chờ dừng rồi mới đồng bộ lại
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => { locked.current = false; update(); }, 150);
        return;
      }
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [enabled]);
  // Gọi khi người dùng bấm menu để tab không nhấp nháy qua các khối trung gian
  return () => {
    locked.current = true;
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { locked.current = false; }, 900);
  };
}
