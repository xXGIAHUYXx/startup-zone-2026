import React, { useEffect, useRef, useState } from 'react';
import { project, rubberband, spring, prefersReducedMotion } from '../../utils/motion';

interface Props { children: React.ReactNode; itemClassName?: string; className?: string; }

export const DragCarousel: React.FC<Props> = ({ children, itemClassName = '', className = '' }) => {
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const stop = useRef<(() => void) | null>(null);
  const moved = useRef(false);
  const drag = useRef<{ id: number; sx: number; sy: number; origin: number; active: boolean; hist: { x: number; t: number }[] } | null>(null);
  const [dragging, setDragging] = useState(false);

  const minX = () => Math.min(0, view.current!.clientWidth - track.current!.scrollWidth);
  const apply = (v: number) => { x.current = v; track.current!.style.transform = `translate3d(${v}px,0,0)`; };
  const snaps = () => {
    const min = minX();
    return [...Array.from(track.current!.children).map(c => Math.max(min, -(c as HTMLElement).offsetLeft)), min];
  };
  const nearest = (p: number) => snaps().reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a));
  const animateTo = (target: number, velocity: number) => {
    stop.current?.();
    if (prefersReducedMotion()) return apply(target);
    // Có đà (flick) → nảy nhẹ (0.8); còn lại critically damped (1.0)
    stop.current = spring(x.current, target, velocity, { response: 0.4, damping: Math.abs(velocity) > 400 ? 0.8 : 1 }, apply);
  };

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stop.current?.(); // ngắt animation, giữ nguyên vị trí đang hiển thị
    moved.current = false;
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, origin: x.current, active: false, hist: [{ x: e.clientX, t: e.timeStamp }] };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.active) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; // hysteresis ~10px
      if (Math.abs(dy) > Math.abs(dx)) { drag.current = null; return; } // ý định cuộn dọc
      d.active = true; moved.current = true; d.sx = e.clientX;
      view.current!.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    const raw = d.origin + (e.clientX - d.sx), min = minX(), w = view.current!.clientWidth;
    apply(raw > 0 ? rubberband(raw, w) : raw < min ? min + rubberband(raw - min, w) : raw); // 1:1, rubber-band ở biên
    d.hist.push({ x: e.clientX, t: e.timeStamp });
    d.hist = d.hist.filter(h => e.timeStamp - h.t < 100);
  };
  const onUp = () => {
    const d = drag.current; drag.current = null;
    if (!d?.active) return;
    setDragging(false);
    const a = d.hist[0], b = d.hist[d.hist.length - 1];
    const v = b.t - a.t > 8 ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0;
    const target = nearest(Math.min(0, Math.max(minX(), x.current + project(v)))); // chọn đích từ điểm dự phóng
    animateTo(target, v);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const s = [...new Set(snaps())].sort((a, b) => b - a), i = s.indexOf(nearest(x.current));
    animateTo(s[Math.max(0, Math.min(s.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)))], 0);
  };

  useEffect(() => {
    const ro = new ResizeObserver(() => { if (x.current < minX()) animateTo(minX(), 0); });
    ro.observe(view.current!);
    return () => { ro.disconnect(); stop.current?.(); };
  }, []);

  return (
    <div
      ref={view} tabIndex={0} role="region" aria-roledescription="carousel" data-reveal
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      onKeyDown={onKey} onDragStart={e => e.preventDefault()}
      onClickCapture={e => { if (moved.current) { e.stopPropagation(); e.preventDefault(); moved.current = false; } }}
      className={`overflow-hidden py-8 -my-8 select-none touch-pan-y ${dragging ? 'cursor-grabbing' : 'cursor-grab'} [&_img]:pointer-events-none ${className}`}
    >
      <div ref={track} className="relative flex gap-5 will-change-transform">
        {React.Children.map(children, c => <div className={`shrink-0 ${itemClassName}`}>{c}</div>)}
      </div>
    </div>
  );
};
