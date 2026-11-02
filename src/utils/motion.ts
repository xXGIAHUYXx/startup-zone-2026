/** Công thức từ SKILL.md: momentum projection, rubber-band, spring (damping + response). */
export const project = (v: number, d = 0.998) => ((v / 1000) * d) / (1 - d);

export const rubberband = (overshoot: number, dim: number, c = 0.55) =>
  (overshoot * dim * c) / (dim + c * Math.abs(overshoot));

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Spring bắt đầu từ giá trị hiện tại + vận tốc hiện tại; trả về hàm cancel (ngắt được bất cứ lúc nào). */
export function spring(
  from: number, to: number, velocity: number,
  opts: { response?: number; damping?: number },
  onUpdate: (x: number) => void
) {
  const { response = 0.4, damping = 1 } = opts;
  const k = (2 * Math.PI / response) ** 2;
  const c = 2 * damping * Math.sqrt(k);
  let x = from, v = velocity, last = performance.now(), raf = 0;
  const tick = (now: number) => {
    let dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    for (let i = 0; i < 4; i++) {
      const h = dt / 4;
      v += (-k * (x - to) - c * v) * h;
      x += v * h;
    }
    if (Math.abs(x - to) < 0.3 && Math.abs(v) < 8) return onUpdate(to);
    onUpdate(x);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
