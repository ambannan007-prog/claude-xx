import React from 'react';
import {C} from '../theme';
import {Pt, toD} from '../lib/geom';

/** the film's recurring turquoise stroke */
export const FlowLine: React.FC<{
  pts: Pt[];
  width?: number;
  color?: string;
  opacity?: number;
  dash?: string;
}> = ({pts, width = 2.5, color = C.teal, opacity = 1, dash}) =>
  pts.length > 1 ? (
    <path
      d={toD(pts)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      strokeDasharray={dash}
    />
  ) : null;
