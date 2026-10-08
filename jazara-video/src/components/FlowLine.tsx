import React from 'react';
import {COLORS} from '../theme';
import {sampler} from '../lib/paths';

type Props = {
  d: string;
  /** Normalised start of the visible segment. */
  from?: number;
  /** Normalised end (the travelling head). */
  to: number;
  width?: number;
  color?: string;
  opacity?: number;
  /** Radius of the luminous tip at the head; 0 hides it. */
  tip?: number;
};

/**
 * The brand's motion language: a single turquoise stroke that draws itself
 * along a path. Drawn via normalised dash offsets so any path animates evenly.
 */
export const FlowLine: React.FC<Props> = ({d, from = 0, to, width = 2, color = COLORS.accent, opacity = 1, tip = 0}) => {
  const a = Math.max(0, Math.min(from, to));
  const b = Math.min(1, to);
  if (b - a <= 0.0005 || opacity <= 0) return null;
  const head = tip > 0 ? sampler(d).at(b) : null;
  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${b - a} 3`}
        strokeDashoffset={-a}
      />
      {head && b < 1 ? (
        <>
          <circle cx={head.x} cy={head.y} r={tip * 3.2} fill={color} opacity={0.14} />
          <circle cx={head.x} cy={head.y} r={tip} fill={color} />
        </>
      ) : null}
    </g>
  );
};
