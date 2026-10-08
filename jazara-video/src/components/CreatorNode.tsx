import React from 'react';
import {COLORS} from '../theme';

type Props = {
  id: string;
  x: number;
  y: number;
  size: number;
  scale: number;
  opacity: number;
  /** Fraction of the audience ring this creator commands (0–1). */
  audience: number;
  /** 0 = neutral, 1 = shortlisted (ink outline). */
  shortlist: number;
  /** 0 = neutral, 1 = perfect match (turquoise). */
  match: number;
};

/** Abstract creator: portrait placeholder, audience arc and selection state. */
export const CreatorNode: React.FC<Props> = ({id, x, y, size, scale, opacity, audience, shortlist, match}) => {
  if (opacity <= 0.001 || scale <= 0.001) return null;
  const arcColor = match > 0.5 ? COLORS.accent : COLORS.faint;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <circle r={size + 10} fill="none" stroke={COLORS.hair} strokeWidth={1.5} />
      <circle
        r={size + 10}
        fill="none"
        stroke={arcColor}
        strokeWidth={2}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${audience * (1 + match * 0.4)} 3`}
        transform="rotate(-90)"
      />
      <clipPath id={id}>
        <circle r={size} />
      </clipPath>
      <circle r={size} fill="#EFEFEB" />
      <g clipPath={`url(#${id})`}>
        <circle cy={-size * 0.2} r={size * 0.32} fill="#D6D6D1" />
        <ellipse cy={size * 0.78} rx={size * 0.62} ry={size * 0.5} fill="#D6D6D1" />
      </g>
      {shortlist > 0 ? <circle r={size} fill="none" stroke={COLORS.ink} strokeWidth={1.6} opacity={shortlist * (1 - match)} /> : null}
      {match > 0 ? <circle r={size} fill="none" stroke={COLORS.accent} strokeWidth={3} opacity={match} /> : null}
    </g>
  );
};
