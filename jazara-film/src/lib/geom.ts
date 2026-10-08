export type Pt = {x: number; y: number};

export const pt = (x: number, y: number): Pt => ({x, y});
export const mixPt = (a: Pt, b: Pt, t: number): Pt => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t});

export const bez3 = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt => {
  const k = 1 - u;
  const a = k * k * k, b = 3 * k * k * u, c = 3 * k * u * u, d = u * u * u;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
};

export const sample = (fn: (u: number) => Pt, n = 120): Pt[] =>
  Array.from({length: n + 1}, (_, i) => fn(i / n));

export const toD = (pts: Pt[]) =>
  pts.length ? 'M' + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('L') : '';

/** polyline arc-length helpers (cheap, allocation-light) */
export const cumLengths = (pts: Pt[]) => {
  const l = [0];
  for (let i = 1; i < pts.length; i++) l.push(l[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return l;
};

export const pointAt = (pts: Pt[], lens: number[], u: number): Pt => {
  const target = Math.min(1, Math.max(0, u)) * lens[lens.length - 1];
  let lo = 0, hi = lens.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lens[mid] < target) lo = mid; else hi = mid;
  }
  const span = lens[hi] - lens[lo] || 1;
  return mixPt(pts[lo], pts[hi], (target - lens[lo]) / span);
};

/** slice of a polyline between arc-length fractions a..b */
export const slice = (pts: Pt[], lens: number[], a: number, b: number, steps = 60): Pt[] => {
  if (b <= a) return [];
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) out.push(pointAt(pts, lens, a + ((b - a) * i) / steps));
  return out;
};

export const tangentAt = (pts: Pt[], lens: number[], u: number): Pt => {
  const p = pointAt(pts, lens, Math.max(0, u - 0.004));
  const q = pointAt(pts, lens, Math.min(1, u + 0.004));
  const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
  return {x: (q.x - p.x) / d, y: (q.y - p.y) / d};
};

/** centripetal-ish Catmull-Rom through points, sampled to a polyline */
export const catmull = (p: Pt[], per = 28): Pt[] => {
  const out: Pt[] = [];
  const n = p.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(n - 1, i + 2)];
    for (let s = 0; s < per; s++) {
      const t = s / per, t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(p[n - 1]);
  return out;
};
