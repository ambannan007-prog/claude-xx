export const VIDEO = {width: 1920, height: 1080, fps: 30, durationInFrames: 600} as const;

/** Brand palette. ~80% paper, ~15% ink, ~5% turquoise. */
export const COLORS = {
  paper: '#FAFAF8',
  ink: '#111111',
  grey: '#6E6E73',
  mute: '#A1A1A6',
  faint: '#C9C9C4',
  hair: '#E4E4DF',
  card: '#FFFFFF',
  /** Sampled directly from the supplied Jazara logo (median stroke pixel). */
  accent: '#65D0D2',
  /** Slightly deeper turquoise, used only where the accent sits on small text. */
  accentDeep: '#3DB9BC',
} as const;

export const FONT_TEXT = "'Inter', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif";
export const FONT_DISPLAY = "'Inter Display', 'Inter', 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Shared layout grid for the three service headlines. */
export const LAYOUT = {
  marginX: 150,
  headlineTop: 330,
  headlineSize: 136,
  captionTop: 680,
} as const;
