import React from 'react';
import {COLORS, FONT_TEXT} from '../theme';

/**
 * The conversion point that becomes the brand hub. `open` morphs it from a
 * solid turquoise dot (0) into a white disc with a turquoise ring (1).
 */
export const BrandNode: React.FC<{x: number; y: number; r: number; open: number; label?: number}> = ({x, y, r, open, label = 0}) => {
  if (r <= 0.05) return null;
  const inner = Math.max(0, open * (r - 2));
  return (
    <g transform={`translate(${x} ${y})`}>
      {open > 0.2 ? <circle r={r + 18} fill={COLORS.accent} opacity={0.06 * open} /> : null}
      <circle r={r} fill={COLORS.accent} />
      {inner > 0 ? <circle r={inner} fill={COLORS.card} /> : null}
      {label > 0 ? (
        <text
          y={6}
          textAnchor="middle"
          fontFamily={FONT_TEXT}
          fontWeight={600}
          fontSize={16}
          letterSpacing="0.18em"
          fill={COLORS.ink}
          opacity={label}
          style={{textTransform: 'uppercase'}}
          dx="0.09em"
        >
          Brand
        </text>
      ) : null}
    </g>
  );
};
