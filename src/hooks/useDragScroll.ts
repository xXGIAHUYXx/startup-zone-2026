import { useEffect } from 'react';

/** Kéo bằng chuột trên mọi phần tử [data-drag-scroll]: bám 1:1, thả ra có quán tính (decelerationRate 0.998/ms). Cảm ứng dùng cuộn gốc. */
export function useDragScroll() {
  useEffect(() => {
    let el: HTMLElement | null = null, sx = 0, so = 0, moved = false, raf = 0;
    let hist: { x: number; t: number }[] = [];
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-drag-scroll]');
      if (!t || t.scrollWidth <= t.clientWidth) return;
      cancelAnimationFrame(raf); // ngắt quán tính đang chạy, giữ nguyên vị trí hiện tại
      el = t; sx = e.clientX; so = t.scrollLeft; moved = false; hist = [{ x: e.clientX, t: e.timeStamp }];
    };
    const move = (e: PointerEvent) => {
      if (!el) return;
      const dx = e.clientX - sx;
      if (!moved) { if (Math.abs(dx) < 10) return; moved = true; el.style.cursor = 'grabbing'; el.style.userSelect = 'none'; }
      el.scrollLeft = so - dx;
      hist.push({ x: e.clientX, t: e.timeStamp });
      hist = hist.filter(h => e.timeStamp - h.t < 100);
    };
    const up = () => {
      if (!el) return;
      const t = el; el = null;
      t.style.cursor = ''; t.style.userSelect = '';
      if (!moved) return;
      const kill = (ev: Event) => { ev.stopPropagation(); ev.preventDefault(); };
      t.addEventListener('click', kill, { capture: true, once: true });
      setTimeout(() => t.removeEventListener('click', kill, true), 0);
      const a = hist[0], b = hist[hist.length - 1];
      let v = b && a && b.t - a.t > 8 ? (-(b.x - a.x) / (b.t - a.t)) * 1000 : 0;
      let last = performance.now();
      const step = (now: number) => {
        const dt = now - last; last = now;
        t.scrollLeft += (v * dt) / 1000;
        v *= Math.pow(0.998, dt);
        if (Math.abs(v) > 20 && t.scrollLeft > 0 && t.scrollLeft < t.scrollWidth - t.clientWidth) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    document.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointerdown', down); document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
    };
  }, []);
}
