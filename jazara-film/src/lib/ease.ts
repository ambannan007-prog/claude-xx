import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../theme';

export const ease = {
  /** long, confident deceleration (expo-like) */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** symmetrical, used for camera moves */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** gentle, almost linear with soft ends */
  soft: Easing.bezier(0.4, 0, 0.2, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** apple-ish "settle" */
  settle: Easing.bezier(0.22, 1, 0.36, 1),
  linear: (t: number) => t,
};

export type EaseFn = (t: number) => number;

/** clamped 0..1 progress of `frame` through [start, start+dur] */
export const prog = (frame: number, start: number, dur: number, e: EaseFn = ease.inOut) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    easing: e,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const sp = (
  frame: number,
  start: number,
  config: Partial<{damping: number; stiffness: number; mass: number}> = {},
) =>
  spring({
    frame: frame - start,
    fps: FPS,
    config: {damping: 24, stiffness: 140, mass: 1, ...config},
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const map = (v: number, a: number, b: number, c: number, d: number, e?: EaseFn) => {
  const t = clamp((v - a) / (b - a));
  return lerp(c, d, e ? e(t) : t);
};

export const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** pure hash -> 0..1 so per-index randomness is stable across frames */
export const hash = (n: number, salt = 0) => {
  const x = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
