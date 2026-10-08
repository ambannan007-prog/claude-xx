import React from 'react';
import {staticFile} from 'remotion';
import {J_D, LOGO_SRC, RING_D, type Pt} from '../lib/paths';
import {SvgImage} from './SvgImage';

const LOGO = staticFile('jazara-logo.png');

type Props = {
  id: string;
  center: Pt;
  size: number;
  /** How much of the ring stroke has been painted (0–1). */
  ring: number;
  /** How much of the J stroke has been painted (0–1). */
  j: number;
  /** Final settle: unmasked artwork fades over the masked build. */
  full?: number;
  opacity?: number;
};

/**
 * Reveals the supplied logo artwork stroke-by-stroke. Wide masks trace the
 * centre-lines of the ring and the J, so what appears is always the real,
 * pixel-accurate logo — never a redraw.
 */
export const LogoReveal: React.FC<Props> = ({id, center, size, ring, j, full = 0, opacity = 1}) => {
  const s = size / LOGO_SRC;
  const tx = center[0] - (LOGO_SRC / 2) * s;
  const ty = center[1] - (LOGO_SRC / 2) * s;
  return (
    <g transform={`translate(${tx} ${ty}) scale(${s})`} opacity={opacity}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-60} y={-60} width={LOGO_SRC + 120} height={LOGO_SRC + 120}>
          {ring > 0.001 ? (
            <path
              d={RING_D}
              fill="none"
              stroke="#fff"
              strokeWidth={44}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${Math.min(1, ring)} 3`}
            />
          ) : null}
          {j > 0.001 ? (
            <path
              d={J_D}
              fill="none"
              stroke="#fff"
              strokeWidth={32}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${Math.min(1, j)} 3`}
            />
          ) : null}
        </mask>
      </defs>
      <SvgImage href={LOGO} x={0} y={0} width={LOGO_SRC} height={LOGO_SRC} mask={`url(#${id})`} />
      <SvgImage href={LOGO} x={0} y={0} width={LOGO_SRC} height={LOGO_SRC} opacity={full} />
    </g>
  );
};
