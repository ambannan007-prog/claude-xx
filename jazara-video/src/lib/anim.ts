import {Easing, interpolate, spring} from 'remotion';

/** Curated curves. Expo-style outs for arrivals, symmetric in-outs for camera moves. */
export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0, 0.2, 1),
  camera: Easing.bezier(0.6, 0, 0.25, 1),
  linear: Easing.linear,
};

/** 0→1 progress of a window starting at `start` lasting `dur` frames. */
export const prog = (frame: number, start: number, dur: number, ease: (t: number) => number = E.out) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Physically-based arrival with a gentle overshoot. */
export const pop = (frame: number, start: number, stiffness = 170, damping = 15) =>
  spring({frame: frame - start, fps: 30, config: {stiffness, damping, mass: 0.8}});

/** Deterministic pseudo-random in [0,1). */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
