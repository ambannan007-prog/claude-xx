import React from 'react';
import {useCurrentFrame} from 'remotion';
import {E, mix, prog} from '../lib/anim';
import {COLORS, FONT_DISPLAY, FONT_TEXT} from '../theme';

type Align = 'left' | 'center' | 'right';

const anchor = (align: Align) =>
  align === 'center' ? 'translateX(-50%)' : align === 'right' ? 'translateX(-100%)' : undefined;

type HeadlineProps = {
  lines: React.ReactNode[];
  start: number;
  exit?: number;
  x: number;
  y: number;
  size?: number;
  weight?: number;
  color?: string;
  align?: Align;
  stagger?: number;
  /** Final tracking in em; the line arrives slightly wider and tightens into place. */
  tracking?: number;
  lineHeight?: number;
  /** Direction lines leave in on exit. */
  exitDir?: 1 | -1;
};

/**
 * Large display type. Each line rises from behind a mask while its tracking
 * tightens — the signature Apple-keynote headline move.
 */
export const Headline: React.FC<HeadlineProps> = ({
  lines,
  start,
  exit,
  x,
  y,
  size = 136,
  weight = 600,
  color = COLORS.ink,
  align = 'left',
  stagger = 4,
  tracking = -0.035,
  lineHeight = 1.12,
  exitDir = -1,
}) => {
  const f = useCurrentFrame();
  if (f < start - 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: anchor(align),
        textAlign: align,
        fontFamily: FONT_DISPLAY,
        fontWeight: weight,
        fontSize: size,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {lines.map((line, i) => {
        const p = prog(f, start + i * stagger, 28, E.out);
        const t = prog(f, start + i * stagger, 44, E.out);
        const q = exit === undefined ? 0 : prog(f, exit + i * 3, 16, E.in);
        const ty = (1 - p) * 108 + q * 108 * exitDir;
        return (
          <div key={i} style={{overflow: 'hidden', lineHeight, height: `${lineHeight}em`}}>
            <div
              style={{
                transform: `translateY(${ty}%)`,
                letterSpacing: `${mix(tracking + 0.05, tracking, t)}em`,
                opacity: Math.min(1, p * 1.6),
                filter: p < 1 ? `blur(${(1 - p) * 5}px)` : undefined,
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

type TextProps = {
  children: React.ReactNode;
  start: number;
  exit?: number;
  x: number;
  y: number;
  size?: number;
  weight?: number;
  color?: string;
  align?: Align;
  tracking?: number;
  uppercase?: boolean;
  font?: string;
  lineHeight?: number;
};

/** Supporting copy: a quiet fade-rise with a hint of focus pull. */
export const Caption: React.FC<TextProps> = ({
  children,
  start,
  exit,
  x,
  y,
  size = 30,
  weight = 400,
  color = COLORS.grey,
  align = 'left',
  tracking = -0.005,
  uppercase = false,
  font = FONT_TEXT,
  lineHeight = 1.35,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 26, E.out);
  const q = exit === undefined ? 0 : prog(f, exit, 14, E.in);
  if (p <= 0 || q >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `${anchor(align) ?? ''} translateY(${(1 - p) * 16 - q * 10}px)`,
        textAlign: align,
        opacity: p * (1 - q),
        filter: p < 1 ? `blur(${(1 - p) * 4}px)` : undefined,
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        color,
        letterSpacing: `${tracking}em`,
        textTransform: uppercase ? 'uppercase' : undefined,
        whiteSpace: 'pre',
      }}
    >
      {children}
    </div>
  );
};

/** Small uppercase interface label. */
export const Label: React.FC<Omit<TextProps, 'uppercase'>> = (props) => (
  <Caption size={15} weight={500} color={COLORS.mute} tracking={0.16} {...props} uppercase />
);

/** Turquoise arrow glyph used inside captions. */
export const Arrow: React.FC = () => (
  <span style={{color: COLORS.accentDeep, padding: '0 0.35em', fontWeight: 400}}>→</span>
);

type SwapItem = {start: number; content: React.ReactNode};

/**
 * A fixed slot whose contents roll upward through a mask, so successive values
 * appear to reorganise in place rather than cut.
 */
export const SwapSlot: React.FC<{items: SwapItem[]; exit?: number; height: number; dur?: number; style?: React.CSSProperties}> = ({
  items,
  exit,
  height,
  dur = 18,
  style,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'relative', height, width: 1400, overflow: 'hidden', ...style}}>
      {items.map((it, k) => {
        const pin = k === 0 ? prog(f, it.start, dur + 6, E.out) : prog(f, it.start, dur, E.inOut);
        const outAt = k < items.length - 1 ? items[k + 1].start : exit;
        const pout = outAt === undefined ? 0 : prog(f, outAt, dur, k < items.length - 1 ? E.inOut : E.in);
        if (pin <= 0 || pout >= 1) return null;
        const ty = (1 - pin) * 100 - pout * 100;
        const motion = Math.max(1 - pin, pout);
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translateY(${ty}%)`,
              opacity: 1 - motion * 0.6,
              filter: motion > 0.01 ? `blur(${motion * 6}px)` : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            {it.content}
          </div>
        );
      })}
    </div>
  );
};

/** Animated integer with tabular figures. */
export const CountUp: React.FC<{from: number; to: number; start: number; dur: number}> = ({from, to, start, dur}) => {
  const f = useCurrentFrame();
  const v = Math.round(mix(from, to, prog(f, start, dur, E.soft)));
  return <span style={{fontVariantNumeric: 'tabular-nums'}}>{v.toLocaleString('en-US')}</span>;
};
