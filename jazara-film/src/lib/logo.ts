import {W, H} from '../theme';

/** logo source space is 447x447; ink bbox ~ (56..389, 56..402) */
export const LOGO_SRC = 447;
export const LOGO_CENTER = {x: 222.5, y: 229}; // centre of the ink
/** where the logo's own stroke starts to draw (bottom-left of the loop) */
export const LOGO_START = {x: 124, y: 372};
/** tip of the long flick that leaves the J, pointing right: the exit of the intro */
export const LOGO_TIP = {x: 318, y: 212};

export type LogoPlace = {cx: number; cy: number; size: number};

/** map a logo-space point to screen space for a given placement (size = rendered width of the 447 square) */
export const logoToScreen = (p: {x: number; y: number}, place: LogoPlace) => {
  const k = place.size / LOGO_SRC;
  return {
    x: place.cx + (p.x - LOGO_CENTER.x) * k,
    y: place.cy + (p.y - LOGO_CENTER.y) * k,
  };
};

export const SCREEN_CENTER = {x: W / 2, y: H / 2};
