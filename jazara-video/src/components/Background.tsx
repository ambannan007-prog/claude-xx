import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS} from '../theme';

/** Warm paper with a barely-there falloff toward the edges to give the frame depth. */
export const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.paper,
      backgroundImage:
        'radial-gradient(ellipse 75% 70% at 50% 46%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 62%), radial-gradient(ellipse 120% 110% at 50% 50%, rgba(0,0,0,0) 60%, rgba(40,40,30,0.045) 100%)',
    }}
  />
);
