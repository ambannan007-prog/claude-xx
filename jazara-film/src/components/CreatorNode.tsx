import React from 'react';
import {C} from '../theme';

/** abstract creator: portrait placeholder (head + shoulders) in a circle. No logos, no faces. */
export const CreatorNode: React.FC<{
  x: number;
  y: number;
  r: number;
  opacity?: number;
  /** 0..1 how much the node is "selected" (ink ring) */
  select?: number;
  /** 0..1 turquoise ring for a perfect match */
  match?: number;
  pulse?: number;
  tone?: number;
}> = ({x, y, r, opacity = 1, select = 0, match = 0, pulse = 0, tone = 0}) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    {pulse > 0 && pulse < 1 && (
      <circle r={r + 6 + pulse * 34} fill="none" stroke={C.teal} strokeWidth={1.6} opacity={(1 - pulse) * 0.8} />
    )}
    <circle r={r} fill="#F1F1EC" stroke={C.ink} strokeOpacity={0.12 + 0.55 * select} strokeWidth={1.3 + 0.4 * select} />
    <circle cy={-r * 0.2} r={r * 0.27} fill={C.ink} opacity={0.26 + tone * 0.12} />
    <ellipse cy={r * 0.58} rx={r * 0.5} ry={r * 0.3} fill={C.ink} opacity={0.2 + tone * 0.1} />
    {match > 0 && <circle r={r + 7} fill="none" stroke={C.teal} strokeWidth={2} strokeDasharray={`${match * 2 * Math.PI * (r + 7)} 999`} transform="rotate(-90)" strokeLinecap="round" />}
  </g>
);
