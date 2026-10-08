import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, W} from '../theme';
import {ease, prog} from '../lib/ease';

/** "Attention → Leads → Revenue": words and hand-drawn arrows reveal in sequence */
export const FlowCaption: React.FC<{words: string[]; y: number; inAt: number; outAt?: number; size?: number; accentLast?: boolean}> = ({
  words,
  y,
  inAt,
  outAt,
  size = 28,
  accentLast = true,
}) => {
  const f = useCurrentFrame();
  const pout = outAt === undefined ? 0 : prog(f, outAt, 14, ease.in);
  if (f < inAt - 1 || pout >= 1) return null;
  const items: React.ReactNode[] = [];
  words.forEach((w, i) => {
    const t0 = inAt + i * 9;
    const p = prog(f, t0, 22, ease.out);
    items.push(
      <div
        key={`w${i}`}
        style={{
          fontFamily: FONT,
          fontSize: size,
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: C.ink,
          opacity: p,
          transform: `translateY(${(1 - p) * 14}px)`,
          position: 'relative',
        }}
      >
        {w}
        {accentLast && i === words.length - 1 && (
          <span
            style={{
              position: 'absolute',
              left: 0,
              bottom: -9,
              height: 2,
              width: `${prog(f, t0 + 6, 20, ease.out) * 100}%`,
              background: C.teal,
              borderRadius: 2,
            }}
          />
        )}
      </div>,
    );
    if (i < words.length - 1) {
      const pa = prog(f, t0 + 5, 14, ease.out);
      items.push(
        <svg key={`a${i}`} width={64} height={20} viewBox="0 0 64 20" style={{margin: '0 26px', overflow: 'visible'}}>
          <path d="M2 10 H60" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.5} strokeDasharray={1} pathLength={1} strokeDashoffset={1 - pa} style={{strokeDasharray: 1, strokeDashoffset: 1 - pa}} />
          <path d="M52 3 L60 10 L52 17" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.5 * pa} />
        </svg>,
      );
    }
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: W,
        top: y - 30,
        height: 60,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 1 - pout,
        transform: `translateY(${-pout * 8}px)`,
      }}
    >
      {items}
    </div>
  );
};
