import React from 'react';
import {useCurrentFrame} from 'remotion';
import {E, mix, prog} from '../lib/anim';
import {COLORS, FONT_DISPLAY, FONT_TEXT} from '../theme';

/** JAZARA / MEDIA GROUP lockup. Letters settle from wide tracking into place. */
export const Wordmark: React.FC<{x: number; y: number; start: number; scale?: number; opacity?: number}> = ({
  x,
  y,
  start,
  scale = 1,
  opacity = 1,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 30, E.out);
  const t = prog(f, start, 50, E.out);
  const p2 = prog(f, start + 8, 30, E.out);
  if (p <= 0) return null;
  const big = mix(0.62, 0.42, t);
  const small = mix(0.9, 0.62, prog(f, start + 8, 50, E.out));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: '50% 0',
        textAlign: 'center',
        opacity,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{overflow: 'hidden', height: 56}}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 44,
            lineHeight: '56px',
            color: COLORS.ink,
            letterSpacing: `${big}em`,
            paddingLeft: `${big}em`,
            transform: `translateY(${(1 - p) * 100}%)`,
            filter: p < 1 ? `blur(${(1 - p) * 4}px)` : undefined,
          }}
        >
          JAZARA
        </div>
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: FONT_TEXT,
          fontWeight: 500,
          fontSize: 15,
          color: COLORS.grey,
          letterSpacing: `${small}em`,
          paddingLeft: `${small}em`,
          opacity: p2,
        }}
      >
        MEDIA GROUP
      </div>
    </div>
  );
};
