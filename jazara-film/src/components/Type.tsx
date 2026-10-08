import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, W} from '../theme';
import {ease, prog} from '../lib/ease';

type MaskLineProps = {
  text: string;
  /** vertical centre of the line */
  y: number;
  x?: number;
  size: number;
  weight?: number;
  color?: string;
  inAt: number;
  outAt?: number;
  inDur?: number;
  outDur?: number;
  /** letter-spacing in em, animates from -> to as the line settles */
  trackFrom?: number;
  trackTo?: number;
  align?: 'center' | 'left';
  lineHeight?: number;
  upper?: boolean;
  opacity?: number;
  /** direction the line travels when leaving */
  exit?: 'up' | 'down';
};

/**
 * Masked line reveal with tracking animation: text rises out of an invisible slot while its
 * letter-spacing settles. Used for every piece of typography so the film shares one voice.
 */
export const MaskLine: React.FC<MaskLineProps> = ({
  text,
  y,
  x = W / 2,
  size,
  weight = 600,
  color = C.ink,
  inAt,
  outAt,
  inDur = 30,
  outDur = 18,
  trackFrom = 0.1,
  trackTo = -0.035,
  align = 'center',
  lineHeight = 1.08,
  opacity = 1,
  exit = 'up',
}) => {
  const f = useCurrentFrame();
  const pin = prog(f, inAt, inDur, ease.out);
  const pout = outAt === undefined ? 0 : prog(f, outAt, outDur, ease.in);
  if (f < inAt - 1 || pout >= 1) return null;
  const ty = (1 - pin) * 112 + (exit === 'up' ? -pout * 112 : pout * 112);
  const ls = trackFrom + (trackTo - trackFrom) * pin + (outAt === undefined ? 0 : pout * 0.02);
  const h = size * lineHeight;
  const vis = Math.min(1, pin * 2.2) * (1 - pout * 0.6) * opacity;
  const shift = align === 'center' ? (ls * size) / 2 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'center' ? x - 1400 : x,
        width: align === 'center' ? 2800 : undefined,
        top: y - h / 2,
        height: h,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: size,
          fontWeight: weight,
          lineHeight: `${h}px`,
          color,
          letterSpacing: `${ls}em`,
          whiteSpace: 'pre',
          transform: `translate(${shift}px, ${ty}%)`,
          opacity: vis,
          fontFeatureSettings: '"tnum" 0, "ss01" 0, "cv11" 1',
          textTransform: 'none',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** small caption (labels, supporting copy): fades up with a hairline of motion */
export const Caption: React.FC<{
  text: string;
  x?: number;
  y: number;
  size?: number;
  weight?: number;
  color?: string;
  inAt: number;
  outAt?: number;
  tracking?: number;
  align?: 'center' | 'left' | 'right';
  opacity?: number;
}> = ({text, x = W / 2, y, size = 22, weight = 500, color = C.mute, inAt, outAt, tracking = 0.18, align = 'center', opacity = 1}) => {
  const f = useCurrentFrame();
  const pin = prog(f, inAt, 26, ease.out);
  const pout = outAt === undefined ? 0 : prog(f, outAt, 14, ease.in);
  if (f < inAt - 1 || pout >= 1) return null;
  const ty = (1 - pin) * 14 - pout * 8;
  const t = tracking + (1 - pin) * 0.12;
  const w = 1600;
  const left = align === 'center' ? x - w / 2 : align === 'left' ? x : x - w;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        width: w,
        top: y - size,
        height: size * 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: `${t}em`,
        color,
        opacity: pin * (1 - pout) * opacity,
        transform: `translate(${align === 'center' ? (t * size) / 2 : 0}px, ${ty}px)`,
        whiteSpace: 'pre',
      }}
    >
      {text}
    </div>
  );
};
