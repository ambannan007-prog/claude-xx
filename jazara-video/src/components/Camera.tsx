import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Pt} from '../lib/paths';

/**
 * A virtual camera over a world plane. `focus` is the world point placed at the
 * centre of the frame; `scale` is the zoom. Children are laid out in world units.
 */
export const Camera: React.FC<{focus: Pt; scale: number; children: React.ReactNode}> = ({focus, scale, children}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        transformOrigin: '0 0',
        transform: `translate(${960 - focus[0] * scale}px, ${540 - focus[1] * scale}px) scale(${scale})`,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

/** Project a world point through the camera into screen space. */
export const project = (p: Pt, focus: Pt, scale: number): Pt => [
  (p[0] - focus[0]) * scale + 960,
  (p[1] - focus[1]) * scale + 540,
];

/** Full-frame SVG with visible overflow, for drawing in world or screen units. */
export const Stage: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg
    width={1920}
    height={1080}
    viewBox="0 0 1920 1080"
    style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}
  >
    {children}
  </svg>
);
