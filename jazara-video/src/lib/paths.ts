import {getLength, getPointAtLength} from '@remotion/paths';
import {clamp01, mix} from './anim';

export type Pt = [number, number];

const n2 = (v: number) => v.toFixed(2);

/** Smooth Catmull-Rom spline through the points, emitted as cubic Béziers. */
export const catmull = (pts: Pt[]): string => {
  let d = `M ${n2(pts[0][0])} ${n2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${n2(c1x)} ${n2(c1y)} ${n2(c2x)} ${n2(c2y)} ${n2(p2[0])} ${n2(p2[1])}`;
  }
  return d;
};

export type Sample = {x: number; y: number; angle: number};
export type Sampler = {
  d: string;
  length: number;
  /** Point at normalised arc length t ∈ [0,1]. */
  at: (t: number) => Sample;
  /** Normalised arc length of the first sample whose x passes the given value. */
  tAtX: (x: number) => number;
};

const cache = new Map<string, Sampler>();

/** Arc-length lookup table for a path, so per-frame queries stay cheap. */
export const sampler = (d: string, n = 900): Sampler => {
  const hit = cache.get(d);
  if (hit) return hit;
  const length = getLength(d);
  const pts = Array.from({length: n + 1}, (_, i) => getPointAtLength(d, (length * i) / n) ?? {x: 0, y: 0});
  const at = (t: number): Sample => {
    const x = clamp01(t) * n;
    const i = Math.min(n - 1, Math.floor(x));
    const f = x - i;
    const a = pts[i];
    const b = pts[i + 1];
    return {x: mix(a.x, b.x, f), y: mix(a.y, b.y, f), angle: Math.atan2(b.y - a.y, b.x - a.x)};
  };
  const tAtX = (x: number) => {
    const i = pts.findIndex((p) => p.x >= x);
    return i < 0 ? 1 : i / n;
  };
  const s = {d, length, at, tAtX};
  cache.set(d, s);
  return s;
};

/* ------------------------------------------------------------------ */
/* Jazara logo geometry (in the 447×447 pixel space of the source PNG) */
/* These centre-lines drive the stroke-by-stroke reveal of the real    */
/* logo artwork; the artwork itself is never redrawn.                  */
/* ------------------------------------------------------------------ */

export const LOGO_SRC = 447;
export const RING_C: Pt = [222.5, 230];
export const RING_R = 160;

/** Ring traced from the bottom, sweeping right → top → left → bottom (+overlap). */
export const ringPoints = (n = 56, overlapDeg = 14): Pt[] =>
  Array.from({length: n + 1}, (_, i) => {
    const a = ((90 - ((360 + overlapDeg) * i) / n) * Math.PI) / 180;
    return [RING_C[0] + RING_R * Math.cos(a), RING_C[1] + RING_R * Math.sin(a)];
  });

/** The single calligraphic J stroke: hook → ascender loop → descender → crossbar. */
export const J_POINTS: Pt[] = [
  [203, 237], [192, 226], [187, 208], [190, 188], [198, 165], [212, 140], [232, 112],
  [255, 88], [280, 68], [302, 58], [318, 58], [327, 68], [329, 88], [325, 115],
  [316, 150], [305, 185], [294, 215], [280, 250], [262, 290], [240, 330], [215, 365],
  [190, 388], [160, 399], [135, 394], [120, 378], [118, 352], [128, 328], [148, 305],
  [178, 277], [220, 254], [262, 236], [295, 223], [318, 211],
];

export const RING_D = catmull(ringPoints());
export const J_D = catmull(J_POINTS);

export const logoToWorld = (p: Pt, center: Pt, size: number): Pt => [
  center[0] + ((p[0] - LOGO_SRC / 2) * size) / LOGO_SRC,
  center[1] + ((p[1] - LOGO_SRC / 2) * size) / LOGO_SRC,
];
