import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, W, H} from '../theme';

/**
 * The only ambient element: a very faint dot lattice that drifts at a different speed than the
 * foreground so the camera moves read as depth. Fades with `amount`.
 */
export const Lattice: React.FC<{amount?: number; drift?: number; spacing?: number; id?: string}> = ({
  amount = 1,
  drift = 0,
  spacing = 72,
  id = 'lat',
}) => {
  const ox = ((drift % spacing) + spacing) % spacing;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: amount}}>
      <defs>
        <pattern id={id} width={spacing} height={spacing} patternUnits="userSpaceOnUse" patternTransform={`translate(${-ox} 0)`}>
          <circle cx={spacing / 2} cy={spacing / 2} r={1.3} fill={C.ink} opacity={0.11} />
        </pattern>
        <radialGradient id={`${id}-fade`} cx="50%" cy="50%" r="62%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.15} />
          <stop offset="55%" stopColor="#fff" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}-m`}>
          <rect width={W} height={H} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} mask={`url(#${id}-m)`} />
    </svg>
  );
};

export const Paper: React.FC = () => <AbsoluteFill style={{background: C.bg}} />;

export const useLocal = () => useCurrentFrame();
