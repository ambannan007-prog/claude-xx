export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const DURATION = 600;

export const C = {
  bg: '#FAFAF8',
  ink: '#111111',
  // sampled directly from the supplied Jazara logo
  teal: '#4FCBCD',
  tealDeep: '#2FB3B6',
  mute: 'rgba(17,17,17,0.42)',
  hair: 'rgba(17,17,17,0.10)',
};

export const FONT = `'Inter', 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif`;

/** Scene windows (frames @30fps). Scenes overlap by a few frames for match-cut transitions. */
export const T = {
  intro: [0, 96],
  perf: [84, 222],
  infl: [222, 366],
  sales: [366, 500],
  finale: [496, 600],
} as const;
