import { useEffect } from 'react';

const LANDING = 'main section h1, main section h2, main section > div > p, main section [class*="grid"] > *';
const DASHBOARD = 'main [class*="grid"] > *';

/** Hiện dần phần tử khi cuộn tới. 'dashboard' còn theo dõi DOM để áp cho cả nội dung đổi tab. */
export function useScrollReveal(enabled: boolean, mode: 'landing' | 'dashboard' = 'landing') {
  useEffect(() => {
    if (!enabled) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = reduce || !('IntersectionObserver' in window) ? null : new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target as HTMLElement;
      el.style.setProperty('--reveal-delay', (el.dataset.delay || '0') + 'ms');
      el.setAttribute('data-reveal', 'in');
      io!.unobserve(el);
    }), { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    const tag = () => {
      document.querySelectorAll<HTMLElement>((mode === 'landing' ? LANDING : DASHBOARD) + ',[data-reveal=""]').forEach(el => {
        if ((el.getAttribute('data-reveal') ?? '') !== '') return;
        if (!el.dataset.delay) {
          const i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.dataset.delay = String(Math.min(i, 5) * (mode === 'landing' ? 90 : 60));
        }
        el.setAttribute('data-reveal', io ? 'pending' : 'in');
        io?.observe(el);
      });
    };
    tag();
    let raf = 0;
    const mo = mode === 'dashboard' ? new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tag(); }); }) : null;
    mo?.observe(document.querySelector('main') ?? document.body, { childList: true, subtree: true });
    return () => { io?.disconnect(); mo?.disconnect(); cancelAnimationFrame(raf); };
  }, [enabled, mode]);
}
