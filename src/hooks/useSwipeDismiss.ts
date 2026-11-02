import { useEffect, useRef } from 'react';
import type { PointerEvent as RPointerEvent } from 'react';
import { project, rubberband, spring, prefersReducedMotion } from '../utils/motion';

/** Vuốt xuống để đóng sheet: bám 1:1, kéo lên thì rubber-band, thả ra thì chọn đóng/quay lại theo điểm dự phóng của vận tốc. */
export function useSwipeDismiss(isOpen: boolean, onClose: () => void) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const y = useRef(0);
  const stop = useRef<(() => void) | null>(null);
  const st = useRef<{ id: number; sy: number; origin: number; hist: { y: number; t: number }[] } | null>(null);

  const apply = (v: number) => {
    y.current = v;
    if (panel.current) panel.current.style.transform = v ? `translate3d(0,${v}px,0)` : '';
    if (scrim.current) scrim.current.style.opacity = String(Math.max(0, 1 - (Math.max(0, v) / window.innerHeight) * 1.4));
  };
  useEffect(() => { if (isOpen) y.current = 0; return () => stop.current?.(); }, [isOpen]);

  const onPointerDown = (e: RPointerEvent) => {
    if ((e.target as HTMLElement).closest('button,input,textarea,select,a')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stop.current?.(); // có thể nắm lại sheet đang trượt
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    st.current = { id: e.pointerId, sy: e.clientY, origin: y.current, hist: [{ y: e.clientY, t: e.timeStamp }] };
  };
  const onPointerMove = (e: RPointerEvent) => {
    const d = st.current;
    if (!d || e.pointerId !== d.id) return;
    const raw = d.origin + (e.clientY - d.sy);
    apply(raw < 0 ? rubberband(raw, 300) : raw);
    d.hist.push({ y: e.clientY, t: e.timeStamp });
    d.hist = d.hist.filter(h => e.timeStamp - h.t < 100);
  };
  const onPointerUp = () => {
    const d = st.current; st.current = null;
    if (!d) return;
    const a = d.hist[0], b = d.hist[d.hist.length - 1];
    const v = b.t - a.t > 8 ? ((b.y - a.y) / (b.t - a.t)) * 1000 : 0;
    const dismiss = y.current + project(v) > 180; // quyết định theo điểm dự phóng, không theo vị trí lúc thả
    if (prefersReducedMotion()) { dismiss ? onClose() : apply(0); return; }
    if (dismiss) {
      let done = false;
      stop.current = spring(y.current, window.innerHeight, Math.max(v, 0), { response: 0.35, damping: 1 }, val => {
        apply(val);
        if (!done && val >= window.innerHeight * 0.95) { done = true; onClose(); }
      });
    } else {
      stop.current = spring(y.current, 0, v, { response: 0.4, damping: Math.abs(v) > 400 ? 0.8 : 1 }, apply);
    }
  };
  return { panel, scrim, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
}
